# Triển khai

## Môi trường dự kiến

```text
Local:       localhost frontend + localhost API
Preview:     Vercel preview + backend staging
Production:  Vercel frontend + Oracle Cloud API/PostgreSQL
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
- Có migration database, health check, logging, giám sát cơ bản và kế hoạch rollback trước khi phát hành.

## Phương án Oracle Cloud đã chọn

Một máy ảo Oracle Cloud tại Singapore chạy Docker Compose gồm ba dịch vụ:

```text
Internet -> Caddy (HTTPS) -> Express API -> PostgreSQL
                                  |
                                  `-> ZaloPay Sandbox qua HTTPS
```

Chỉ Caddy công khai cổng `80` và `443`. API và PostgreSQL nằm trên mạng Docker nội bộ; cổng database không mở trên tường lửa Oracle. Caddy tự xin và gia hạn chứng chỉ TLS sau khi `api.<domain>` trỏ đến IP công khai của máy ảo.

Migration chạy bằng một container dùng một lần trước khi API khởi động. Database dùng ổ đĩa Docker bền vững, nhưng ổ đĩa này không thay thế sao lưu ngoài máy. Quy trình cài máy, DNS, biến môi trường, sao lưu và phát hành nằm trong [hướng dẫn Oracle Cloud](../deployment/oracle-cloud.md).
