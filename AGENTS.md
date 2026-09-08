# Quy tắc làm việc cho tác nhân AI

Các quy tắc này áp dụng cho toàn bộ repository. Chỉ dẫn trong `AGENTS.md` nằm sâu hơn có thể bổ sung quy tắc cho phạm vi của thư mục đó.

## Bối cảnh sản phẩm

- Đây là dự án cá nhân độc lập.
- Đối tượng là người Việt muốn tự làm bánh tại nhà, từ người mới đến người có kinh nghiệm.
- Hành trình chính: chọn món bánh → chọn khẩu phần → mua đủ nguyên liệu và dụng cụ.
- Cảm giác giao diện: thủ công, ấm áp, có chất biên tập; tránh giao diện AI chung chung.
- Tên và nhận diện hiện tại là tạm thời. Không tự đổi thương hiệu khi chưa có yêu cầu.

## Trước khi thay đổi

- Đọc mã nguồn, tài liệu, trạng thái Git và chỉ dẫn gần nhất trước khi sửa.
- Nêu chính xác tệp dự kiến sửa, tạo hoặc xóa. Chỉ xóa sau khi chủ dự án xác nhận danh sách đường dẫn.
- Giữ thay đổi trong đúng phạm vi yêu cầu; không sửa hoặc hoàn tác phần không liên quan.
- Không đưa bí mật, token, khóa API hoặc dữ liệu cá nhân vào mã nguồn, log hay tài liệu.

## Thiết kế giao diện

- Không tự tạo trọn bộ giao diện từ một mô tả chung nếu chưa khảo sát nguồn tham khảo phù hợp.
- Trước tiên tìm repository công khai có giấy phép cho phép tái sử dụng; kiểm tra tệp giấy phép ở đúng commit khảo sát.
- Clone nguồn khảo sát vào `.references/`; không thay thế trực tiếp `apps/web` và không commit thư mục này.
- Chỉ chọn lọc cấu trúc, cách tổ chức hoặc thành phần cần thiết. Phải thay đổi nội dung, nhận diện, hệ thống thiết kế và luồng tương tác cho đúng sản phẩm.
- Không sao chép hình ảnh, logo, văn bản, dữ liệu hoặc giao diện theo từng điểm ảnh.
- Dùng Hallmark cho công việc thiết kế, kiểm tra hoặc tái thiết kế giao diện.
- Giao diện phải có trạng thái tải, rỗng, lỗi, thành công, không có quyền và hết hàng khi phù hợp.
- Kiểm tra khả năng dùng bàn phím, độ tương phản, giảm chuyển động và các chiều rộng 320, 375, 414, 768 px.

## Mã nguồn bên thứ ba

- Chỉ tái sử dụng mã có giấy phép rõ ràng và tương thích với dự án; ưu tiên MIT, Apache-2.0, BSD-2-Clause hoặc BSD-3-Clause.
- Repository không có giấy phép chỉ được dùng để tham khảo bằng mắt; không sao chép mã hoặc tài nguyên.
- Ghi nguồn, commit khảo sát, phần đã dùng, giấy phép và các thay đổi vào `THIRD_PARTY_NOTICES.md`.
- Giữ lại thông báo bản quyền và giấy phép theo yêu cầu. Với Apache-2.0, kiểm tra thêm tệp `NOTICE` và đánh dấu phần đã sửa.
- Không dùng mã GPL/AGPL, giấy phép phi thương mại, “source available”, hoặc giấy phép tự viết nếu chưa đánh giá và được chủ dự án chấp thuận.
- Chi tiết nằm trong `docs/legal/source-policy.md`.

## Chất lượng kỹ thuật

- Frontend không chứa bí mật; biến Vite có tiền tố `VITE_` được xem là công khai.
- Backend là nơi xác thực, phân quyền, kiểm tra đầu vào và thi hành quy tắc nghiệp vụ.
- Database chỉ được truy cập qua backend; migration Prisma là nguồn lược đồ có thể thực thi.
- Thay đổi API phải đồng bộ route, OpenAPI, kiểu dùng chung, frontend sử dụng API và kiểm thử.
- Chạy kiểm tra và build phù hợp trước khi bàn giao; nếu không chạy được, nêu rõ lý do.

## Tài liệu và ngôn ngữ

- Viết tài liệu cho người đọc tiếng Việt; giải thích thuật ngữ tiếng Anh ở lần xuất hiện đầu tiên.
- Dùng `docs/product/vision.md` cho quyết định sản phẩm đã chốt và ADR cho quyết định kỹ thuật đáng kể.
- Không biến suy đoán thành yêu cầu đã chốt. Gắn trạng thái rõ ràng cho vấn đề còn mở.
