# Quy trình Git

```text
Issue -> branch ngắn hạn -> commit nhỏ -> pull request -> review -> CI -> squash merge
```

## Quy tắc

- `main` phải luôn ở trạng thái có thể build/test và về sau được bảo vệ.
- Mọi công việc bắt đầu từ Issue có tiêu chí hoàn thành.
- Không dùng branch cá nhân lâu dài; branch chỉ tồn tại trong phạm vi một mục tiêu.
- Một PR giải quyết một mục tiêu và phải được tác giả tự review trước khi merge.
- Khi có cộng tác viên, yêu cầu review cho thay đổi quan trọng về bảo mật, hợp đồng hoặc migration.
- Không merge khi CI thất bại hoặc các nhận xét review chưa được giải quyết.

Quy ước branch và checklist chi tiết nằm trong `CONTRIBUTING.md` và PR template.
