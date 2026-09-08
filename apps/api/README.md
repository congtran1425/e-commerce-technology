# API application

Express REST API chịu trách nhiệm xác thực, phân quyền và nghiệp vụ.

## Chạy ứng dụng

Khởi động PostgreSQL, sao chép `apps/api/.env.example` thành `apps/api/.env`, rồi tạo lược đồ và dữ liệu minh họa:

```bash
npm ci
npm run db:start
npm run db:migrate
npm run db:seed
npm run dev:api
```

PostgreSQL của dự án dùng cổng máy `5433` để tránh xung đột với dịch vụ PostgreSQL thường dùng cổng `5432`. API mặc định chạy tại `http://localhost:3000`.

- Kiểm tra API: `GET http://localhost:3000/api/health`
- Danh sách công thức: `GET http://localhost:3000/api/recipes`
- Kế hoạch cho khẩu phần: `GET http://localhost:3000/api/recipes/basque-cheesecake?servings=3`
- Đăng ký: `POST http://localhost:3000/api/auth/register`
- Đăng nhập: `POST http://localhost:3000/api/auth/login`
- Phiên hiện tại: `GET http://localhost:3000/api/auth/me`
- Đăng xuất: `POST http://localhost:3000/api/auth/logout`

Build production:

```bash
npm run build --workspace=@ecommerce/api
npm run start --workspace=@ecommerce/api
```

Stack hiện tại: TypeScript, Express 5, `tsx` cho development và `tsc` cho production.

Cấu trúc dự kiến khi khởi tạo source:

```text
src/
|-- app/                # tạo app, đăng ký router, khởi động server
|-- config/             # env và database
|-- modules/            # auth, users, products, carts, orders...
|-- middleware/         # authenticate, authorize, validate, error handler
|-- shared/             # error, logger và utility dùng chung
`-- index.ts
```

Mỗi module có thể chứa route, controller, service, repository, schema, types và test. Luồng phụ thuộc chuẩn:

```text
route -> middleware -> controller -> service -> repository -> database
```

Health route nằm tạm trong router gốc. Route nghiệp vụ mới phải nằm trong module tương ứng rồi được đăng ký ở `src/app/routes.ts`.

## Báo giá giỏ tạm

`POST /api/cart/quote` nhận mã biến thể và số lượng, sau đó đối chiếu giá và tồn kho hiện tại. Route này **không** lưu giỏ, giữ hàng hay trừ kho; vì vậy có thể gọi lại khi người dùng điều chỉnh số lượng. Việc tạo giỏ lưu tài khoản, đặt hàng và trừ kho sẽ thuộc các bước tiếp theo.

## Phiên đăng nhập

Module `auth` lưu mật khẩu bằng Argon2id và gửi mã phiên qua cookie `HttpOnly`. Database chỉ lưu bản băm của mã phiên. Thời hạn mặc định là 30 ngày, đổi được bằng `SESSION_TTL_DAYS`; chi tiết và các việc bảo mật còn lại nằm trong `docs/architecture/authentication.md`.

Khi thử API bằng công cụ ngoài trình duyệt, cần giữ cookie trả về từ register/login rồi gửi lại cookie đó cho `/auth/me`. Frontend đã dùng `credentials: include` cho các request tài khoản.

## Tạo tài khoản quản trị cục bộ

Mở `apps/api/.env` và thêm ba biến sau trước khi chạy seed:

```dotenv
SEED_ADMIN_DISPLAY_NAME=Quản trị viên
SEED_ADMIN_EMAIL=<email-quản-trị-của-bạn>
SEED_ADMIN_PASSWORD=<mật-khẩu-riêng-tối-thiểu-10-ký-tự>
```

Sau đó chạy từ thư mục gốc:

```bash
npm.cmd run db:seed
```

Seed dùng email làm khóa để tạo hoặc cập nhật đúng một tài khoản, đặt vai trò `ADMIN` và băm mật khẩu bằng Argon2id. Chạy lại seed với các biến trên sẽ cập nhật tên, mật khẩu, kích hoạt lại tài khoản và đăng xuất các phiên cũ. Nếu không cấu hình hai biến email và mật khẩu, phần dữ liệu minh họa vẫn được seed nhưng tài khoản quản trị sẽ được bỏ qua.

Các biến `SEED_ADMIN_*` chỉ dùng cho seed cục bộ. Không commit file `.env`, không dùng mật khẩu này ở dịch vụ khác và không mang tài khoản thử nghiệm lên production.

## Đơn hàng và ZaloPay Sandbox

Luồng thanh toán hiện tại yêu cầu đăng nhập. Backend tự đọc lại giá và tồn kho, giữ hàng trong một giao dịch database, tạo đơn ZaloPay rồi mới trả `checkoutUrl` cho frontend. Giá và tổng tiền do trình duyệt gửi lên không bao giờ được tin cậy.

- Tạo đơn và giao dịch: `POST /api/orders`
- Xem đơn của tài khoản hiện tại: `GET /api/orders/:orderNumber`
- Đối chiếu trạng thái với ZaloPay: `POST /api/orders/:orderNumber/payment-status`
- Nhận thông báo máy chủ từ ZaloPay: `POST /api/payments/zalopay/callback`

Sao chép các biến `ZALOPAY_*` trong `.env.example` sang `.env` rồi điền bộ khóa Sandbox. `ZALOPAY_CALLBACK_URL` phải là địa chỉ HTTPS công khai của API; `ZALOPAY_REDIRECT_URL` là trang kết quả trên frontend. API vẫn khởi động khi chưa có khóa, nhưng tạo hoặc đối chiếu thanh toán sẽ trả lỗi `PAYMENT_NOT_CONFIGURED` thay vì dùng khóa mẫu.

Thông báo chuyển hướng trình duyệt không được dùng làm bằng chứng thanh toán. Backend xác minh chữ ký của callback bằng `KEY2`, kiểm tra `app_id` và số tiền; đồng thời chạy tác vụ đối soát định kỳ cho giao dịch hết hạn hoặc bị lỡ callback. Xem chi tiết tại `docs/payments/zalopay.md`.
