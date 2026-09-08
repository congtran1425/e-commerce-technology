# Hướng dẫn phát triển

Dù hiện là dự án cá nhân, mọi thay đổi vẫn đi qua quy trình có thể kiểm tra lại để lịch sử repository phù hợp với một sản phẩm dùng trong hồ sơ năng lực.

## Trước khi bắt đầu

1. Tạo hoặc chọn GitHub Issue có phạm vi và tiêu chí hoàn thành rõ ràng.
2. Kiểm tra các thay đổi đang dở để tránh sửa chồng lên cùng module, hợp đồng API hoặc migration.
3. Với thay đổi kiến trúc đáng kể, tạo ADR ở trạng thái `Proposed` trước khi triển khai.

## Nhánh

Tạo nhánh ngắn hạn từ `main`:

```text
feat/<issue>-<mo-ta-ngan>
fix/<issue>-<mo-ta-ngan>
docs/<issue>-<mo-ta-ngan>
refactor/<issue>-<mo-ta-ngan>
```

Ví dụ: `feat/123-product-filter`.

Không đẩy trực tiếp lên `main` khi branch protection đã được bật.

## Pull request

- Một pull request chỉ giải quyết một mục tiêu.
- Liên kết Issue trong phần mô tả.
- Nêu rõ ảnh hưởng đến API, database, biến môi trường và giao diện.
- Tự đọc lại toàn bộ diff và hoàn thành checklist.
- Chỉ merge khi kiểm tra tự động thành công.
- Ưu tiên squash merge để lịch sử `main` gọn.
- Khi có cộng tác viên, yêu cầu review cho thay đổi quan trọng về bảo mật, hợp đồng API và migration.

## Hạn chế xung đột

- Cập nhật `main` trước khi bắt đầu và trước khi mở pull request.
- Cài package bằng npm trong đúng workspace; không sửa `package-lock.json` thủ công.
- Không format toàn bộ repository trong pull request tính năng.
- Không đổi tên hoặc di chuyển hàng loạt tệp ngoài phạm vi Issue.
- Giữ module nghiệp vụ tự chứa; chỉ thay đổi hợp đồng công khai khi đã cập nhật mọi nơi sử dụng.

## Điều kiện hoàn thành

Xem [docs/workflows/definition-of-done.md](docs/workflows/definition-of-done.md).
