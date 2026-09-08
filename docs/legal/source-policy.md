# Quy tắc sử dụng mã nguồn bên thứ ba

Tài liệu này là quy tắc kỹ thuật nội bộ, không thay thế tư vấn pháp lý.

## “Giới hạn giấy phép” là gì?

Tác giả phần mềm mặc nhiên giữ bản quyền đối với mã họ viết. Giấy phép là văn bản cho người khác một số quyền cụ thể, chẳng hạn quyền dùng, sửa, sao chép và phân phối. “Giới hạn giấy phép” là ranh giới dự án này tự đặt ra để chỉ nhận mã có điều khoản đủ rõ, tương thích và có thể tuân thủ lâu dài.

Việc repository xem được công khai trên GitHub không có nghĩa là mã thuộc phạm vi công cộng. Nếu không có giấy phép, không có cơ sở để sao chép mã, tạo bản sửa đổi hoặc phân phối lại; nguồn đó chỉ được dùng để quan sát và học ý tưởng chung.

## Chính sách mặc định

Cho phép xem xét để tái sử dụng:

- MIT;
- Apache License 2.0;
- BSD 2-Clause;
- BSD 3-Clause.

Các giấy phép này thường cho phép dùng, sửa và phân phối, kể cả trong sản phẩm thương mại, nhưng vẫn phải giữ thông báo bản quyền/giấy phép. Apache-2.0 còn có yêu cầu liên quan đến tệp `NOTICE`, đánh dấu thay đổi và điều khoản bằng sáng chế.

Không tái sử dụng mã nếu chưa đánh giá riêng:

- GPL hoặc AGPL và các giấy phép copyleft khác;
- giấy phép chỉ cho mục đích phi thương mại;
- giấy phép “source available” nhưng không phải mã nguồn mở;
- giấy phép tự viết hoặc có điều khoản mơ hồ;
- repository không có tệp giấy phép rõ ràng.

Đây không phải kết luận rằng các giấy phép trên “xấu”. Chúng chỉ có nghĩa vụ khác, có thể buộc công khai mã nguồn của phần kết hợp hoặc đặt điều kiện vận hành/phân phối mà dự án chưa chủ động chấp nhận.

## Quy trình kiểm tra trước khi dùng

1. Kiểm tra `LICENSE`, thông tin giấy phép trên GitHub và giấy phép của từng dependency.
2. Ghi URL repository và mã commit đã khảo sát; không dựa vào nhánh luôn thay đổi.
3. Xác định rõ phần định dùng: mã, icon, font, ảnh, dữ liệu hay chỉ ý tưởng. Mỗi loại có thể mang giấy phép khác nhau.
4. Đọc nghĩa vụ giữ thông báo, ghi công, công bố thay đổi, phân phối mã nguồn và tệp `NOTICE`.
5. Chỉ sao chép sau khi xác nhận tương thích.
6. Ghi vào `THIRD_PARTY_NOTICES.md` và giữ bản giấy phép cần thiết.
7. Thay đổi thiết kế, nội dung và nhận diện cho đúng sản phẩm; giấy phép cho phép sao chép không đồng nghĩa sao chép nguyên trạng là lựa chọn thiết kế tốt.

## Thư mục khảo sát

Repository tham khảo được clone vào `.references/`, thư mục đã bị Git bỏ qua. Việc clone không tự động cấp quyền dùng mã. Không thay thế trực tiếp `apps/web` hoặc `apps/api` bằng một repository tham khảo.

## Phân biệt ba mức sử dụng

- **Tham khảo:** xem luồng, cấu trúc thông tin và ý tưởng chung; không chép mã/tài nguyên.
- **Chuyển thể:** viết lại hoặc tích hợp có chọn lọc dựa trên mã được cấp phép; phải ghi nhận nguồn và tuân thủ giấy phép.
- **Phụ thuộc:** cài package qua npm; vẫn phải kiểm tra giấy phép và rủi ro chuỗi cung ứng.

Khi không chắc, dừng ở mức tham khảo và ghi vấn đề cần quyết định thay vì tự cho phép sử dụng.

## Nguồn tra cứu chính

- [GitHub Docs — Licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- [Open Source Initiative — Frequently Answered Questions](https://opensource.org/faq)
- [Choose a License — Danh mục và điều kiện giấy phép](https://choosealicense.com/licenses/)
- [Apache Software Foundation — Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [GNU Project — Why the Affero GPL](https://www.gnu.org/licenses/why-affero-gpl.html)
