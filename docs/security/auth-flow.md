# Luồng tài khoản và các ranh giới bảo mật

> Quyết định: **xác minh email ngay khi đăng ký**, trước khi cấp phiên và đặt hàng. Migration đã áp dụng lên PostgreSQL cục bộ ngày 17-09-2026; chưa kiểm thử trên miền thật và chưa triển khai Oracle.

## Triển khai mới: xác minh và khôi phục tài khoản

- Đăng ký lưu tài khoản chưa xác minh, gửi liên kết dùng một lần có hạn 24 giờ; **không cấp cookie**. Đăng nhập từ chối tài khoản chưa xác minh. Sau khi bấm xác minh, khách đăng nhập riêng.
- Có thể gửi lại thư xác minh. Quên mật khẩu gửi liên kết dùng một lần có hạn 30 phút; phản hồi chung cho email có hoặc không có tài khoản, kể cả khi SMTP gửi thư thất bại (máy chủ ghi lỗi không kèm địa chỉ email để điều tra). Nếu gửi thất bại, mã mới đã thay mã cũ nên khách phải thử yêu cầu lại sau khi dịch vụ thư phục hồi. Đặt lại mật khẩu thu hồi toàn bộ phiên cũ và mã còn hiệu lực, không tự động đăng nhập; hệ thống cố gửi thư báo mật khẩu đã đổi nhưng không báo thao tác thất bại nếu riêng thư thông báo gặp lỗi.
- Mã ngẫu nhiên chỉ gửi qua email; PostgreSQL lưu SHA-256 của mã, không lưu mã gốc. Mỗi người chỉ có một mã còn hiệu lực cho từng mục đích. Link đặt mã trong phần `#` (fragment) để không gửi mã trong HTTP request đến Vercel; giao diện xóa mã khỏi thanh địa chỉ sau khi đọc. Không ghi mã/link vào log.
- Local: `docker compose up -d postgres mailpit`, hộp thư xem tại `http://127.0.0.1:8025`; API cần `PUBLIC_WEB_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` trong `apps/api/.env`. Mailpit không gửi email ra internet.
- Oracle: cùng bộ biến SMTP, nhưng thay bằng endpoint, approved sender và SMTP credentials của OCI Email Delivery. Không đưa mật khẩu SMTP vào repository. Dùng đường dẫn FE thật trong `PUBLIC_WEB_URL`; cấu hình đúng DNS/SPF/DKIM trước khi gửi tới người dùng thật.
- Tài khoản seed được đánh dấu đã xác minh **chỉ khi chạy lại seed**. Tài khoản hiện có sau migration vẫn chưa xác minh: phải dùng luồng gửi lại thư hoặc quy trình xác minh thủ công có kiểm soát, không tự đánh dấu tất cả là hợp lệ.
- Chưa kiểm thử end-to-end trên miền FE/API thật. Chưa có MFA và xác thực lại cho thao tác nhạy cảm của quản trị. Bộ giới hạn theo IP hiện chỉ chia sẻ trong một tiến trình API.

Cập nhật: 17-09-2026  
Trạng thái: Xác minh email và khôi phục tài khoản đã có mã nguồn; chưa kiểm thử toàn tuyến trên môi trường triển khai

## Đã triển khai

1. Khách tạo tài khoản bằng tên hiển thị, email và mật khẩu ít nhất 10 ký tự; giao diện yêu cầu nhập lại mật khẩu. Backend kiểm tra đầu vào, băm mật khẩu bằng Argon2 và lưu người dùng trong PostgreSQL. Trường nhập lại mật khẩu chỉ được kiểm tra ở giao diện, không gửi tới máy chủ.
2. Đăng nhập trả về phiên ngẫu nhiên trong cookie `HttpOnly`, `SameSite=Lax`, `Secure` ở production; database chỉ lưu mã băm của phiên. Đăng xuất xóa phiên ở database và cookie ở trình duyệt. Trạng thái phiên được đọc lại qua `/api/auth/me` khi mở ứng dụng.
3. Trang cần đăng nhập chuyển khách chưa xác thực về `/dang-nhap` và giữ đường dẫn trở lại nội bộ. Người đăng nhập sai vai trò thấy thông báo không đủ quyền. Backend vẫn là nơi bắt buộc kiểm tra quyền; bảo vệ route ở React chỉ phục vụ trải nghiệm.
4. Đăng nhập giới hạn 10 lần không thành công/15 phút theo email đã băm; đăng ký giới hạn 30 yêu cầu/15 phút theo IP. Bộ đếm hiện ở bộ nhớ của **một tiến trình API**, sẽ mất khi khởi động lại và không đồng bộ giữa nhiều bản sao máy chủ.
5. Các yêu cầu thay đổi dữ liệu từ web dùng header `X-BDB-Client-Request: 1` và kiểm tra `Origin` nếu có; CORS chỉ cho phép các origin đã cấu hình. Callback ZaloPay được miễn lớp kiểm tra trình duyệt vì là luồng máy-chủ-đến-máy-chủ và phải kiểm tra chữ ký riêng. Header này không phải bí mật hay cơ chế phân quyền.

## Chưa được coi là sẵn sàng cho sản phẩm thật

- Chưa kiểm chứng việc gửi thư tới hộp thư thật qua OCI Email Delivery và toàn bộ luồng trên miền FE/API thật. Mailpit chỉ chứng minh đường gửi thư cục bộ.
- Phản hồi đăng ký/quên mật khẩu/gửi lại thư có cùng nội dung và mã HTTP cho email tồn tại hoặc không tồn tại, nhưng hiện băm mật khẩu và gửi thư đồng bộ: **thời gian phản hồi vẫn có thể khác nhau** và bị dùng để đoán tài khoản. Cần đưa việc phát thư vào hàng đợi bền vững và kiểm tra độ lệch thời gian trước khi mở đăng ký công khai; không mô tả luồng hiện tại là chống liệt kê tài khoản hoàn chỉnh.
- Chưa có xác thực nhiều lớp (MFA) và xác thực lại bằng mật khẩu cho thao tác nhạy cảm của quản trị viên. Không nên coi mật khẩu đơn lẻ là mức bảo vệ đủ cho vận hành thật.
- Bộ giới hạn lượt thử cần kho đếm dùng chung (ví dụ Redis) hoặc lớp chống lạm dụng ở biên nếu API chạy nhiều tiến trình/máy. Local để `TRUST_PROXY_HOPS=0`: không tin IP do yêu cầu tự khai. Compose Oracle đặt `TRUST_PROXY_HOPS=1` vì API không công bố cổng ra Internet và chỉ Caddy nhận lưu lượng bên ngoài. Nếu thay đổi đường đi (thêm Cloudflare proxy, load balancer hoặc công bố cổng API), phải kiểm tra lại số tầng và việc Caddy xử lý `X-Forwarded-For` trước khi triển khai; không bật `trust proxy=true` vô điều kiện.
- Cần kiểm thử tích hợp toàn tuyến trên miền FE/API thực tế, bao gồm cookie liên miền, CORS, 401, 403, 429 và callback thanh toán. Không coi một lần chạy ở localhost là kiểm chứng production.

Tài liệu tham khảo bảo mật: [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
