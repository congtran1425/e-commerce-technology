# Web application

React frontend dành cho khách hàng (`/*`) và quản trị viên (`/admin/*`).

## Chạy ứng dụng

Từ thư mục gốc repository:

```bash
npm ci
npm run dev:web
```

Mở `http://localhost:5173`. Build production bằng `npm run build --workspace=@ecommerce/web`.

Stack hiện tại: TypeScript, React 19, Vite 8 và React Router 7. Phiên bản chính xác nằm trong `package-lock.json`.

Cấu trúc dự kiến khi khởi tạo source:

```text
src/
|-- app/                # router, providers, entry composition
|-- features/           # auth, catalog, cart, checkout, orders, admin...
|-- layouts/            # CustomerLayout, AdminLayout
|-- pages/              # trang customer, admin và lỗi
|-- shared/             # api client, component, hook, style dùng chung
`-- main.tsx
```

Mỗi feature nên tự chứa `api`, `components`, `hooks`, kiểu dữ liệu và `index.ts`. Không đặt business logic đáng kể trong `pages`.

Route `/admin` hiện chỉ minh họa phân luồng layout. Nó chưa được bảo vệ cho đến khi module auth được triển khai ở cả frontend và backend.
