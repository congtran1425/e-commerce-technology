# Quy ước API

## Nguyên tắc

- API dùng JSON qua HTTPS.
- Endpoint được version nếu nhóm xác định có nhu cầu, ví dụ `/api/v1`.
- Dùng HTTP method và status code nhất quán.
- Lỗi trả về một cấu trúc thống nhất, không để lộ stack trace ở production.

Ví dụ cấu trúc lỗi dự kiến:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": []
  }
}
```

## Thay đổi contract

Một PR thay đổi API phải cập nhật đồng thời:

1. Route/method và quyền truy cập.
2. Request parameters hoặc body.
3. Response thành công và response lỗi.
4. `docs/api/openapi.yaml`.
5. `packages/contracts` nếu có type liên quan.
6. Test backend và phần frontend sử dụng API.

Không để frontend suy đoán response từ trao đổi miệng hoặc tin nhắn nhóm.
