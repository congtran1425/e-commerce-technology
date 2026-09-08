# Database schema

Database đã được chọn là PostgreSQL và ORM là Prisma theo [ADR 0003](../decisions/0003-postgresql-prisma.md).

Migration Prisma là nguồn sự thật có thể thực thi. File này giải thích entity, quan hệ, ràng buộc quan trọng và lý do thiết kế; không sao chép toàn bộ schema theo cách dễ bị lệch khỏi migration.

Mọi thay đổi schema phải đi kèm migration, cập nhật tài liệu và đánh giá ảnh hưởng đến API.

## Lược đồ lát cắt công thức

- `recipes` và `recipe_steps`: dữ liệu công thức có cấu trúc, khẩu phần gốc, thời gian, nhiệt độ, độ khó và từng bước làm theo thứ tự.
- `ingredients` và `recipe_ingredients`: nguyên liệu chuẩn cùng định lượng cho khẩu phần gốc.
- `tools` và `recipe_tools`: dụng cụ bắt buộc hoặc tùy chọn của công thức.
- `products` và `product_variants`: mặt hàng cùng từng quy cách bán, giá và tồn kho.
- `ingredient_variants`: ánh xạ một nguyên liệu sang các quy cách có thể mua.
- `tool_variants`: ánh xạ một dụng cụ trong công thức sang biến thể có thể mua.

Khóa chính dùng `BIGINT`; API chuyển chúng thành chuỗi trước khi trả JSON. Định lượng và tiền dùng kiểu `DECIMAL`, không dùng số thực. Các migration có ràng buộc kiểm tra để định lượng, khẩu phần và quy cách luôn dương; giá và tồn kho không âm.

Thuật toán gợi ý quy cách không nằm trong database. Backend lọc biến thể còn bán/còn hàng rồi chọn theo thứ tự: đủ định lượng → tổng giá thấp nhất → ít dư → ít gói.

## Giỏ tạm trong giai đoạn đầu

Chưa có bảng `carts` hay `cart_items`. Giỏ tạm được lưu có phiên bản trong `localStorage` của trình duyệt để khách chưa đăng nhập có thể bám theo luồng công thức. Mỗi khi mở trang giỏ hoặc điều chỉnh số lượng, backend đọc `product_variants` và `products` để báo giá lại qua `POST /api/cart/quote`.

Lớp báo giá này không ghi database và không giữ tồn kho. Khi có đăng nhập, đơn hàng và thanh toán, quyết định tạo giỏ/đơn và trừ kho phải được thi hành trong transaction (giao dịch) phía backend; không được tin giá hoặc tồn kho từ trình duyệt.

## Tài khoản và phiên đăng nhập

- `users`: email đã chuẩn hóa chữ thường, tên hiển thị, mật khẩu đã băm, vai trò và trạng thái hoạt động. Vai trò mới tạo luôn do backend đặt là `CUSTOMER`; client không được gửi vai trò.
- `sessions`: mỗi dòng là một phiên trên một thiết bị, gồm khóa ngoại `user_id`, bản băm `token_hash` và `expires_at` có múi giờ.
- `sessions.user_id` và `sessions.expires_at` có chỉ mục riêng; `token_hash` có chỉ mục duy nhất để tìm một phiên mà không quét toàn bảng.
- Xóa người dùng sẽ xóa các phiên liên quan. Khóa tài khoản làm mọi phiên hiện có không còn xác thực được dù dòng phiên chưa bị dọn.

Mật khẩu dùng Argon2id; mã phiên chỉ lưu dưới dạng SHA-256. API chuyển `BIGINT` của người dùng thành chuỗi khi trả JSON.

## Đơn hàng, giữ tồn kho và thanh toán

- `orders`: một ảnh chụp bất biến tương đối của người mua, địa chỉ nhận, tiền hàng, phí vận chuyển và tổng tiền tại lúc đặt. `idempotency_key` là mã chống tạo trùng do frontend sinh cho một lần bấm thanh toán.
- `order_items`: lưu tên sản phẩm, mã hàng, nhãn quy cách, đơn giá và thành tiền tại lúc mua. Khóa ngoại đến `product_variants` được phép rỗng để lịch sử đơn vẫn đọc được nếu biến thể sau này bị xóa.
- `payments`: lưu từng lần thanh toán, mã giao dịch phía cửa hàng, trạng thái, số tiền và dữ liệu phản hồi tối thiểu từ nhà cung cấp. Khóa bí mật và toàn bộ nội dung callback không được lưu vào bảng này.

Hiện mỗi lần tạo đơn sinh một lần thanh toán ZaloPay. Mô hình vẫn tách `payments` khỏi `orders` để có thể hỗ trợ thử lại thanh toán hoặc nhà cung cấp khác mà không làm mất lịch sử.

Khi tạo đơn, backend khóa logic bằng phép cập nhật có điều kiện `stock_quantity >= quantity`, trừ kho và tạo `order`/`order_items`/`payment` trong cùng một giao dịch ngắn. Các biến thể được xử lý theo thứ tự mã tăng dần để giảm nguy cơ khóa chéo. Nếu không đủ hàng hoặc không tạo được giao dịch ZaloPay, backend đổi trạng thái đơn và hoàn lại chính xác phần tồn kho đã giữ. Các thao tác hoàn kho và xác nhận thanh toán đều có điều kiện trạng thái để callback gửi lặp không làm cộng hoặc trừ kho nhiều lần.

Các ràng buộc database bảo đảm số lượng mặt hàng dương, tiền không âm và không có phần lẻ với VND, `line_total = unit_price × quantity`, `total = subtotal + shipping_fee`, tiền tệ hiện là `VND`, và mã giao dịch cửa hàng là duy nhất. Chỉ mục được đặt trên khóa ngoại cùng các cặp trường dùng để tìm đơn, giao dịch chờ và tác vụ đối soát.
