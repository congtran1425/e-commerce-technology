# Web application

React frontend dành cho khách hàng (`/*`) và quản trị viên (`/admin/*`).

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
