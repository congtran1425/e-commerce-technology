# Danh mục mã nguồn giao diện tham khảo

Ngày khảo sát: 05/09/2026.

## Nguyên tắc sử dụng

- Chỉ học cách tổ chức luồng và trạng thái giao diện; không chép nguyên bộ giao diện.
- Chỉ sử dụng mã có giấy phép rõ ràng như MIT, Apache-2.0 hoặc BSD.
- Nếu sau này sao chép hoặc sửa trực tiếp một đoạn mã, phải ghi nguồn vào `THIRD_PARTY_NOTICES.md`.
- Hai repository dưới đây nằm trong `.references/`, chỉ phục vụ nghiên cứu cục bộ và không được commit.

## Spree Storefront

- Nguồn: <https://github.com/spree/storefront>
- Commit đã khảo sát: `9939d781bbbae239cce66daad5ba711585a38e07`
- Giấy phép: MIT.
- Nội dung học được: trạng thái biến thể còn hàng/hết hàng; nút thêm giỏ phụ thuộc khả năng mua; số lượng giỏ trên header; toàn vùng thẻ sản phẩm có thể mở trang chi tiết; giữ đường dẫn đích khi chuyển khách sang đăng nhập và lấy lại phiên khi ứng dụng khởi động.
- Áp dụng: mô hình trạng thái, khả năng mua, hợp đồng `next` an toàn và một nguồn trạng thái phiên ở React. Không sao chép mã.

## CodeBook

- Nguồn: <https://github.com/arnobt78/Ecommerce-Online-Shop-Platform-1--React-AWS-Lambda-FullStack>
- Commit đã khảo sát: `24dee6595590663910e6818f3850297cabcee303`
- Giấy phép: MIT.
- Nội dung học được: lớp gọi API báo lỗi theo trạng thái HTTP; đọc/ghi giỏ hàng trong `localStorage` có xử lý trường hợp trình duyệt chặn lưu trữ; route bảo vệ phải chờ kiểm tra người dùng thay vì chỉ tin dữ liệu phía client.
- Áp dụng: nguyên tắc lỗi rõ ràng, giỏ hàng cục bộ có phiên bản dữ liệu và trạng thái chờ khi kiểm tra quyền. Không sao chép mã; dự án không dùng cách lưu token xác thực trong `sessionStorage` của nguồn tham khảo.

## Quyết định thiết kế của dự án

Giao diện hiện tại dùng bố cục danh mục mang tính biên tập, tông giấy ấm và kiểu chữ có nét thủ công. Ảnh chưa có được thể hiện bằng vùng giữ chỗ có nhãn rõ ràng, không dùng ảnh giả làm nội dung thật. Tên dự án vẫn là tên tạm thời hiện có; việc đổi nhận diện sẽ thực hiện sau.
