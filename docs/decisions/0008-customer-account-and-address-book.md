# Tài khoản khách hàng và sổ địa chỉ

Status: Accepted
Date: 2026-09-13

## Context

Sau khi đăng nhập, khách cần một nơi để xem lại đơn, sửa thông tin liên hệ và điền nơi nhận nhanh hơn ở lần mua sau. Dữ liệu nơi nhận đã chụp trong đơn hàng không được thay đổi khi khách sửa hồ sơ hoặc sổ địa chỉ, vì đó là bằng chứng của giao dịch tại thời điểm đặt.

Màn hình này phục vụ khách mua hàng, không phải một bản thu nhỏ của trang quản trị. Nó phải đọc tốt trên điện thoại, dùng đúng dữ liệu thật và không hiển thị số liệu thành tích không có ý nghĩa với khách.

## Decision

- Tạo khu vực được bảo vệ `/tai-khoan` chỉ dành cho vai trò `CUSTOMER`, gồm tổng quan, lịch sử đơn, chi tiết đơn, sổ địa chỉ và hồ sơ.
- `users.phone` là số điện thoại liên hệ dùng lại được. Email chưa cho phép tự đổi vì chức năng đó cần một luồng xác minh địa chỉ mới riêng.
- Mỗi khách có nhiều dòng `customer_addresses`, nhưng chỉ tối đa một dòng mặc định. Địa chỉ đầu tiên tự trở thành mặc định; nếu xóa địa chỉ mặc định, địa chỉ được cập nhật gần nhất còn lại được chọn thay thế.
- Sổ địa chỉ chỉ dùng để điền trước biểu mẫu thanh toán. Khi tạo đơn, backend tiếp tục chụp tên, số điện thoại và địa chỉ vào `orders`; sửa hay xóa sổ địa chỉ không làm đổi đơn cũ.
- Lịch sử đơn dùng phân trang theo con trỏ dựa trên khóa chính giảm dần, không dùng phân trang theo số trang.
- Chức năng hủy đơn và hoàn tiền chưa được đưa vào lát cắt này. Nó chỉ được làm sau khi quy tắc duyệt, trạng thái hoàn tiền và hành vi với ZaloPay được chốt.

## Consequences

- Khách có thể quản lý thông tin thường dùng mà không cần nhập lại ở mỗi lần thanh toán.
- Database cần migration thêm số điện thoại, bảng địa chỉ, chỉ mục truy vấn lịch sử đơn và ràng buộc duy nhất có điều kiện cho địa chỉ mặc định.
- Backend vẫn là nơi kiểm tra quyền sở hữu địa chỉ và đơn; client không thể đọc hoặc sửa dữ liệu của tài khoản khác chỉ bằng cách thay mã trên URL.
- Việc đổi email, quản lý nhiều phiên đăng nhập, hủy đơn và hoàn tiền vẫn là công việc riêng, không được suy diễn từ khu vực tài khoản hiện tại.
