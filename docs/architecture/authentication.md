# Xác thực và phân quyền

Tài liệu này ghi nguyên tắc, chưa chốt cơ chế token/session.

## Vai trò dự kiến

- `customer`: mua hàng và quản lý tài khoản/đơn của chính mình.
- `admin`: truy cập chức năng quản trị được cấp phép.

## Luồng giao diện

- Khách chưa đăng nhập truy cập route cần bảo vệ sẽ được chuyển đến trang đăng nhập.
- Customer truy cập `/admin/*` nhận trang từ chối truy cập.
- Admin đăng nhập có thể được chuyển đến `/admin`.

## Quy tắc bắt buộc

- Backend kiểm tra authentication và authorization trên mọi endpoint được bảo vệ.
- Route guard của React chỉ cải thiện trải nghiệm, không phải lớp bảo mật.
- Client không được tự đặt hoặc sửa role khi đăng ký/cập nhật tài khoản.
- Refresh credential, nếu sử dụng, nên được bảo vệ bằng cookie `HttpOnly`, `Secure` trong production và chính sách `SameSite` phù hợp.
- Không commit secret và không ghi token vào log.

Chiến lược cụ thể phải được chốt bằng ADR và threat review trước khi triển khai.
