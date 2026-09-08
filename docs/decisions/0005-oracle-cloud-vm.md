# Triển khai backend trên máy ảo Oracle Cloud

Status: Accepted
Date: 2026-09-06

## Context

Frontend đã chọn Vercel. Backend Express cần tiến trình chạy lâu dài để nhận callback thanh toán và đối soát, đồng thời cần PostgreSQL với độ trễ thấp. Chủ dự án đã chọn Oracle Cloud thay cho Render và Supabase ở giai đoạn hiện tại.

## Decision

Chạy Caddy, Express API và PostgreSQL bằng Docker Compose trên cùng một máy ảo Oracle Cloud tại Singapore. Chỉ Caddy nhận lưu lượng Internet qua cổng 80/443. PostgreSQL không công khai cổng ra Internet.

Quản trị máy qua Tailscale SSH. Cổng 22 chỉ được mở tạm thời từ IP hiện tại của chủ dự án trong lúc cài đặt ban đầu; sau khi kiểm tra truy cập Tailscale từ một phiên thứ hai, cổng 22 công khai phải được đóng. Địa chỉ Tailscale không dùng cho DNS của API.

Đây là cấu hình một máy phù hợp giai đoạn đầu, chưa phải kiến trúc sẵn sàng cao. Frontend vẫn ở Vercel và gọi API qua một tên miền con HTTPS.

## Consequences

- Đường mạng giữa API và database nằm trong cùng máy, giảm một chặng truy cập so với hai nhà cung cấp khác nhau.
- Chủ dự án phải tự quản lý cập nhật hệ điều hành, tường lửa, chứng chỉ, sao lưu, giám sát và khôi phục.
- Máy quản trị và máy Oracle phải đăng nhập cùng một tailnet; quyền SSH còn phụ thuộc vào chính sách truy cập của Tailscale. Sự cố tài khoản hoặc tailnet có thể làm mất đường quản trị chính, nên vẫn phải giữ private key khởi tạo ở nơi riêng tư để dùng cho phương án khôi phục qua Oracle.
- Máy ảo là một điểm lỗi duy nhất. Khi nhu cầu tăng, database có thể chuyển sang dịch vụ quản lý mà không thay đổi ranh giới API.
- Kích thước và điều kiện miễn phí của Oracle có thể thay đổi; cần kiểm tra bảng giá và tài nguyên của tài khoản trước khi tạo máy.
