# Tổng quan kiến trúc

## Mục tiêu

Hệ thống là website thương mại điện tử gồm React frontend và Express REST API giao tiếp qua HTTPS. Frontend dự kiến triển khai trên Vercel; backend triển khai độc lập trên một dịch vụ SaaS/PaaS phù hợp.

## Ranh giới ứng dụng

- `apps/web`: hiển thị giao diện, quản lý trạng thái phía client và gọi API.
- `apps/api`: xác thực, phân quyền, kiểm tra input và thực hiện nghiệp vụ.
- Database: chỉ backend được truy cập trực tiếp.
- `packages/contracts`: mô tả dữ liệu qua ranh giới frontend/backend.

## Frontend

Customer và admin nằm trong cùng React app nhưng có layout và route riêng:

```text
/*          -> CustomerLayout
/admin/*    -> AdminLayout
```

Frontend được chia theo feature. `shared` chỉ chứa phần thật sự dùng ở nhiều feature. `pages` chịu trách nhiệm ghép feature thành màn hình.

## Backend

Backend được chia theo module nghiệp vụ, không gom toàn bộ controller/service/repository của mọi nghiệp vụ vào các thư mục toàn cục.

```text
route -> middleware -> controller -> service -> repository -> database
```

- Controller chuyển đổi giữa HTTP và lời gọi nghiệp vụ.
- Service giữ quy tắc nghiệp vụ.
- Repository đóng gói truy cập dữ liệu.
- Schema kiểm tra dữ liệu đầu vào.
- Một module không truy cập repository nội bộ của module khác.

## Nguyên tắc phụ thuộc

- `apps` có thể phụ thuộc `packages`.
- `packages` không phụ thuộc `apps`.
- Contract không chứa business logic và không phụ thuộc framework.
- Tránh import xuyên sâu; mỗi module/package cung cấp public API qua entry point.

## Các module dự kiến

Auth, users, products, categories, carts, orders, inventory và có thể payments. Danh sách này sẽ được điều chỉnh theo phạm vi đồ án.
