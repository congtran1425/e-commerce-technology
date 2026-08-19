# Definition of Done

Một công việc chỉ hoàn thành khi các mục áp dụng được đáp ứng:

- [ ] Đúng acceptance criteria của Issue.
- [ ] Code nằm đúng module và không tạo phụ thuộc không cần thiết.
- [ ] Input được validate; quyền truy cập được kiểm tra ở backend.
- [ ] Test được thêm/cập nhật và chạy thành công.
- [ ] Lint, type-check và build thành công khi các công cụ đã được cấu hình.
- [ ] API contract/OpenAPI được cập nhật nếu API thay đổi.
- [ ] Migration và tài liệu schema được cập nhật nếu database thay đổi.
- [ ] `.env.example` được cập nhật nếu thêm biến môi trường; không commit secret.
- [ ] Tài liệu/ADR được cập nhật nếu hành vi hoặc kiến trúc thay đổi.
- [ ] PR được tự review, có reviewer khác chấp thuận và CI vượt qua.
