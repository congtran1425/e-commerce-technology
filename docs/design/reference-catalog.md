# Danh mục mã nguồn giao diện tham khảo

Ngày cập nhật gần nhất: 13/09/2026.

## Nguyên tắc sử dụng

- Chỉ học cách tổ chức luồng và trạng thái giao diện; không chép nguyên bộ giao diện.
- Chỉ sử dụng mã có giấy phép rõ ràng như MIT, Apache-2.0 hoặc BSD.
- Nếu sau này sao chép hoặc sửa trực tiếp một đoạn mã, phải ghi nguồn vào `THIRD_PARTY_NOTICES.md`.
- Các repository khảo sát nằm trong `.references/`, chỉ phục vụ nghiên cứu cục bộ và không được commit.

## Spree Storefront

- Nguồn: <https://github.com/spree/storefront>
- Commit đã khảo sát: `9939d781bbbae239cce66daad5ba711585a38e07`
- Giấy phép: MIT.
- Nội dung học được: trạng thái biến thể còn hàng/hết hàng; nút thêm giỏ phụ thuộc khả năng mua; số lượng giỏ trên header; toàn vùng thẻ sản phẩm có thể mở trang chi tiết; giữ đường dẫn đích khi chuyển khách sang đăng nhập và lấy lại phiên khi ứng dụng khởi động.
- Áp dụng: mô hình trạng thái, khả năng mua, hợp đồng `next` an toàn, một nguồn trạng thái phiên ở React và nguyên tắc danh mục có thanh tìm/lọc tách khỏi trang chủ. Không sao chép mã.

## CodeBook

- Nguồn: <https://github.com/arnobt78/Ecommerce-Online-Shop-Platform-1--React-AWS-Lambda-FullStack>
- Commit đã khảo sát: `24dee6595590663910e6818f3850297cabcee303`
- Giấy phép: MIT.
- Nội dung học được: lớp gọi API báo lỗi theo trạng thái HTTP; đọc/ghi giỏ hàng trong `localStorage` có xử lý trường hợp trình duyệt chặn lưu trữ; route bảo vệ phải chờ kiểm tra người dùng thay vì chỉ tin dữ liệu phía client.
- Áp dụng: nguyên tắc lỗi rõ ràng, giỏ hàng cục bộ có phiên bản dữ liệu và trạng thái chờ khi kiểm tra quyền. Không sao chép mã; dự án không dùng cách lưu token xác thực trong `sessionStorage` của nguồn tham khảo.

## Saleor Dashboard

- Nguồn: <https://github.com/saleor/saleor-dashboard>
- Commit đã khảo sát: `66d28330ed0ad22a4c307049e69ed9c49ffc85cf`.
- Giấy phép: BSD-3-Clause.
- Nội dung học được: quản trị danh mục bắt đầu từ danh sách có tìm kiếm và phân trang; sản phẩm và biến thể là hai cấp riêng; tồn kho cần phản hồi rõ trạng thái đang tải, lỗi và không có dữ liệu.
- Áp dụng: cấu trúc danh sách–chi tiết và cách chia tác vụ sản phẩm, biến thể, tồn kho. Không sao chép mã, thành phần, hình ảnh hay nhận diện.

## shadcn-admin

- Nguồn: <https://github.com/satnaing/shadcn-admin>
- Commit đã khảo sát: `e16c87f213a5ba5e45964e9b67c792105ec74d26`.
- Giấy phép: MIT.
- Nội dung học được: tổ chức mã giao diện quản trị theo tính năng; khu điều hướng thích nghi theo màn hình; mỗi trang chủ động xử lý trạng thái tải, lỗi, rỗng và không có quyền.
- Áp dụng: nguyên tắc tổ chức và kiểm tra trạng thái. Dự án giữ hệ thống kiểu chữ, màu giấy ấm và bố cục riêng; không sao chép mã hay giao diện.

## Medusa Admin

- Nguồn: <https://github.com/medusajs/medusa>
- Commit đã khảo sát: `f8dce55556a1e68d6ea9b2fb88852b2a76fbd73c`.
- Giấy phép: repository hiện dùng nhiều loại giấy phép; phần lõi chủ yếu MIT nhưng một số tính năng doanh nghiệp có giấy phép riêng.
- Giới hạn sử dụng: chỉ khảo sát cấu trúc các route quản trị không thuộc khu vực doanh nghiệp; không sao chép mã, thành phần hay tài nguyên. Nếu muốn tái sử dụng trực tiếp trong tương lai phải kiểm tra giấy phép ở đúng đường dẫn và commit một lần nữa.
- Nội dung học được: trang quản trị ưu tiên đưa người vận hành tới đơn hàng; chi tiết đơn tách thông tin chung, dòng hàng, thanh toán, hoàn tất giao hàng và lịch sử hoạt động; tồn kho, khuyến mãi, thuế và vận chuyển là các miền nghiệp vụ riêng.
- Áp dụng: chia điều hướng thành điều hành, hàng hóa và phân tích; tách màn hình đơn hàng, vận chuyển, giao dịch, kho và báo cáo. Không sao chép mã.

## Nguồn đã đánh giá nhưng loại khỏi phạm vi tái sử dụng

- Vendure tại <https://github.com/vendurehq/vendure>, commit `a9559073e223794f984cc00fed94d04dd50a47cc`, dùng GPL-3.0 hoặc giấy phép thương mại ở thời điểm khảo sát. Các giấy phép này không nằm trong danh sách được phép tái sử dụng của dự án, vì vậy không sao chép mã hay tài nguyên từ nguồn này.

## Medusa Next.js Starter

- Nguồn: <https://github.com/medusajs/nextjs-starter-medusa>
- Commit đã khảo sát: `9818886f06e493cb2249733d114d339aa216ef00`.
- Giấy phép: MIT tại đúng commit đã khảo sát.
- Tình trạng: repository đã được lưu trữ và hướng dẫn chuyển sang starter mới; chỉ phù hợp để khảo sát cấu trúc thông tin, không dùng như nền tảng đang được bảo trì.
- Nội dung học được: tài khoản khách nên tách tổng quan, hồ sơ, địa chỉ và đơn hàng; tổng quan ưu tiên đơn gần đây cùng thông tin còn thiếu; chi tiết đơn giữ dữ liệu của chính giao dịch.
- Áp dụng: cấu trúc thông tin và phạm vi chức năng. Không sao chép mã, thành phần, ảnh hay hệ thống thiết kế.

## Saleor Storefront cũ

- Nguồn: <https://github.com/saleor/saleor-storefront>
- Commit đã khảo sát: `52ea1dd236433466b7506c286c2f82488d35d883`.
- Giấy phép: BSD-3-Clause tại đúng commit đã khảo sát.
- Tình trạng: storefront này đã ngừng phát triển; dự án chỉ khảo sát mô hình sổ địa chỉ và chi tiết đơn, không xem đây là lựa chọn công nghệ hiện hành.
- Nội dung học được: địa chỉ mặc định cần phân biệt với danh sách nơi nhận; thông tin đơn cũ không phụ thuộc vào việc khách sửa sổ địa chỉ sau đó.
- Áp dụng: quy tắc sổ địa chỉ và trạng thái rỗng. Không sao chép mã hoặc tài nguyên.

## Spree Starter

- Nguồn: <https://github.com/spree/spree-starter>
- Commit đã khảo sát: `a2996612ea48adc9747db41f735070b3b7b37372`.
- Giấy phép: MIT tại đúng commit đã khảo sát.
- Nội dung học được: khu vực tài khoản là một miền riêng khỏi danh mục và thanh toán; route cùng dữ liệu tài khoản phải nằm sau lớp xác thực.
- Áp dụng: kiểm tra lại ranh giới route và quyền truy cập. Không sao chép mã, thành phần hay nhận diện.

## Quyết định thiết kế của dự án

Giao diện hiện tại dùng bố cục danh mục mang tính biên tập, tông giấy ấm và kiểu chữ có nét thủ công. Ảnh chưa có được thể hiện bằng vùng giữ chỗ có nhãn rõ ràng, không dùng ảnh giả làm nội dung thật. Tên dự án vẫn là tên tạm thời hiện có; việc đổi nhận diện sẽ thực hiện sau.

Trang quản trị dùng bố cục “chỉ mục trước”: danh sách tác vụ hoặc sản phẩm là điểm vào, phần chỉnh sửa mở bên cạnh trên màn hình rộng và xếp dọc trên màn hình hẹp. Trên máy tính dùng thanh điều hướng bên trái; trên điện thoại dùng danh sách điều hướng thu gọn. Đây là cách tổ chức được chọn lọc từ khảo sát, không phải bản sao hình ảnh của bất kỳ nguồn nào.

Các trang vận hành dùng cấu trúc “bàn điều hành”: tổng quan chỉ hiển thị số liệu thật; đơn hàng và giao dịch dùng danh sách–chi tiết; vận chuyển là một hàng đợi công việc; kho tách cảnh báo tồn khỏi sổ biến động. Doanh thu luôn được ghi rõ là tiền đã thu, không đồng nhất với lợi nhuận.

Khu vực khách hàng dùng cấu trúc “mục lục trước”: mục tài khoản nằm thành dải ngang trên điện thoại và thành cột trái trên màn hình rộng; nội dung thật nằm ở vùng đọc bên phải. Hình thức vẫn là cuốn sổ biên tập ấm áp của `Một Mẻ Bánh`, không bê bảng điều khiển quản trị hay lưới thẻ thống kê sang phía khách hàng.
