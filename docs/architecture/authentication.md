# Xác thực và phân quyền

Ứng dụng dùng phiên đăng nhập phía máy chủ. Trình duyệt chỉ giữ một mã phiên ngẫu nhiên trong cookie `HttpOnly`; dữ liệu người dùng, vai trò và trạng thái phiên nằm ở backend/database.

Cơ chế này đã được chọn thay cho việc để trình duyệt tự giữ JWT dài hạn và đã được triển khai ở lát cắt bắt đầu checkout. Chi tiết quyết định nằm trong [ADR 0004](../decisions/0004-server-side-sessions.md).

## Cách phiên hoạt động

- `POST /api/auth/register` tạo tài khoản khách hàng chưa xác minh, băm mật khẩu bằng Argon2id và gửi thư xác minh; **chưa mở phiên**. Sau khi xác minh email, khách đăng nhập riêng.
- `POST /api/auth/resend-verification` gửi lại thư xác minh cho tài khoản phù hợp; `POST /api/auth/verify-email` tiêu thụ mã một lần.
- `POST /api/auth/forgot-password` gửi liên kết đặt lại mật khẩu; `POST /api/auth/reset-password` đổi mật khẩu và thu hồi mọi phiên cũ.
- `POST /api/auth/login` kiểm tra mật khẩu rồi luôn tạo mã phiên mới, tránh tái sử dụng mã cũ.
- `GET /api/auth/me` đọc cookie và trả thông tin công khai của tài khoản đang hoạt động.
- `POST /api/auth/logout` xóa phiên hiện tại trong database và xóa cookie.
- Mã phiên có 256 bit ngẫu nhiên. Database chỉ lưu SHA-256 của mã, không lưu giá trị gửi cho trình duyệt.
- Mỗi thiết bị có thể có một dòng `sessions` riêng. Đăng xuất chỉ kết thúc phiên hiện tại.
- Thời hạn mặc định là 30 ngày và đổi được qua `SESSION_TTL_DAYS` trong khoảng 1–90 ngày.

## Vai trò dự kiến

- `customer`: mua hàng và quản lý tài khoản/đơn của chính mình.
- `admin`: truy cập chức năng quản trị được cấp phép.

## Luồng giao diện

- Khách chưa đăng nhập vẫn đọc công thức, xem sản phẩm và tạo giỏ cục bộ.
- Khi bắt đầu thanh toán, khách chưa đăng nhập được chuyển đến trang đăng nhập; sau khi thành công phải quay lại checkout và giữ nguyên giỏ.
- Customer truy cập `/admin/*` nhận trang từ chối truy cập.
- Admin đăng nhập có thể được chuyển đến `/admin`.

## Quy tắc bắt buộc

- Backend kiểm tra authentication và authorization trên mọi endpoint được bảo vệ.
- Route guard của React chỉ cải thiện trải nghiệm, không phải lớp bảo mật.
- Client không được tự đặt hoặc sửa role khi đăng ký/cập nhật tài khoản.
- Cookie phiên phải dùng `HttpOnly`, `Secure` trong production và chính sách `SameSite` phù hợp.
- Backend phải xoay mã phiên sau khi đăng nhập hoặc đổi quyền để ngăn cố định phiên.
- Yêu cầu thay đổi dữ liệu phải có biện pháp chống CSRF phù hợp với cách bố trí tên miền thực tế.
- Không commit secret và không ghi token vào log.

## Bố trí tên miền

Frontend production dùng `bepdubanh.congtc145.id.vn`; hostname API production chưa chốt. Khi API dùng một subdomain cùng site `congtc145.id.vn`, hai origin (nguồn truy cập gồm giao thức, tên miền và cổng) khác nhau nhưng cookie `SameSite=Lax` có thể đi cùng lời gọi API nếu frontend dùng `credentials: include` và backend chỉ cho phép đúng origin frontend qua CORS. Khi chốt/đổi hostname API phải cập nhật đồng bộ DNS, Caddy, CORS, cookie, callback ZaloPay và biến frontend.

Nếu API dùng tên miền hoàn toàn khác như `*.onrender.com`, cookie phải dùng `SameSite=None; Secure` và có thể bị chính sách chặn cookie bên thứ ba của trình duyệt ảnh hưởng. Không đổi sang cấu hình đó nếu chưa kiểm thử trên các trình duyệt mục tiêu.

## Việc bảo mật còn phải hoàn thiện trước production

- Nâng bộ giới hạn lượt thử đang ở bộ nhớ một tiến trình lên kho đếm dùng chung khi chạy nhiều tiến trình/máy; kiểm tra IP thật qua proxy tin cậy. Hiện đăng nhập được giới hạn theo email băm, các thao tác thư theo email băm và nhiều thao tác theo IP.
- Kiểm thử trên miền thật lớp kiểm tra `Origin` và header trình duyệt đang áp dụng cho yêu cầu thay đổi dữ liệu; callback ZaloPay có cơ chế chữ ký riêng. Header không phải bí mật hay cơ chế phân quyền.
- Kiểm thử gửi thư bằng nhà cung cấp thật và giảm chênh lệch thời gian phản hồi có thể làm lộ email đã đăng ký; xem [giới hạn hiện tại](../security/auth-flow.md).
- Bổ sung xác thực nhiều lớp và xác thực lại cho thao tác quản trị nhạy cảm trước vận hành thật.
- Chốt thời gian bất hoạt nếu cần ngắn hơn thời hạn tuyệt đối 30 ngày.
