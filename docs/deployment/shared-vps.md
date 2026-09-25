# Triển khai Một Mẻ Bánh trên VPS dùng chung

Áp dụng cho máy Ubuntu 20.04 hiện đang chạy dự án khác qua Nginx. Đây là cấu hình **riêng cho máy dùng chung**; không chạy riêng `compose.production.yaml`, vì tệp đó bật Caddy trên cổng 80/443. Không nâng cấp hệ điều hành, thay đổi Nginx, tường lửa hoặc dịch vụ của người cùng dùng máy trong quy trình này.

## Ranh giới giữa các dự án

- Mã nguồn: `/opt/apps/bep-du-banh/repo`; cấu hình bí mật: `/opt/apps/bep-du-banh/config` (không nằm trong Git); dữ liệu PostgreSQL: volume riêng của Compose.
- Tên dự án Compose: `mot-me-banh`. API chỉ mở `127.0.0.1:3080` trên VPS; PostgreSQL không công bố cổng. Các cổng 9000 trở lên dành cho dự án của người cùng dùng máy.
- Giới hạn ban đầu trên máy 2 CPU/11 GiB RAM: API 1 CPU/768 MiB, PostgreSQL 1 CPU/1536 MiB, tác vụ migration 1 CPU/2 GiB. Đây là trần sử dụng, không phải tài nguyên được giữ riêng; theo dõi rồi điều chỉnh nếu tải thực tế thay đổi.
- Nginx hiện tại là chủ cổng công khai; hostname API đã chốt là `apimotmebanh.congtc145.id.vn`. Ngày 25/09/2026, hostname này đã trả `/api/health` qua Cloudflare từ một đường kết nối cũ, **không phải VPS**. Cần xác định và chuyển đường Cloudflare hiện tại một cách có kiểm soát. **Chưa đổi bản ghi DNS, callback ZaloPay hay biến `VITE_API_BASE_URL` trên Vercel** khi chỉ mới kiểm tra API nội bộ.
- Không thêm tài khoản thường vào nhóm `docker`: quyền đó gần tương đương root trên máy dùng chung.

## Điều kiện trước khi chạy

1. Kiểm tra `git status -sb`, nhánh/commit và chắc chắn mã nguồn cần phát hành đã lên GitHub. Clone hoặc `git pull --ff-only` vào thư mục riêng, không dùng thư mục dự án của người khác.
2. Máy đã cài `docker.io` và `docker-compose-v2` từ kho Ubuntu 20.04. Tài liệu Docker Engine chính thức hiện không liệt kê Ubuntu 20.04 trong các phiên bản được hỗ trợ; bộ gói Ubuntu này phục vụ giai đoạn thử nghiệm, cần kế hoạch cập nhật bảo mật riêng. Không thay bằng tập lệnh cài Docker tùy tiện hoặc nâng cấp OS khi máy vẫn dùng chung.
3. Trên VPS, chạy `bash /opt/apps/bep-du-banh/repo/deploy/oracle/init-shared-env.sh` để tạo `/opt/apps/bep-du-banh/config/.env` quyền `600`, với mật khẩu PostgreSQL ngẫu nhiên riêng. Script từ chối ghi đè tệp đã có. Không in `.env` ra terminal/chat/log; không chép khóa từ `server.js` minh họa.
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

Đường công khai hiện tại dùng **Cloudflare Tunnel trên máy cá nhân** đến API cục bộ, nên kiểm tra HTTPS ở hostname hiện tại không chứng minh VPS đã nhận yêu cầu. Khuyến nghị giữ Tunnel: tạo một Tunnel **riêng cho VPS**, thử trước bằng hostname phụ, rồi chuyển hostname chính thức sau khi quyết định chuyển hay bỏ dữ liệu đơn hàng/tài khoản ở máy cá nhân. Không chạy đồng thời hai connector của **cùng một Tunnel** ở hai máy có database khác nhau: lưu lượng có thể đến cả hai nơi.

Nếu dùng Tunnel trực tiếp tới API trên VPS, Cloudflare xử lý HTTPS công khai và không cần đổi Nginx hoặc cấp chứng chỉ cho Nginx. Tunnel mới cần token kết nối riêng, do chủ tài khoản nhập trực tiếp trên VPS và lưu trong tệp quyền hạn chế; không gửi token qua chat hoặc Git. Token `Zone:DNS:Edit` để cấp chứng chỉ bằng DNS **không cần thiết** cho phương án này. Chỉ dùng Nginx nếu chủ dự án chọn rõ việc đặt nó làm trung gian.

Sau khi đường VPS hoạt động qua hostname phụ, kiểm tra `/api/health`, danh sách công thức, CORS/cookie từ chính domain Vercel, 401/403/429 và luồng đơn hàng. Chỉ thử đăng ký và ZaloPay khi SMTP/khóa Sandbox và callback đã cấu hình. Sau khi chuyển hostname chính thức, xác nhận `VITE_API_BASE_URL` trên Vercel là `https://apimotmebanh.congtc145.id.vn/api` và triển khai lại frontend nếu giá trị thay đổi. Đừng trỏ Vercel vào cổng 3080: cổng này cố ý chỉ nghe ở localhost của VPS.

Ubuntu 20.04 đã qua giai đoạn hỗ trợ tiêu chuẩn; cần kế hoạch bản vá bảo mật (ví dụ Ubuntu Pro/ESM) và lịch nâng cấp được cả hai người dùng máy thống nhất. Việc triển khai thử không có nghĩa hệ điều hành đã an toàn cho vận hành lâu dài.
