# Tích hợp ZaloPay qua backend

Status: Accepted
Date: 2026-09-06

## Context

Dự án cần thanh toán Sandbox. Mã tham khảo cũ minh họa cách tạo chữ ký và gọi ZaloPay nhưng chứa khóa mẫu, chưa gắn với đơn hàng, tồn kho, phiên đăng nhập hoặc xử lý callback gửi lặp.

## Decision

Frontend chỉ gửi biến thể, số lượng và địa chỉ nhận cho Express. Backend tự lấy giá, giữ tồn kho, tạo đơn, ký yêu cầu ZaloPay bằng `KEY1` và trả URL thanh toán. Callback công khai được xác minh bằng `KEY2`, sau đó kiểm tra `app_id`, mã giao dịch và số tiền trước khi xác nhận đơn.

Kết quả chuyển hướng về frontend không phải bằng chứng thanh toán. Backend cung cấp API đọc/đối chiếu trạng thái và chạy đối soát nền cho giao dịch quá hạn. Mọi cập nhật thanh toán và hoàn tồn kho phải có tính lặp an toàn: nhận cùng một callback nhiều lần vẫn chỉ tạo một kết quả.

## Consequences

- Không có khóa bí mật nào trong React hoặc Vercel frontend.
- Cần một URL callback HTTPS công khai và cấu hình DNS trước khi thử trọn luồng Sandbox.
- Tạo đơn chống gửi lặp bằng `idempotencyKey`; database lưu lịch sử đơn và thanh toán riêng.
- Khi ZaloPay không phản hồi, hàng đã giữ được hoàn lại; khi số tiền bất thường, đơn chuyển sang `PAYMENT_REVIEW` thay vì tự xác nhận.
