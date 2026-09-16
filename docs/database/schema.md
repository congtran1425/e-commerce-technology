# Database schema

Database đã được chọn là PostgreSQL và ORM là Prisma theo [ADR 0003](../decisions/0003-postgresql-prisma.md).

Migration Prisma là nguồn sự thật có thể thực thi. File này giải thích entity, quan hệ, ràng buộc quan trọng và lý do thiết kế; không sao chép toàn bộ schema theo cách dễ bị lệch khỏi migration.

Mọi thay đổi schema phải đi kèm migration, cập nhật tài liệu và đánh giá ảnh hưởng đến API.

## Lược đồ lát cắt công thức

- `recipes` và `recipe_steps`: dữ liệu công thức có cấu trúc, loại bánh, định lượng gốc, đơn vị thành phẩm (`người`, `phần`, `cái`, `ổ bánh`), thời gian, nhiệt độ, độ khó và từng bước làm theo thứ tự.
- `ingredients` và `recipe_ingredients`: nguyên liệu chuẩn cùng định lượng cho khẩu phần gốc.
- `tools` và `recipe_tools`: dụng cụ bắt buộc hoặc tùy chọn của công thức.
- `products` và `product_variants`: mặt hàng cùng từng quy cách bán, giá và tồn kho.
- `ingredient_variants`: ánh xạ một nguyên liệu sang các quy cách có thể mua.
- `tool_variants`: ánh xạ một dụng cụ trong công thức sang biến thể có thể mua.

Khóa chính dùng `BIGINT`; API chuyển chúng thành chuỗi trước khi trả JSON. Định lượng và tiền dùng kiểu `DECIMAL`, không dùng số thực. Các migration có ràng buộc kiểm tra để định lượng, khẩu phần và quy cách luôn dương; giá và tồn kho không âm.

Thuật toán gợi ý quy cách không nằm trong database. Backend lọc biến thể còn bán/còn hàng rồi chọn theo thứ tự: đủ định lượng → tổng giá thấp nhất → ít dư → ít gói.

Dữ liệu Word ban đầu có công thức tính theo phần, cái và ổ bánh nên `recipes.yield_unit` không được mặc định diễn giải mọi `base_servings` là số người. Chi tiết chuẩn hóa và phần còn thiếu nằm tại [tài liệu nhập công thức](../data/recipe-import.md).

## Giỏ tạm trong giai đoạn đầu

Chưa có bảng `carts` hay `cart_items`. Giỏ tạm được lưu có phiên bản trong `localStorage` của trình duyệt để khách chưa đăng nhập có thể bám theo luồng công thức. Mỗi khi mở trang giỏ hoặc điều chỉnh số lượng, backend đọc `product_variants` và `products` để báo giá lại qua `POST /api/cart/quote`.

Lớp báo giá này không ghi database và không giữ tồn kho. Khi có đăng nhập, đơn hàng và thanh toán, quyết định tạo giỏ/đơn và trừ kho phải được thi hành trong transaction (giao dịch) phía backend; không được tin giá hoặc tồn kho từ trình duyệt.

## Tài khoản và phiên đăng nhập

- `users`: email đã chuẩn hóa chữ thường, tên hiển thị, số điện thoại tùy chọn, mật khẩu đã băm, vai trò và trạng thái hoạt động. Vai trò mới tạo luôn do backend đặt là `CUSTOMER`; client không được gửi vai trò.
- `sessions`: mỗi dòng là một phiên trên một thiết bị, gồm khóa ngoại `user_id`, bản băm `token_hash` và `expires_at` có múi giờ.
- `sessions.user_id` và `sessions.expires_at` có chỉ mục riêng; `token_hash` có chỉ mục duy nhất để tìm một phiên mà không quét toàn bảng.
- Xóa người dùng sẽ xóa các phiên liên quan. Khóa tài khoản làm mọi phiên hiện có không còn xác thực được dù dòng phiên chưa bị dọn.

Mật khẩu dùng Argon2id; mã phiên chỉ lưu dưới dạng SHA-256. API chuyển `BIGINT` của người dùng thành chuỗi khi trả JSON.

## Sổ địa chỉ khách hàng

- `customer_addresses` lưu tên gợi nhớ, người nhận, số điện thoại và các phần địa chỉ thường dùng. Mỗi dòng luôn thuộc đúng một `user`; xóa người dùng sẽ xóa sổ địa chỉ của họ.
- Chỉ mục `(user_id, created_at)` phục vụ việc đọc sổ theo tài khoản. Chỉ mục duy nhất có điều kiện trên `user_id WHERE is_default = true` bảo đảm một khách không thể có hai địa chỉ mặc định, kể cả khi có hai yêu cầu đồng thời.
- Backend tự đặt địa chỉ đầu tiên làm mặc định. Khi khách chọn mặc định mới, thao tác bỏ cờ cũ và đặt cờ mới nằm trong một giao dịch ngắn. Nếu xóa địa chỉ mặc định, địa chỉ được cập nhật gần nhất còn lại được chọn thay thế.
- Sổ địa chỉ là dữ liệu điền trước, không phải nguồn tham chiếu sống của đơn hàng. `orders` vẫn lưu ảnh chụp nơi nhận độc lập để việc sửa hoặc xóa địa chỉ không viết lại lịch sử giao dịch.
- Số điện thoại được chuẩn hóa bỏ khoảng trắng, dấu chấm và gạch ngang trước khi lưu; ràng buộc database chỉ chấp nhận dạng Việt Nam bắt đầu bằng `0` hoặc `+84`.

## Đơn hàng, giữ tồn kho và thanh toán

- `orders`: một ảnh chụp bất biến tương đối của người mua, địa chỉ nhận, tiền hàng, phí vận chuyển và tổng tiền tại lúc đặt. `idempotency_key` là mã chống tạo trùng do frontend sinh cho một lần bấm thanh toán.
- `order_items`: lưu tên sản phẩm, mã hàng, nhãn quy cách, đơn giá và thành tiền tại lúc mua. Khóa ngoại đến `product_variants` được phép rỗng để lịch sử đơn vẫn đọc được nếu biến thể sau này bị xóa.
- `payments`: lưu từng lần thanh toán, mã giao dịch phía cửa hàng, trạng thái, số tiền và dữ liệu phản hồi tối thiểu từ nhà cung cấp. Khóa bí mật và toàn bộ nội dung callback không được lưu vào bảng này.

Hiện mỗi lần tạo đơn sinh một lần thanh toán ZaloPay. Mô hình vẫn tách `payments` khỏi `orders` để có thể hỗ trợ thử lại thanh toán hoặc nhà cung cấp khác mà không làm mất lịch sử.

Khi tạo đơn, backend khóa logic bằng phép cập nhật có điều kiện `stock_quantity >= quantity`, trừ kho và tạo `order`/`order_items`/`payment` trong cùng một giao dịch ngắn. Các biến thể được xử lý theo thứ tự mã tăng dần để giảm nguy cơ khóa chéo. Nếu không đủ hàng hoặc không tạo được giao dịch ZaloPay, backend đổi trạng thái đơn và hoàn lại chính xác phần tồn kho đã giữ. Các thao tác hoàn kho và xác nhận thanh toán đều có điều kiện trạng thái để callback gửi lặp không làm cộng hoặc trừ kho nhiều lần.

Các ràng buộc database bảo đảm số lượng mặt hàng dương, tiền không âm và không có phần lẻ với VND, `line_total = unit_price × quantity`, `total = subtotal + shipping_fee`, tiền tệ hiện là `VND`, và mã giao dịch cửa hàng là duy nhất. Chỉ mục được đặt trên khóa ngoại cùng các cặp trường dùng để tìm đơn, giao dịch chờ và tác vụ đối soát. Chỉ mục `(user_id, id)` phục vụ lịch sử đơn mới nhất theo từng khách mà không cần bỏ qua số lượng lớn bản ghi.

## Sổ biến động tồn kho

`product_variants.stock_quantity` là số dư hiện tại để kiểm tra mua hàng nhanh. `inventory_movements` là sổ giải thích mọi lần số dư thay đổi, gồm biến thể, lượng tăng/giảm, số dư trước–sau, lý do, thời điểm và liên kết tùy chọn đến quản trị viên hoặc đơn hàng.

- `INITIAL_STOCK`, `RESTOCK`, `CORRECTION`, `DAMAGED` và `RETURNED` ghi các thao tác quản trị.
- `ORDER_RESERVED` ghi lần trừ kho khi tạo đơn; `ORDER_RELEASED` ghi lần hoàn kho khi giao dịch không hoàn tất.
- Ràng buộc kiểm tra buộc lượng thay đổi khác 0, số dư không âm và `stock_after = stock_before + quantity_delta`.
- Chỉ mục `(product_variant_id, created_at)` phục vụ trang sổ kho gần nhất; các khóa ngoại đến người dùng và đơn hàng cũng có chỉ mục.

Backend cập nhật số dư và thêm dòng sổ kho trong cùng một giao dịch ngắn. Giao diện không có API ghi đè trực tiếp `stock_quantity`; điều chỉnh thủ công phải gửi lượng chênh lệch và lý do. Cách này tạo khả năng truy vết nhưng chưa phải hệ thống kế toán kho đầy đủ: chưa quản lý lô hàng, giá vốn, vị trí kho hoặc kiểm kê nhiều bước.

Migration mở sổ tạo một dòng `INITIAL_STOCK` cho mỗi biến thể đã có số dư trước khi chức năng này tồn tại. Dòng chuyển đổi không có người thao tác; các sản phẩm hoặc quy cách tạo sau đó ghi người quản trị ngay trong giao dịch tạo dữ liệu.
