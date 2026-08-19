# Triển khai

## Môi trường dự kiến

```text
Local:       localhost frontend + localhost API
Preview:     Vercel preview + backend staging
Production:  frontend domain + API domain/subdomain
```

Một domain gốc có thể phục vụ cả hai hostname:

```text
example.com       -> React trên Vercel
api.example.com   -> Express API
```

Không cần mua hai domain gốc riêng. Trước khi có domain riêng có thể dùng hostname do Vercel và nhà cung cấp backend cấp.

## Yêu cầu production

- HTTPS cho frontend và API.
- CORS chỉ cho phép các origin frontend hợp lệ.
- URL API được cấu hình bằng biến môi trường, không hard-code.
- Secret chỉ nằm trong hệ thống quản lý biến môi trường của nền tảng.
- React SPA phải có rewrite/fallback để mở trực tiếp route như `/admin/products` không trả 404.
- Có migration database, health check, logging và kế hoạch rollback trước khi demo chính thức.
