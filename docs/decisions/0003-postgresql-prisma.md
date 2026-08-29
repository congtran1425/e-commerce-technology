# Sử dụng PostgreSQL và Prisma ORM

Status: Accepted
Date: 2026-08-30

## Context

Nghiệp vụ có nhiều quan hệ và invariant: sản phẩm–biến thể–tồn kho, công thức–định lượng–sản phẩm tương thích, giỏ hàng, đơn hàng, thanh toán và hoàn tiền. Nhóm không bị ràng buộc phải dùng một database hoặc ORM khác.

## Decision

- Sử dụng PostgreSQL làm relational database.
- Sử dụng Prisma ORM để định nghĩa schema, tạo migration và truy cập dữ liệu từ Express/TypeScript.
- Migration là nguồn sự thật có thể thực thi; không chỉnh production schema thủ công.
- Mỗi foreign key phục vụ join/filter phải được xem xét index rõ ràng vì PostgreSQL không tự tạo index cho foreign key.
- Dùng kiểu số chính xác cho tiền và định lượng; timestamp phải có timezone ở database.
- Sử dụng connection pool phù hợp môi trường deploy và tránh tạo connection mới theo request.
- Runtime role chỉ có quyền tối thiểu cần thiết.

## Consequences

- Mô hình dữ liệu và transaction phù hợp luồng tồn kho–order–payment.
- Thành viên phải review migration cùng code thay đổi nghiệp vụ.
- Cần thiết kế snapshot giá/tên sản phẩm trong order item để lịch sử đơn không bị thay đổi khi catalog cập nhật.
- Prisma không thay thế việc hiểu constraint, index, query plan và transaction của PostgreSQL.
- Provider PostgreSQL vẫn là quyết định riêng, được chốt sau benchmark hạ tầng.
