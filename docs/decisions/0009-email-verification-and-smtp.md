# Xác minh email và gửi thư qua SMTP

Status: Accepted
Date: 2026-09-18

## Context

Đăng ký trước đây cấp phiên ngay. Điều này không chứng minh khách kiểm soát địa chỉ email; thư đơn hàng và khôi phục mật khẩu có thể đi tới sai người. Dự án dùng Express trên Oracle và cần một cơ chế thử được ở local nhưng đổi nhà cung cấp thư được sau này.

## Decision

- Sau đăng ký, tài khoản chưa được đăng nhập hoặc đặt hàng cho tới khi bấm liên kết xác minh email.
- Mã xác minh/đặt lại mật khẩu là mã ngẫu nhiên dùng một lần, có hạn dùng; chỉ lưu bản băm trong PostgreSQL. Đặt lại mật khẩu xóa các phiên cũ.
- Gửi thư qua SMTP: local dùng Mailpit; production dự kiến OCI Email Delivery với endpoint, sender và credentials riêng. Không dùng API key hay mật khẩu SMTP ở frontend.
- Cấu hình IP cho bộ giới hạn: mặc định Express không tin proxy; compose Oracle tin đúng một tầng Caddy khi API chỉ nằm trên mạng Docker nội bộ. Cấu hình này phải được đánh giá lại nếu thêm tầng proxy hoặc mở cổng API.

## Consequences

Khách phải có email dùng được trước khi đặt hàng. Tài khoản cũ sau migration cần xác minh lại; tài khoản seed chỉ được đánh dấu xác minh khi chạy seed có chủ đích. Việc gửi thư hiện đồng bộ nên lỗi SMTP có thể khiến đăng ký mới cần dùng chức năng gửi lại; hệ thống hàng đợi/thư chờ gửi là việc tiếp theo nếu có lưu lượng thực. MFA cho quản trị và kiểm thử FE/API trên miền thật chưa nằm trong thay đổi này.
