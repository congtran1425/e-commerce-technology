# Tầm nhìn và phạm vi sản phẩm

Trạng thái: Đã chấp nhận
Cập nhật: 2026-09-06

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
- Trong giai đoạn phát triển, PostgreSQL chạy cục bộ bằng Docker; production trước mắt đặt Caddy, Express và PostgreSQL trên cùng một máy ảo Oracle Cloud tại Singapore.
- Giai đoạn đầu chỉ lưu URL ảnh, chưa xây chức năng tải ảnh lên.

## Phạm vi dự kiến

Khách hàng: tài khoản, danh mục, biến thể sản phẩm, đọc công thức/bài viết, điều chỉnh khẩu phần, tạo giỏ từ công thức, giỏ hàng, thanh toán, lịch sử đơn và yêu cầu hủy.

Quản trị: sản phẩm, biến thể, tồn kho, danh mục, công thức, bài viết, ánh xạ công thức–sản phẩm, đơn hàng, thanh toán, yêu cầu hủy và ảnh/tệp.

Dự án không có thời hạn cố định. Tính năng được ưu tiên theo giá trị, rủi ro và khả năng hoàn thiện.

## Vấn đề còn mở

- “Món bánh tương thích” có cần trở thành bộ lọc bắt buộc hay không.
- Phí và quy tắc vận chuyển.
- Nhà cung cấp cùng chính sách lưu ảnh/tệp.
- Loại nội dung, quy trình biên tập và bản quyền.
- Luồng duyệt hủy và hoàn tiền ZaloPay.

Các vấn đề còn mở không được âm thầm biến thành yêu cầu chính thức trong mã nguồn.
