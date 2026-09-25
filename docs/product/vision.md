# Tầm nhìn và phạm vi sản phẩm

Trạng thái: Đã chấp nhận
Cập nhật: 2026-09-25

## Đối tượng

Sản phẩm phục vụ người Việt muốn tự làm bánh tại nhà, từ người mới cần hướng dẫn rõ ràng đến người đã có kinh nghiệm muốn chuẩn bị nguyên liệu nhanh và chính xác.

## Giá trị cốt lõi

Thay vì buộc khách tự tìm từng món hàng, hệ thống bắt đầu từ món bánh họ muốn làm:

```text
chọn món bánh
→ chọn khẩu phần
→ hệ thống tính định lượng cần thiết
→ xem nguyên liệu và dụng cụ phù hợp
→ bỏ những món đã có hoặc đổi lựa chọn
→ thêm hàng loạt vào giỏ
→ thanh toán
```

## Trải nghiệm nội dung

Website vừa là nơi mua sắm vừa là nơi đọc. Công thức chứa dữ liệu có cấu trúc như khẩu phần, định lượng, thời gian, nhiệt độ, độ khó và các bước làm. Bài viết mở rộng câu chuyện về nguồn gốc món bánh, nguyên liệu, kỹ thuật và kiến thức liên quan.

`Recipe` và `Article` là hai mô hình nội dung riêng, dù trang công thức có thể được trình bày giàu tính biên tập như một bài viết.

## Quyết định sản phẩm đã chốt

**Cập nhật tài khoản và công thức (17–18-09-2026):** Xác minh email là bắt buộc ngay sau đăng ký, trước khi đăng nhập/đặt hàng; hỗ trợ quên và đặt lại mật khẩu bằng email. Bản Tiramisu đầu tiên dự kiến theo công thức nguyên gốc Le Beccherie, nhưng **tạm giữ biến thể hiện tại** đến khi chốt nguyên liệu và an toàn trứng; không gọi biến thể này là bản gốc và chưa thêm hướng dẫn từng bước chưa khớp nguyên liệu. Công thức hiện mang tên “Bánh mì sữa Hokkaido” sẽ giữ định lượng nhưng đổi tên “Bánh mì sữa mềm” để không ngụ ý dùng kỹ thuật tangzhong. Công thức chưa thử bếp vẫn được hiển thị, không gắn nhãn “đang thử nghiệm”; việc hiển thị không có nghĩa là đã kiểm chứng thành phẩm, do đó nội dung không được tuyên bố chắc chắn về kết quả chưa đo được.

- Tên thương hiệu chính thức là `Một Mẻ Bánh`. Tên repository và định danh kỹ thuật không bắt buộc đổi theo thương hiệu. Logo vẽ tay do chủ dự án cung cấp được dùng cho giao diện; bản nền trong suốt là tài sản dẫn xuất để hiển thị trên web.
- Tên miền frontend production là `bepdubanh.congtc145.id.vn`; tên miền backend chính thức chưa chốt.
- Nội dung có ba lớp: câu chuyện thương hiệu, câu chuyện ngắn đi cùng từng công thức và bài viết chuyên sâu. Không nhập ba lớp này thành một loại nội dung duy nhất.
- Ưu tiên giỏ hàng động theo công thức; bộ nguyên liệu đóng gói sẵn là giai đoạn sau.
- Công thức được chuẩn hóa theo khẩu phần và có đơn vị tính toán được.
- Sản phẩm bán theo biến thể đóng gói cố định; hệ thống không bán lượng lẻ theo đúng số gram của công thức.
- Khi gợi ý quy cách, hệ thống lần lượt ưu tiên: đủ định lượng, tổng giá thấp nhất, ít dư hơn, rồi ít gói hơn.
- Khách có thể đánh dấu dụng cụ “Tôi đã có” để loại khỏi danh sách mua.
- Khách được xem nội dung và tạo giỏ khi chưa đăng nhập; đăng nhập là bắt buộc khi bắt đầu thanh toán.
- Tồn kho được quản lý theo từng biến thể có thể bán.
- Khách có thể yêu cầu hủy trước giai đoạn giao hàng và phải chọn hoặc ghi lý do.
- Đơn đã thanh toán phải theo dõi trạng thái hoàn tiền riêng với trạng thái hủy đơn.
- Thanh toán thử nghiệm dùng ZaloPay Sandbox; bí mật và chữ ký chỉ nằm ở backend.
- PostgreSQL và Prisma ORM được dùng cho dữ liệu nghiệp vụ.
- Frontend React/Vite được triển khai trên Vercel.
- Trong giai đoạn phát triển, PostgreSQL chạy cục bộ bằng Docker; production dự kiến đặt API và PostgreSQL trên máy ảo Oracle Cloud dùng chung. Phương án Caddy chiếm cổng 80/443 trong tài liệu cũ chưa phù hợp vì Nginx của dự án khác đang quản lý đầu vào công khai; cần chốt cấu hình trước khi triển khai.
- Giai đoạn đầu chỉ lưu URL ảnh, chưa xây chức năng tải ảnh lên.
- Cửa hàng chỉ bán nguyên liệu và dụng cụ làm bánh, không bán bánh thành phẩm. Ảnh bánh minh họa cho `Recipe`, không gán cho `Product` nguyên liệu hoặc dụng cụ.
- Trang chủ chỉ giới thiệu ngắn và dẫn vào `/cong-thuc`; danh mục đầy đủ cùng tìm kiếm/lọc nằm ở trang công thức riêng. `/cau-chuyen` là không gian biên tập giải thích lý do và nguyên tắc của sản phẩm.
- Ảnh nội dung tĩnh do chủ dự án chọn có thể lưu tối ưu trong `apps/web/public/images` ở giai đoạn phát triển. Ảnh do quản trị viên tải lên vẫn cần dịch vụ lưu trữ đối tượng trước khi có dữ liệu thật.
- Bản quản trị vận hành đầu tiên gồm tổng quan, đơn hàng, vận chuyển theo trạng thái, giao dịch ZaloPay, sản phẩm, cảnh báo tồn kho, sổ biến động và báo cáo tiền đã thu. Quản trị công thức, bài viết, khuyến mãi, thuế và nhập hàng đầy đủ được mở ở các lát cắt sau.
- Sản phẩm và biến thể không bị xóa cứng trong giao diện quản trị. Quản trị viên chuyển chúng sang trạng thái ngừng bán để giữ lịch sử đơn hàng và kho.
- Tồn kho không được ghi đè bằng một con số tuyệt đối. Mỗi lần thay đổi phải ghi số lượng tăng/giảm, lý do, người thực hiện và số dư trước–sau vào sổ kho.
- Mã hàng (SKU) và đường dẫn sản phẩm giữ ổn định sau khi tạo trong bản đầu; nếu nhập sai cần ngừng bán quy cách cũ và tạo quy cách mới.
- Quản trị đầy đủ trên máy tính và máy tính bảng. Điện thoại ưu tiên xem nhanh, đổi trạng thái và ghi biến động kho; biểu mẫu phải không tràn ngang ở 320 px.
- Quản trị viên chỉ được đẩy đơn theo chuỗi `PAYMENT_REVIEW → CONFIRMED → PREPARING → SHIPPING → DELIVERED`; backend từ chối bỏ bước, lùi bước hoặc ghi đè khi trạng thái vừa thay đổi ở phiên khác.
- “Tiền đã thu” là tổng giao dịch có trạng thái thành công. Không gọi số này là lợi nhuận; lợi nhuận, chiết khấu, thuế và giá trị nhập hàng chỉ được hiển thị sau khi có dữ liệu nguồn và quy tắc tính rõ ràng.
- Khu vực tài khoản khách hàng gồm tổng quan, lịch sử và chi tiết đơn, hồ sơ cùng sổ địa chỉ. Địa chỉ mặc định chỉ điền trước lúc thanh toán; đơn đã tạo luôn giữ ảnh chụp nơi nhận ban đầu.
- Mỗi khách chỉ có tối đa một địa chỉ mặc định. Địa chỉ đầu tiên tự trở thành mặc định; nếu xóa địa chỉ đó, hệ thống chọn địa chỉ được cập nhật gần nhất còn lại.
- Email đăng nhập chưa cho tự đổi cho đến khi có luồng xác minh địa chỉ mới. Yêu cầu hủy đơn và hoàn tiền chưa nằm trong lát cắt tài khoản đầu tiên vì quy tắc nghiệp vụ vẫn còn mở.
- Luồng tài khoản hiện dùng email/mật khẩu, phiên lưu ở máy chủ và cookie chỉ HTTP. Người chưa đăng nhập được hướng tới trang đăng nhập; người đã đăng nhập nhưng sai vai trò được thông báo không đủ quyền thay vì âm thầm đưa về trang chủ. Chi tiết lớp bảo vệ và giới hạn còn mở ở `docs/security/auth-flow.md`.

## Phạm vi dự kiến

Khách hàng: tài khoản, danh mục, biến thể sản phẩm, đọc công thức/bài viết, điều chỉnh khẩu phần, tạo giỏ từ công thức, giỏ hàng, thanh toán, lịch sử đơn và yêu cầu hủy.

Quản trị: sản phẩm, biến thể, tồn kho, danh mục, công thức, bài viết, ánh xạ công thức–sản phẩm, đơn hàng, thanh toán, yêu cầu hủy và ảnh/tệp.

Dự án không có thời hạn cố định. Tính năng được ưu tiên theo giá trị, rủi ro và khả năng hoàn thiện.

## Vấn đề còn mở

- Xác thực nhiều lớp (MFA) và xác thực lại cho thao tác nhạy cảm của quản trị viên còn mở; dịch vụ gửi thư production dự kiến OCI Email Delivery nhưng chưa xác nhận hạn mức và cấu hình trên tài khoản Oracle thực tế.
- Quy trình thử bếp/đối chiếu bởi người có kinh nghiệm, chuẩn công bố công thức và điều kiện cho phép gợi ý mua nguyên liệu vẫn cần hoàn thiện; quyết định hiển thị công thức không đồng nghĩa công thức đã được kiểm chứng.

- “Món bánh tương thích” có cần trở thành bộ lọc bắt buộc hay không.
- Phí và quy tắc vận chuyển.
- Nhà cung cấp cùng chính sách lưu ảnh/tệp.
- Khả năng bảo hộ nhãn hiệu và tên miền phù hợp với `Một Mẻ Bánh`; tên chính thức trong sản phẩm không đồng nghĩa tên đã được bảo hộ pháp lý. Miền `bepdubanh.congtc145.id.vn` hiện vẫn giữ nguyên.
- Loại nội dung, quy trình biên tập và bản quyền.
- Luồng duyệt hủy và hoàn tiền ZaloPay.
- Giá bán đang hiển thị đã gồm thuế hay chưa; dự án có cần xuất hóa đơn VAT hay không.
- Phương pháp tính giá vốn khi xuất kho: bình quân di động hay nhập trước–xuất trước (FIFO).
- Khuyến mãi dùng mã, tự động theo điều kiện hay giảm theo bộ nguyên liệu công thức.
- Vận chuyển chỉ đổi trạng thái thủ công hay cần hãng vận chuyển, mã vận đơn và đối soát phí.
- Nhập hàng có cần nhà cung cấp, đơn mua, phiếu nhận hàng, lô và hạn sử dụng hay không.
- Hoàn tiền cho phép toàn phần hay một phần và có cần bước phê duyệt riêng hay không.
- Có cần lưu lịch sử từng lần đổi trạng thái đơn (thời điểm, người thao tác, trạng thái cũ/mới) ngay ở lát cắt kế tiếp hay chỉ giữ trạng thái hiện tại trong giai đoạn thử nghiệm.

Các vấn đề còn mở không được âm thầm biến thành yêu cầu chính thức trong mã nguồn.
