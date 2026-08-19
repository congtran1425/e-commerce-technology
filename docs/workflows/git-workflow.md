# Quy trình Git

```text
Issue -> branch ngắn hạn -> commit nhỏ -> pull request -> review -> CI -> squash merge
```

## Quy tắc

- `main` phải luôn ở trạng thái có thể build/test và về sau được bảo vệ.
- Mọi công việc bắt đầu từ Issue có tiêu chí hoàn thành.
- Không dùng branch lâu dài theo tên thành viên.
- Một PR giải quyết một mục tiêu và có ít nhất một reviewer khác tác giả.
- Thông báo sớm khi sửa contract, migration hoặc file trung tâm có khả năng xung đột.
- Không merge khi CI thất bại hoặc thảo luận review chưa được giải quyết.

Quy ước branch và checklist chi tiết nằm trong `CONTRIBUTING.md` và PR template.
