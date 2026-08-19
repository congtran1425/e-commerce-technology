# Hướng dẫn đóng góp

## Trước khi bắt đầu

1. Chọn hoặc tạo một GitHub Issue có phạm vi và tiêu chí hoàn thành rõ ràng.
2. Kiểm tra xem có thành viên nào đang sửa cùng module, API contract hoặc migration không.
3. Với thay đổi kiến trúc, tạo ADR ở trạng thái `Proposed` trước khi triển khai.

## Branch

Tạo branch ngắn hạn từ `main`:

```text
feat/<issue>-<mo-ta-ngan>
fix/<issue>-<mo-ta-ngan>
docs/<issue>-<mo-ta-ngan>
refactor/<issue>-<mo-ta-ngan>
```

Ví dụ: `feat/123-product-filter`.

Không dùng branch cố định theo tên thành viên. Không push trực tiếp lên `main` sau khi repository đã bật branch protection.

## Pull request

- Một PR chỉ giải quyết một mục tiêu.
- Liên kết Issue trong phần mô tả.
- Nêu rõ thay đổi API, database, biến môi trường và ảnh chụp giao diện nếu có.
- Tự kiểm tra checklist trong PR template.
- Cần ít nhất một review từ thành viên khác trước khi merge.
- Thay đổi contract hoặc database cần review từ người phụ trách phần bị ảnh hưởng.
- Ưu tiên squash merge để giữ lịch sử `main` gọn.

## Tránh xung đột

- Pull/rebase `main` trước khi bắt đầu và trước khi yêu cầu review.
- Hạn chế nhiều người cùng sửa các file tổng hợp như router gốc, export gốc và lockfile.
- Cài package bằng npm trong đúng workspace, không sửa `package-lock.json` thủ công.
- Không format toàn bộ repository trong một PR tính năng.
- Không đổi tên hoặc di chuyển hàng loạt file khi chưa thông báo nhóm.
- Giữ module nghiệp vụ tự chứa; chỉ thay đổi public contract khi có sự thống nhất.

## Definition of Done

Xem [docs/workflows/definition-of-done.md](docs/workflows/definition-of-done.md).
