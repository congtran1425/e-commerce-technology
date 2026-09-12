# Thử toàn bộ luồng cục bộ bằng ngrok

Trạng thái: CLI đã cài và tài khoản ngrok đã được liên kết  
Cập nhật: 2026-09-12

ngrok tạo một địa chỉ HTTPS công khai tạm thời chuyển tiếp vào frontend Vite trên máy phát triển. Vite phục vụ trang web và chuyển tiếp `/api` nội bộ sang Express. Nhờ vậy callback ZaloPay, trang kết quả và cookie đăng nhập cùng dùng một miền; đây không phải môi trường production.

## Phần đã hoàn thành

- ngrok CLI 3.39.11 đã được cài bằng WinGet và cập nhật bằng lệnh `ngrok update`.
- Cấu hình ngrok nằm trong hồ sơ người dùng Windows, ngoài repository.
- Không mở PostgreSQL và không ghi mã xác thực ngrok vào `.env` hay Git.

Nếu terminal chưa nhận lệnh `ngrok`, hãy đóng terminal hiện tại rồi mở terminal mới để Windows cập nhật `PATH`.

## Liên kết tài khoản một lần

Đăng nhập trang quản lý ngrok, sao chép authtoken của tài khoản rồi tự chạy lệnh sau trong terminal. Không gửi token vào chat và không đặt token trong repository.

```powershell
ngrok config add-authtoken <AUTHTOKEN_CUA_BAN>
ngrok config check
```

## Mỗi lần thử trọn luồng ZaloPay

Terminal 1:

```powershell
npm.cmd run db:start
npm.cmd run dev:api
```

Terminal 2:

```powershell
npm.cmd run preview:web
```

Lệnh này build frontend rồi phục vụ bản đã gom gọn ở cổng `5173`. Không dùng `dev:web` cho lượt thanh toán qua ngrok vì Vite development tải nhiều mô-đun riêng lẻ qua tunnel, có thể tạo màn hình trắng kéo dài. Sau khi sửa frontend, dừng preview và chạy lại `preview:web` để nhận bản build mới.

Terminal 3:

```powershell
ngrok http 5173
```

ngrok sẽ hiện một địa chỉ dạng `https://...ngrok-free.dev`. Đặt các biến cục bộ sau trong `apps/api/.env`:

```dotenv
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,https://...ngrok-free.dev
ZALOPAY_CALLBACK_URL=https://...ngrok-free.dev/api/payments/zalopay/callback
ZALOPAY_REDIRECT_URL=https://...ngrok-free.dev/thanh-toan/ket-qua
```

Frontend cục bộ dùng đường dẫn tương đối để request đi qua Vite:

```dotenv
VITE_API_BASE_URL=/api
```

Sau khi đổi các biến, khởi động lại cả API và Vite trước khi tạo giao dịch mới. Mở website bằng URL ngrok, đăng nhập và bắt đầu thanh toán từ URL đó; không bắt đầu từ `localhost:5173` trong lần kiểm thử này.

Kiểm tra nhanh trước khi tạo giao dịch:

1. Mở URL ngrok trong đúng trình duyệt sẽ dùng để thanh toán.
2. Nếu ngrok hiện trang cảnh báo, kiểm tra đúng tên miền tunnel rồi chọn **Visit Site** một lần.
3. Mở `<URL_NGROK>/api/health`; kết quả phải báo dịch vụ đang hoạt động.
4. Quay lại trang chủ qua URL ngrok, đăng nhập và tạo một giao dịch mới. Giao dịch cũ vẫn giữ URL chuyển hướng được gắn tại thời điểm nó được tạo.

Nếu trang kết quả chỉ có nền trắng, xác nhận Terminal 2 đang chạy `preview:web`, không phải `dev:web`. Sau mỗi lần sửa frontend, cần dừng tiến trình xem thử và chạy lại `preview:web` để tạo bản build mới.

## Giới hạn và an toàn

- Chỉ mở cổng frontend Vite `5173`; Express `3000` được Vite chuyển tiếp nội bộ và PostgreSQL `5433` không được mở trực tiếp.
- Trang cảnh báo chống lạm dụng của gói ngrok miễn phí có thể xuất hiện ở lần truy cập đầu tiên; chọn tiếp tục chỉ khi đúng URL tunnel của bạn.
- URL miễn phí có thể đổi sau mỗi lần chạy lại ngrok, nên phải cập nhật `CORS_ORIGIN`, callback, redirect và khởi động lại API trước khi tạo giao dịch mới.
- Đóng tiến trình ngrok sau khi thử xong.
- Không dùng URL ngrok miễn phí làm endpoint production hoặc làm DNS cố định.
