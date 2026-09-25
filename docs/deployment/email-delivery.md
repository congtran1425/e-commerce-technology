# Gửi thư tài khoản: local và Oracle

## Đã chốt

API gửi thư giao dịch qua SMTP. Local dùng Mailpit để xem thư mà không gửi ra Internet; bản Oracle dự kiến dùng OCI Email Delivery. Lựa chọn này giữ nguyên mã ứng dụng khi chuyển môi trường. Email dùng để xác minh tài khoản và đặt lại mật khẩu, **không** thay thế phương thức xác thực nhiều lớp cho quản trị viên.

## Local

1. Chạy `docker compose up -d postgres mailpit` ở thư mục gốc.
2. Thêm vào `apps/api/.env` các biến `PUBLIC_WEB_URL=http://localhost:5173`, `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false`, `SMTP_FROM="Mot Me Banh <no-reply@example.test>"`; không cần SMTP_USER/PASSWORD với Mailpit.
3. Chạy `npm.cmd run db:migrate:deploy`, rồi chạy API và web như thường lệ.
4. Đăng ký bằng email thử nghiệm, mở <http://127.0.0.1:8025> để lấy liên kết xác minh. Với tài khoản cũ, dùng mục “Gửi lại thư xác minh”.

Nếu FE chạy trên Vercel và API local được đưa ra ngoài bằng tunnel, `PUBLIC_WEB_URL` phải là miền FE Vercel thực tế; `CORS_ORIGIN` phải chứa đúng miền FE đó. Đường dẫn trong thư không thể trỏ về `localhost` trên máy của người thử khác. Bộ giới hạn theo IP mặc định không tin header proxy ở local (`TRUST_PROXY_HOPS=0`), vì vậy lưu lượng qua tunnel có thể bị tính chung thành một IP; chưa dùng cấu hình này để đo chống lạm dụng production.

**Lưu ý:** migration không tự xác minh tài khoản cũ. Không chạy lại `db:seed` chỉ để mở khóa tài khoản nếu có dữ liệu đang cần giữ; seed có thể cập nhật dữ liệu mẫu. Hãy dùng luồng xác minh hoặc một quy trình quản trị có kiểm soát.

## Oracle

1. Trong Oracle Console, vào **Developer Services → Email Delivery → Configuration** để xem public SMTP endpoint và cổng được cấp tại region thực tế. Đừng đoán endpoint theo tên home region.
2. Tạo email domain và approved sender, cấu hình SPF/DKIM ở DNS; tạo SMTP credentials riêng. Không dùng mật khẩu tài khoản Oracle chính làm SMTP password.
3. Trong tệp env **chỉ trên máy chủ**, đặt `PUBLIC_WEB_URL` bằng URL FE chính thức; `SMTP_HOST` bằng public endpoint ở Console; `SMTP_PORT=587` với STARTTLS hoặc `465` với TLS ngay khi kết nối; `SMTP_SECURE=false` cho 587, `true` cho 465; điền `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` là approved sender.
4. Kiểm tra gửi nhận thực tế, thư rác, giới hạn gửi, log lỗi, và đường dẫn xác minh trên miền thật trước khi mở đăng ký công khai. Không commit env hay mật khẩu SMTP.

Tài liệu Oracle: [bắt đầu cấu hình Email Delivery](https://docs.oracle.com/en-us/iaas/Content/Email/Reference/gettingstarted.htm), [xem endpoint SMTP và TLS](https://docs.oracle.com/en-us/iaas/Content/Email/Reference/gettingstarted_topic-Configure_the_SMTP_connection.htm).

## Còn mở

- Tài khoản OCI ở region đang dùng có thực sự bật Email Delivery/approved sender và hạn mức đủ hay không phải kiểm tra trong Console; không suy diễn rằng mọi tài khoản Always Free đều gửi được ngay.
- Trước khi mở đăng ký công khai, tách việc gửi thư khỏi request HTTP bằng hàng đợi bền vững và worker: vừa giảm chênh lệch thời gian phản hồi giữa email có/không có tài khoản, vừa tránh mất thư nếu API khởi động lại. Hiện gửi đồng bộ: nếu SMTP lỗi sau khi tạo tài khoản, khách cần dùng “Gửi lại thư xác minh”.
