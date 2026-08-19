# API application

Express REST API chịu trách nhiệm xác thực, phân quyền và nghiệp vụ.

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
