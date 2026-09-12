# Quản lý tồn kho bằng sổ biến động

Status: Accepted
Date: 2026-09-11

## Context

Tồn kho ảnh hưởng trực tiếp đến khả năng thêm hàng, tạo đơn và hoàn hàng. Nếu giao diện quản trị chỉ ghi đè một con số tuyệt đối thì không thể biết ai đã đổi, đổi vì lý do gì hoặc vì sao số dư không khớp với đơn hàng.

## Decision

`product_variants.stock_quantity` tiếp tục là số dư hiện tại. Mọi thay đổi phải đồng thời tạo một dòng bất biến trong `inventory_movements`, chứa lượng tăng hoặc giảm, số dư trước–sau, lý do và liên kết đến quản trị viên hoặc đơn hàng khi có.

Điều chỉnh thủ công dùng lượng chênh lệch và lý do. Tạo đơn ghi `ORDER_RESERVED`; hoàn phần giữ hàng ghi `ORDER_RELEASED`. Việc cập nhật số dư và ghi sổ nằm trong cùng giao dịch database. Không cung cấp API xóa dòng lịch sử hoặc ghi đè tồn kho trực tiếp.

## Consequences

- Có thể truy vết biến động và đối chiếu với người thao tác hoặc đơn hàng.
- Backend phải giữ giao dịch ngắn và ngăn số dư âm khi có yêu cầu đồng thời.
- Sổ này chưa quản lý lô hàng, giá vốn, nhiều kho hoặc quy trình duyệt kiểm kê; các nhu cầu đó cần quyết định mới.
- Dữ liệu lịch sử làm cho xóa cứng sản phẩm, biến thể, người dùng và đơn hàng không còn phù hợp; bản quản trị đầu tiên dùng trạng thái hoạt động/ngừng bán.
