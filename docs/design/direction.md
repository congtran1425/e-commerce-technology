# Định hướng trải nghiệm và giao diện

Trạng thái: Định hướng và tên thương hiệu đã chấp nhận; logo và hệ nhận diện chi tiết chưa khóa
Cập nhật: 2026-09-12

## Ba trụ cột đã chốt

- **Tên thương hiệu:** Bếp Đủ Bánh.
- **Đối tượng:** người Việt tự làm bánh tại nhà, từ người mới đến người có kinh nghiệm.
- **Hành trình chính:** chọn món bánh → chọn khẩu phần → mua đủ nguyên liệu và dụng cụ.
- **Cảm giác:** thủ công, ấm áp.

## Ý nghĩa đối với trải nghiệm

- Điểm bắt đầu nên là món bánh hoặc công thức, không phải một lưới sản phẩm vô danh.
- Thay đổi khẩu phần phải cho thấy ngay định lượng cần, quy cách mua được đề xuất và lượng có thể dư.
- Người mới cần giải thích đơn vị, dụng cụ bắt buộc, độ khó và bước tiếp theo; người có kinh nghiệm cần thao tác nhanh và quyền điều chỉnh.
- Nội dung đọc và mua sắm phải hỗ trợ nhau: câu chuyện tạo hứng thú, công thức tạo sự tự tin, giỏ hàng giúp hành động.
- Giao diện quản trị ưu tiên rõ ràng và hiệu quả; không cần mô phỏng chất “thủ công” bằng cách làm giảm khả năng đọc dữ liệu.

## Ngôn ngữ thị giác sơ bộ

“Thủ công ấm áp” được hiểu là chất liệu và nhịp điệu có cảm giác con người làm ra: ảnh món bánh thật, bố cục mang tính biên tập, khoảng trắng dễ thở, chi tiết vừa phải và lời văn gần gũi. Không đồng nghĩa với dùng màu nâu/be cho mọi thứ, font viết tay tràn lan hoặc thêm họa tiết trang trí vô nghĩa.

Tên `Bếp Đủ Bánh` đã được khóa. Logo, bảng màu và cặp font vẫn cần một vòng nghiên cứu nhận diện riêng; không tự xem cách trình bày chữ hiện tại là logo chính thức.

## Quy trình thiết kế

1. Xác định mục tiêu và nội dung thật của màn hình.
2. Khảo sát repository có giấy phép phù hợp và sản phẩm cùng ngữ cảnh.
3. Trích xuất nguyên tắc hữu ích: cấu trúc thông tin, mô hình tương tác, cách thể hiện biến thể và trạng thái.
4. Phác thảo luồng và khung giao diện bằng nội dung tiếng Việt thật hoặc dữ liệu được đánh dấu là mẫu.
5. Tạo hệ thống thiết kế riêng; không giữ nguyên nhận diện của nguồn.
6. Kiểm tra trên điện thoại, bàn phím, trạng thái tải/lỗi/rỗng/hết hàng và tốc độ cảm nhận.

Nguồn tham khảo chỉ cung cấp “nguyên tắc cấu tạo”, không phải bản mẫu để sao chép theo từng điểm ảnh.

## Hệ thống quản trị vận hành

- Kiểu bố cục: bàn điều hành với thanh điều hướng bên trái trên màn hình rộng và menu thu gọn trên màn hình hẹp.
- Ba nhóm thông tin: **Điều hành** (tổng quan, đơn hàng, vận chuyển, giao dịch), **Hàng hóa** (sản phẩm, kho vận) và **Phân tích** (báo cáo).
- Tổng quan ưu tiên hàng đợi cần xử lý, không dùng biểu đồ trang trí hoặc chỉ số tự suy đoán.
- Đơn hàng dùng danh sách–chi tiết. Chuyển trạng thái chỉ tiến theo luồng đã được backend kiểm tra; frontend không tự quyết định quy tắc nghiệp vụ.
- Trên điện thoại, dữ liệu dài được chuyển thành các dòng hoặc thẻ đọc dọc, không ép bảng nhiều cột và không giấu thao tác sau trạng thái rê chuột.
- Cùng dùng hệ kiểu chữ và tông giấy ấm hiện có, nhưng giảm chất trang trí để con số, trạng thái và tác vụ rõ hơn.
