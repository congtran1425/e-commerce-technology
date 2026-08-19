# API application

Express REST API chịu trách nhiệm xác thực, phân quyền và nghiệp vụ.

## Chạy ứng dụng

Sao chép `apps/api/.env.example` thành `apps/api/.env` nếu cần thay đổi cấu hình, sau đó chạy từ root:

```bash
npm ci
npm run dev:api
```

API mặc định chạy tại `http://localhost:3000`. Kiểm tra bằng `GET http://localhost:3000/api/health`.

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
