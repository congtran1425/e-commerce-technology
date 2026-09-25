# Triển khai API lên Oracle Cloud

> Với VPS đang dùng chung Nginx, xem [quy trình VPS dùng chung](shared-vps.md). Các lệnh Caddy bên dưới chỉ dành cho VPS chạy riêng dự án này.

Hướng dẫn bên dưới lưu phương án cũ: một máy ảo Oracle Cloud chạy riêng Caddy, Express API và PostgreSQL bằng Docker Compose. VPS hiện tại dùng chung và phải theo tài liệu liên kết ở trên. Tên thương hiệu chính thức là `Một Mẻ Bánh`; frontend production vẫn ở `bepdubanh.congtc145.id.vn`. Hostname API đã chốt là `apimotmebanh.congtc145.id.vn`, nhưng việc chuyển từ đường kết nối hiện tại sang VPS phải được kiểm tra và thực hiện đồng bộ.

> **Lưu ý trước khi triển khai trên máy dùng chung:** cấu hình Caddy/Compose bên dưới là phương án cũ cho máy chỉ chạy một dự án. Máy Oracle hiện dùng chung với dự án khác và Nginx đã chiếm cổng công khai; **không chạy nguyên trạng `compose.production.yaml` trên máy này**. Cần chốt với người quản trị Nginx về hostname API, cổng nội bộ và cấu hình reverse proxy trước. Việc nâng Ubuntu 20.04 cũng không phải điều kiện tiên quyết để đưa API lên máy, nhưng phải có kế hoạch cập nhật bảo mật và thống nhất lịch bảo trì với người cùng dùng.

## 0. Kiểm tra trước khi đẩy GitHub

Chạy tại thư mục gốc trên Windows:

```powershell
git status --short --ignored
git check-ignore -v apps/api/.env deploy/oracle/.env server.js
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run deploy:oracle:config
npm.cmd run deploy:oracle:build
```

Ba tệp ở lệnh `git check-ignore` phải được báo là đã bỏ qua. Không dùng `git add -f` với chúng. Các tệp `.env.example` phải được commit vì chỉ là mẫu tên biến; trước khi commit vẫn phải kiểm tra chúng không chứa khóa thật.

Không đưa lên GitHub: `.env` thật, `server.js` thử nghiệm, private key SSH/TLS, file sao lưu database, cookie phiên, APP_ID/KEY1/KEY2 ZaloPay hoặc URL clone có gắn token. Nếu repository công khai, GitHub có quét bí mật và bảo vệ lúc push, nhưng đây chỉ là lớp dự phòng chứ không thay cho kiểm tra cục bộ.

## 1. Tạo máy ảo

- Chủ dự án cho biết home region là Singapore West. Ảnh trang chủ chỉ thể hiện region đang được chọn, vì vậy trước khi tạo máy vẫn cần mở menu Region → **Manage Regions** và xác nhận Singapore West có nhãn **Home Region**. Tài nguyên Always Free phải được tạo trong home region.
- Ưu tiên `VM.Standard.A1.Flex` với tổng cấu hình trong hạn mức Always Free của tài khoản. Cấu hình 2 OCPU và 12 GB RAM phù hợp hơn cho bước build Docker, API và PostgreSQL so với máy E2.1.Micro chỉ có 1 GB RAM.
- Chọn Ubuntu 24.04 LTS hoặc 22.04 LTS, kiến trúc tương ứng với shape đã chọn. Các image Docker của dự án hỗ trợ cả AMD64 và ARM64.
- Kiểm tra nhãn Always Free-eligible và phần ước tính chi phí ngay trước khi bấm tạo; hết khả năng cung cấp máy miễn phí trong một availability domain không có nghĩa là cấu hình đã sai.
- Thêm SSH public key; không dùng mật khẩu đăng nhập SSH.
- Gán public IPv4 và dành riêng địa chỉ đó nếu tài khoản cho phép để bản ghi DNS không đổi khi máy được tạo lại.
- Trong Network Security Group hoặc Security List, tạm mở TCP `22` chỉ từ IP Internet hiện tại của máy quản trị để cài Tailscale; mở TCP `80`, `443` từ Internet cho API. Không mở `3000` hoặc `5432`.

Trước khi tiếp tục, ghi lại public IPv4 và thử SSH thành công. Không tải private key lên GitHub, Google Drive công khai hoặc máy chủ.

## 2. Trỏ DNS

Tại nhà cung cấp DNS, tạo bản ghi:

```text
Loại: A
Tên:  api.ecomtech
Giá trị: <public IPv4 của máy Oracle>
TTL:   300 hoặc mặc định
```

Chờ `api.ecomtech.congtc145.id.vn` phân giải đúng IP trước khi chạy Caddy. Cổng 80 và 443 phải thông để Caddy xin chứng chỉ HTTPS.

Kiểm tra từ máy cá nhân:

```powershell
Resolve-DnsName api.ecomtech.congtc145.id.vn
```

Kết quả phải chứa đúng public IPv4 của máy Oracle. Không tạo bản ghi proxy/WAF trong lần cấp chứng chỉ đầu tiên; chỉ bật lớp proxy sau khi HTTPS trực tiếp đã hoạt động và đã hiểu luồng mạng.

## 3. Chuẩn bị máy

### 3.1. Chuyển SSH sang Tailscale

Mục tiêu là không phụ thuộc vào IP Internet thường xuyên thay đổi của máy cá nhân. Tailscale chỉ bảo vệ đường quản trị SSH; API vẫn công khai qua cổng 80/443 và tên miền HTTPS.

1. Cài ứng dụng Tailscale trên máy Windows và đăng nhập vào tailnet của bạn.
2. Trong phiên SSH công khai đầu tiên tới máy Oracle, cài Tailscale theo hướng dẫn Linux chính thức, sau đó bật Tailscale SSH:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --ssh
tailscale status
tailscale ip -4
```

3. Mở **một terminal Windows thứ hai**, giữ nguyên phiên SSH cũ để có đường quay lại, rồi thử kết nối bằng tên MagicDNS hoặc IP `100.x` vừa nhận:

```powershell
tailscale status
ssh ubuntu@<ten-may-MagicDNS-hoac-IP-100.x>
```

4. Chỉ sau khi terminal thứ hai đăng nhập thành công, xóa ingress TCP `22` công khai khỏi Network Security Group/Security List của Oracle. Cổng `22` không cần mở với Internet để Tailscale SSH hoạt động.
5. Nếu đã sửa Access controls của tailnet, xác nhận policy cho phép cả kết nối tới máy đích trên cổng 22 và quyền Tailscale SSH. Policy mặc định của tailnet mới thường cho phép chính người dùng truy cập thiết bị của mình ở chế độ xác minh lại.

Không đóng các cổng 80/443 và không trỏ DNS tới IP `100.x` của Tailscale. Bản ghi DNS công khai vẫn phải trỏ tới public IPv4 đã dành riêng của máy Oracle.

### 3.2. Cài Docker và lấy mã nguồn

Đăng nhập SSH, cập nhật hệ điều hành và cài Docker Engine cùng Docker Compose plugin từ kho chính thức của Docker. Không dùng convenience script cho Docker trên máy production. Xác nhận hai lệnh sau chạy được:

```bash
sudo systemctl status docker
sudo docker compose version
```

Có thể tiếp tục dùng `sudo docker` để giảm phạm vi quyền. Thành viên của nhóm `docker` gần như có quyền root trên máy, vì vậy không thêm người dùng vào nhóm này chỉ để tránh gõ `sudo`.

Clone repository vào một thư mục riêng. Nếu repository là private, dùng deploy key chỉ có quyền đọc thay vì đưa mật khẩu hoặc Personal Access Token vào URL clone. Ví dụ:

```bash
sudo install -d -o "$(id -un)" -g "$(id -gn)" /opt/ecomtech
git clone <URL_REPOSITORY> /opt/ecomtech
cd /opt/ecomtech
cp deploy/oracle/.env.example deploy/oracle/.env
chmod 600 deploy/oracle/.env
```

Mở `deploy/oracle/.env` và điền:

- `API_DOMAIN`: hostname API không kèm `https://`.
- `POSTGRES_PASSWORD`: tạo bằng `openssl rand -hex 32`, chỉ dùng cho database này; chép đúng cùng giá trị vào `DATABASE_URL`. Chuỗi hexadecimal tránh lỗi ký tự đặc biệt trong URL kết nối.
- `CORS_ORIGIN`: domain production của Vercel và các domain preview thực sự cần dùng, phân cách bằng dấu phẩy.
- `ZALOPAY_*`: bộ khóa Sandbox; callback trỏ tới API Oracle, redirect trỏ tới frontend Vercel.

File `.env` này đã được Git bỏ qua. Không sao chép nội dung của nó vào issue, commit hoặc log.

Kiểm tra cấu hình Compose mà không in giá trị bí mật ra màn hình:

```bash
sudo docker compose --env-file deploy/oracle/.env -f compose.production.yaml config --quiet
```

## 4. Phát hành lần đầu

```bash
sudo docker compose --env-file deploy/oracle/.env -f compose.production.yaml build
sudo docker compose --env-file deploy/oracle/.env -f compose.production.yaml up -d
sudo docker compose --env-file deploy/oracle/.env -f compose.production.yaml ps -a
```

Kết quả mong đợi: `postgres` healthy, `migrate` thoát với mã `0`, `api` healthy và `caddy` đang chạy. Nếu `migrate` thất bại, không ép API chạy; đọc log và sửa migration hoặc cấu hình trước.

Kiểm tra:

```bash
curl https://api.ecomtech.congtc145.id.vn/api/health
sudo docker compose --env-file deploy/oracle/.env -f compose.production.yaml logs --tail=100 api caddy
```

Sau đó đặt `VITE_API_BASE_URL=https://api.ecomtech.congtc145.id.vn/api` trong Vercel và triển khai lại frontend. Kiểm tra cookie phiên, CORS, đăng nhập và thanh toán trên chính domain production.

## 5. Phát hành phiên bản mới

```bash
git pull --ff-only
sudo docker compose --env-file deploy/oracle/.env -f compose.production.yaml build
sudo docker compose --env-file deploy/oracle/.env -f compose.production.yaml up -d --remove-orphans
curl https://api.ecomtech.congtc145.id.vn/api/health
```

Migration phải tương thích ngược với phiên API đang chạy trong khoảng chuyển đổi. Với thay đổi phá vỡ lược đồ, chia thành nhiều lần phát hành: thêm cấu trúc mới, chuyển dữ liệu/mã, rồi mới xóa cấu trúc cũ ở một phiên sau.

## 6. Sao lưu và khôi phục

Trong giai đoạn chỉ dùng dữ liệu thử và có thể tạo lại hoàn toàn bằng migration/seed, chưa bắt buộc thiết lập sao lưu tự động ngoài máy. Tuy vậy, Docker volume và boot volume của cùng máy **không phải là bản sao lưu**; tránh chạy `docker compose down -v`, và tạo một bản `pg_dump` thủ công trước migration hoặc thao tác có nguy cơ làm mất dữ liệu.

Trước khi có người dùng thật, đơn hàng thật hoặc nội dung thủ công tốn công tái tạo, phải chuyển sang chế độ vận hành: tối thiểu mỗi ngày tạo bản sao `pg_dump` ở định dạng custom, mã hóa và chuyển khỏi máy ảo sang nơi lưu trữ khác.

Định kỳ diễn tập `pg_restore` vào một database tạm và ghi lại thời gian khôi phục. Trước mỗi migration rủi ro, tạo bản sao theo yêu cầu nhưng không xem bản sao là cách duy nhất để quay lui mã nguồn.

## 7. Vận hành an toàn

- Bật cập nhật bảo mật tự động hoặc có lịch vá hệ điều hành và Docker.
- Quản trị SSH qua Tailscale, không mở cổng 22 với Internet; tắt đăng nhập root và giữ private key ban đầu ngoài repository để khởi tạo/khôi phục khi cần.
- Docker có thể làm cổng đã publish vượt qua một số quy tắc UFW. Ranh giới Internet chính phải là Security List/Network Security Group của Oracle; đồng thời kiểm tra chuỗi `DOCKER-USER` nếu tự viết luật iptables trên máy.
- Theo dõi dung lượng đĩa, RAM, tải CPU, health endpoint, lỗi 5xx và kết quả sao lưu.
- Không ghi dữ liệu người nhận hoặc bí mật thanh toán vào log.
- Xoay mật khẩu database và khóa tích hợp khi nghi ngờ lộ lọt.
- Trước khi chuyển từ Sandbox sang production, dùng bộ khóa và endpoint production riêng; không sửa URL/khóa trực tiếp trong mã.

## 8. Quyết định còn mở

Trạng thái được ghi riêng cho từng mục. Các mục chưa chốt cần được trả lời trước khi chúng trở thành điều kiện vận hành thực tế:

1. **Đã chốt:** Singapore West là Home Region. Khi tạo máy vẫn phải kiểm tra `VM.Standard.A1.Flex` có nhãn Always Free-eligible và còn khả năng cung cấp hay không.
2. **Đã chốt:** frontend production vẫn dùng `bepdubanh.congtc145.id.vn`; hostname API mới là `apimotmebanh.congtc145.id.vn`. Cần chuyển đồng bộ đường DNS/Cloudflare hiện tại, Nginx, CORS, cookie và callback thanh toán sau khi API trên VPS qua kiểm tra nội bộ.
3. **Đã chốt:** repository GitHub là public; máy Oracle clone qua HTTPS và không cần token cho thao tác đọc.
4. **Đã chốt:** đăng ký và dùng bộ APP_ID, KEY1, KEY2 Sandbox chính thức dành cho ứng dụng trước; không dựa vào bộ khóa ghi cứng trong `server.js`.
5. **Tạm hoãn có điều kiện:** chưa tự động sao lưu ngoài máy khi toàn bộ dữ liệu còn là dữ liệu thử và có thể tạo lại bằng migration/seed. Phải triển khai sao lưu trước khi có người dùng thật, đơn hàng thật hoặc nội dung thủ công tốn công tái tạo; đồng thời tạo bản sao thủ công trước migration rủi ro.
6. **Đã chốt:** dùng Tailscale SSH để quản trị máy Oracle qua địa chỉ riêng ổn định. Chỉ đóng cổng 22 công khai sau khi đã xác minh kết nối Tailscale từ một terminal thứ hai.
7. **Đã chốt:** tạm chấp nhận cảnh báo phụ thuộc của Prisma CLI trong container migration một lần, theo dõi bản vá tương thích và không dùng `npm audit fix --force` để tự động hạ phiên bản lớn.

## Nguồn tham khảo vận hành

- Oracle hướng dẫn mở cổng mạng và tường lửa cho web server: <https://docs.oracle.com/en/learn/publish-webserver-using-oci/index.html>
- Oracle Always Free: <https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm>
- Oracle quản lý region và nhận biết Home Region: <https://docs.oracle.com/en-us/iaas/Content/Identity/Tasks/managingregions.htm>
- Docker Engine trên Ubuntu: <https://docs.docker.com/engine/install/ubuntu/>
- GitHub secret scanning và push protection: <https://docs.github.com/en/code-security/getting-started/github-security-features>
- Tailscale SSH: <https://tailscale.com/docs/features/tailscale-ssh>
