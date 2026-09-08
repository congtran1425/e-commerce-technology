# Thông báo mã nguồn bên thứ ba

Hai repository trong danh mục nghiên cứu chỉ được quan sát, không có mã được sao chép. Giao diện hiện dùng các tài nguyên sau:

## Fraunces và IBM Plex Sans

- Nguồn: Google Fonts.
- Giấy phép: SIL Open Font License 1.1.
- Phần được sử dụng: kiểu chữ hiển thị và kiểu chữ nội dung, tải từ Google Fonts CDN trong `apps/web/index.html`.
- Lưu ý: đây là lựa chọn cho giai đoạn phát triển. Trước production nên tự lưu file font để giảm phụ thuộc và tránh gửi yêu cầu từ trình duyệt người dùng đến bên thứ ba.

## Lucide

- Nguồn: <https://github.com/lucide-icons/lucide>
- Giấy phép: ISC.
- Phần được sử dụng: biểu tượng giao diện thông qua package npm `lucide-react`.

Các package npm khác giữ nguyên giấy phép và thông báo đi kèm trong package tương ứng.

Khi tái sử dụng có chọn lọc, thêm một mục theo mẫu:

```md
## Tên dự án

- Nguồn: https://github.com/owner/repository
- Commit khảo sát: <commit SHA>
- Giấy phép: MIT | Apache-2.0 | BSD-2-Clause | BSD-3-Clause
- Phần được sử dụng: <tệp/thành phần/ý tưởng>
- Thay đổi đã thực hiện: <mô tả>
- Vị trí bản giấy phép hoặc NOTICE: <đường dẫn>
```

Không thêm mục cho nguồn chỉ được quan sát ở mức ý tưởng và không có mã/tài nguyên được sao chép. Trường hợp đó có thể ghi trong danh mục nghiên cứu thiết kế riêng.
