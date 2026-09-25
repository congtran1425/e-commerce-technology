# Nhập dữ liệu công thức ban đầu

Trạng thái: Đã nhập dữ liệu có cấu trúc; định lượng và bước làm chưa được duyệt để xuất bản  
Cập nhật: 2026-09-12

## Nguồn

Dữ liệu định lượng ban đầu được chủ dự án cung cấp trong tệp cục bộ `Nguyên liệu.docx`. Tài liệu `Bep_Du_Banh_Cong_thuc_va_cau_chuyen.docx` bổ sung tên thương hiệu, câu chuyện món và các bước làm rút gọn. Hai tệp nguồn hiện không nằm trong repository. Bản seed đã chuyển một phần nội dung thành dữ liệu có cấu trúc tại `apps/api/prisma/recipe-seed-data.ts`; ứng dụng không đọc tệp Word khi chạy.

Tài liệu có 12 món thuộc bốn nhóm: bánh quy, bánh ngọt, món tráng miệng và bánh mì. Công thức bánh bông lan có hai cỡ khuôn với hai định lượng khác nhau, nên dữ liệu chạy tách thành hai biến thể công thức. Tổng cộng seed đồng bộ 13 biến thể công thức từ tệp, ngoài công thức Basque cheesecake minh họa đã có trước đó.

## Quy tắc chuẩn hóa tạm thời

- `gr` được chuẩn hóa thành `g`; tên nguyên liệu tương đương được gom về một tên thống nhất khi đơn vị giống nhau.
- Khoảng định lượng lấy cận trên để kế hoạch mua không bị thiếu. Khoảng gốc được giữ trong `recipe_ingredients.note`.
- Khoảng thời gian lấy cận trên. Thời gian chờ hoặc ủ được ghi vào mô tả nguồn khi schema chưa có trường thời gian chờ riêng.
- Bánh bông lan 3 trứng và 4 trứng được tách thành hai mục vì đây là hai công thức gốc theo cỡ khuôn, không chỉ là phép nhân khẩu phần.
- Nguyên liệu được cân theo gram và nguyên liệu đếm theo quả là hai bản ghi khác nhau nếu chưa có quy tắc quy đổi đáng tin cậy. Ví dụ: `Trứng gà` và `Trứng gà (theo khối lượng)`.
- Thành phần không bắt buộc nhưng không có định lượng, như quả khô của bánh quy cranberry, chưa được đưa vào bảng định lượng để tránh tạo số liệu giả.

## Trạng thái kiểm chứng

Tài liệu mới có thêm câu chuyện và các bước làm, nhưng việc đối chiếu nguồn đã phát hiện một số mâu thuẫn về tỷ lệ, tên kỹ thuật, thời gian và an toàn thực phẩm. Chi tiết nằm trong [báo cáo rà soát nguồn công thức](../content/recipe-source-review.md). Dữ liệu seed hiện là **dữ liệu phát triển**, không phải bằng chứng rằng công thức đã được thử bếp.

Cho đến khi từng công thức có bản chuyển thể và biên bản thử:

- các trang công thức phải nói rõ khi bước làm, nhiệt độ hoặc định lượng chưa được kiểm chứng;
- nguyên liệu chưa có ánh xạ sản phẩm vẫn xuất hiện đúng định lượng nhưng báo chưa có quy cách bán;
- công thức bị đánh giá `Chưa xuất bản` không được cho tạo giỏ hàng công khai;
- nút giỏ hàng của công thức còn lại chỉ thêm các mặt hàng thực sự có quy cách và cảnh báo số mục còn thiếu;
- không tạo giá hoặc tồn kho minh họa mới ngoài danh mục thử nghiệm đã có.

Câu chuyện thương hiệu đã được biên tập riêng tại [nền tảng câu chuyện Một Mẻ Bánh](../content/brand-story.md). Câu chuyện thương hiệu, câu chuyện món và bài viết chuyên sâu là ba lớp nội dung khác nhau.

## Quyết định cần chốt

1. Khi tài liệu ghi một khoảng định lượng, người dùng được chọn trong khoảng hay hệ thống luôn dùng cận trên?
2. Khẩu phần dạng khoảng như 25–30 cái nên lấy mốc gốc lớn nhất, nhỏ nhất hay tách thành lựa chọn cỡ mẻ?
3. Cần bổ sung quy cách bán, giá và tồn kho nào cho từng nguyên liệu mới?
4. Chủ dự án sẽ tự thử bếp hay cần một người có kinh nghiệm cùng xác nhận các bước làm và kết quả?
5. Có cần thêm các đơn vị `túi`, `gói`, `cốc` vào mô hình định lượng hay chỉ dùng chúng cho quy cách sản phẩm?
6. Công thức chưa kiểm chứng sẽ bị ẩn hoàn toàn hay vẫn được xem với nhãn `Đang thử nghiệm` và không có nút tạo giỏ?
