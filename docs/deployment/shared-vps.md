# Triển khai Một Mẻ Bánh trên VPS dùng chung

Áp dụng cho máy Ubuntu 20.04 hiện đang chạy dự án khác qua Nginx. Đây là cấu hình **riêng cho máy dùng chung**; không chạy riêng `compose.production.yaml`, vì tệp đó bật Caddy trên cổng 80/443. Không nâng cấp hệ điều hành, thay đổi Nginx, tường lửa hoặc dịch vụ của người cùng dùng máy trong quy trình này.

## Ranh giới giữa các dự án

- Mã nguồn: `/opt/apps/bep-du-banh/repo`; cấu hình bí mật: `/opt/apps/bep-du-banh/config` (không nằm trong Git); dữ liệu PostgreSQL: volume riêng của Compose.
- Tên dự án Compose: `mot-me-banh`. API chỉ mở `127.0.0.1:3080` trên VPS; PostgreSQL không công bố cổng. Các cổng 9000 trở lên dành cho dự án của người cùng dùng máy.
- Nginx hiện tại là chủ cổng công khai; hostname API đã chốt là `apimotmebanh.congtc145.id.vn`. Ngày 25/09/2026, hostname này đã trả `/api/health` qua Cloudflare từ một đường kết nối cũ, **không phải VPS**. Cần xác định và chuyển đường Cloudflare hiện tại một cách có kiểm soát. **Chưa đổi bản ghi DNS, callback ZaloPay hay biến `VITE_API_BASE_URL` trên Vercel** khi chỉ mới kiểm tra API nội bộ.
- Không thêm tài khoản thường vào nhóm `docker`: quyền đó gần tương đương root trên máy dùng chung.

## Điều kiện trước khi chạy

1. Kiểm tra `git status -sb`, nhánh/commit và chắc chắn mã nguồn cần phát hành đã lên GitHub. Clone hoặc `git pull --ff-only` vào thư mục riêng, không dùng thư mục dự án của người khác.
2. Máy đã cài `docker.io` và `docker-compose-v2` từ kho Ubuntu 20.04. Tài liệu Docker Engine chính thức hiện không liệt kê Ubuntu 20.04 trong các phiên bản được hỗ trợ; bộ gói Ubuntu này phục vụ giai đoạn thử nghiệm, cần kế hoạch cập nhật bảo mật riêng. Không thay bằng tập lệnh cài Docker tùy tiện hoặc nâng cấp OS khi máy vẫn dùng chung.
3. Chuẩn bị `/opt/apps/bep-du-banh/config/.env` từ mẫu `deploy/oracle/.env.example`, quyền `600`, chỉ trên VPS. Thay mật khẩu PostgreSQL mẫu bằng giá trị ngẫu nhiên riêng và cùng giá trị đã mã hóa đúng trong `DATABASE_URL`. Không in `.env` ra terminal/chat/log; không chép khóa từ `server.js` minh họa.
4. Cấu hình dịch vụ gửi thư và bộ khóa ZaloPay Sandbox trước khi thử đăng ký hoặc thanh toán. Nếu chưa có, API vẫn chạy nhưng đăng ký/quên mật khẩu trả lỗi `503` và thanh toán ZaloPay chưa khả dụng; không gọi đó là hệ thống đã sẵn sàng cho khách hàng.

## Khởi động riêng, khi các điều kiện trên đã đủ

Chạy từ `/opt/apps/bep-du-banh/repo`. Dùng tên đầy đủ của cả hai tệp Compose trong **mọi** lệnh để giữ nguyên ranh giới máy dùng chung:

```bash
sudo docker compose --env-file /opt/apps/bep-du-banh/config/.env \
  -f compose.production.yaml -f compose.shared-vps.yaml config --quiet

sudo docker compose --env-file /opt/apps/bep-du-banh/config/.env \
  -f compose.production.yaml -f compose.shared-vps.yaml build migrate api

sudo docker compose --env-file /opt/apps/bep-du-banh/config/.env \
  -f compose.production.yaml -f compose.shared-vps.yaml up -d postgres migrate api

sudo docker compose --env-file /opt/apps/bep-du-banh/config/.env \
  -f compose.production.yaml -f compose.shared-vps.yaml ps -a

curl --fail --silent --show-error http://127.0.0.1:3080/api/health
```

Kỳ vọng: PostgreSQL `healthy`, tác vụ migration thoát mã `0`, API `healthy`, Caddy không chạy. Không dùng `down -v`: lệnh đó xóa dữ liệu. Trước migration lần sau, sao lưu dữ liệu cần giữ. Nếu `migrate` lỗi, không ép API chạy qua lỗi đó.

## Kết nối ra Internet sau khi API nội bộ ổn

Người quản trị Nginx xác nhận tên miền API, định tuyến HTTPS đến `127.0.0.1:3080`, kiểm tra chứng chỉ và header IP thật. Sau đó kiểm tra `/api/health` qua HTTPS, CORS/cookie từ chính domain Vercel, đăng ký/đăng nhập, 401/403/429, ZaloPay callback và chuyển hướng kết quả. Chỉ sau khi đường HTTPS hoạt động mới cập nhật `VITE_API_BASE_URL` trên Vercel và triển khai lại frontend. Đừng trỏ Vercel vào cổng 3080: cổng này cố ý chỉ nghe ở localhost của VPS.

Ubuntu 20.04 đã qua giai đoạn hỗ trợ tiêu chuẩn; cần kế hoạch bản vá bảo mật (ví dụ Ubuntu Pro/ESM) và lịch nâng cấp được cả hai người dùng máy thống nhất. Việc triển khai thử không có nghĩa hệ điều hành đã an toàn cho vận hành lâu dài.
