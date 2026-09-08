# Dùng phiên đăng nhập phía máy chủ

Status: Accepted
Date: 2026-09-06

## Context

Khách được đọc công thức và tạo giỏ khi chưa đăng nhập nhưng phải có tài khoản khi bắt đầu thanh toán. Frontend React chạy tách origin với Express API, vì vậy cơ chế xác thực phải giữ được giỏ cục bộ, không để token dài hạn cho JavaScript truy cập và cho phép backend thu hồi phiên.

## Decision

- Dùng mã phiên mờ (opaque session token): chuỗi ngẫu nhiên 256 bit không chứa dữ liệu người dùng.
- Gửi mã qua cookie `HttpOnly`, `SameSite=Lax`, `Path=/`; production bắt buộc `Secure` và dùng tiền tố `__Host-`.
- Database chỉ lưu SHA-256 của mã phiên. SHA-256 phù hợp ở đây vì đầu vào là mã ngẫu nhiên có entropy cao, không phải mật khẩu do con người chọn.
- Mật khẩu được băm bằng Argon2id với bộ nhớ 19 MiB, 2 vòng và 1 luồng. Không lưu hoặc ghi log mật khẩu/mã phiên.
- Phiên mặc định hết hạn sau 30 ngày, cấu hình được bằng biến môi trường; cho phép nhiều phiên theo nhiều thiết bị và logout chỉ thu hồi phiên hiện tại.
- Frontend lấy người dùng hiện tại từ `/api/auth/me`; route guard chỉ hỗ trợ trải nghiệm. Endpoint nghiệp vụ được bảo vệ vẫn phải kiểm tra phiên và quyền ở backend.
- Ưu tiên đặt frontend và API dưới hai subdomain của cùng `congtc145.id.vn` để giữ `SameSite=Lax` và tránh phụ thuộc cookie bên thứ ba.

## Consequences

- JavaScript phía frontend không đọc được mã phiên; database bị lộ cũng không cung cấp ngay mã cookie đang dùng.
- Mỗi request được bảo vệ cần một lần tra phiên; chỉ mục duy nhất trên `token_hash` giữ truy vấn có mục tiêu rõ ràng.
- Bảng `sessions` cần được dọn các dòng hết hạn theo lịch ở giai đoạn vận hành.
- Cần bổ sung giới hạn thử đăng nhập, đặt lại mật khẩu, thu hồi toàn bộ phiên và chống CSRF trước khi đưa checkout thật lên production.
- Nếu API đặt trên site khác frontend, cấu hình cookie và mức tương thích trình duyệt phải được đánh giá lại.
