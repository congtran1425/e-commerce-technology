# ZaloPay Sandbox

Tài liệu này mô tả cách tích hợp đang được dùng trong dự án. Mã nguồn `server.js` ở thư mục gốc và repository `LeCheWang/demo-payment` chỉ được khảo sát để hiểu ví dụ; chúng không có giấy phép tái sử dụng rõ ràng nên không được sao chép vào sản phẩm. Bản triển khai hiện tại được viết lại theo tài liệu chính thức của ZaloPay.

## Luồng hoạt động

1. Khách đăng nhập, nhập địa chỉ và bấm thanh toán.
2. Frontend gửi `idempotencyKey`, địa chỉ và danh sách `variantId`/số lượng tới `POST /api/orders`.
3. Backend lấy lại giá từ PostgreSQL, kiểm tra và giữ tồn kho trong một giao dịch, rồi tạo đơn `AWAITING_PAYMENT` cùng payment `PENDING`.
4. Backend tạo `app_trans_id`, ký chuỗi dữ liệu bằng HMAC-SHA256 với `KEY1` và gọi API tạo đơn của ZaloPay.
5. Frontend được chuyển tới `order_url` do ZaloPay trả về.
6. ZaloPay gọi `POST /api/payments/zalopay/callback`. Backend xác minh HMAC của trường `data` bằng `KEY2`, kiểm tra `app_id`, mã giao dịch và số tiền rồi mới xác nhận.
7. Khi khách quay lại `/thanh-toan/ket-qua?order=...`, frontend chỉ hiển thị trạng thái do backend trả về. Nếu còn chờ, frontend yêu cầu backend gọi API đối chiếu ZaloPay.
8. Tác vụ chạy nền đối chiếu các giao dịch đã quá hạn và chưa có kết luận để tránh giữ hàng vô thời hạn khi callback bị lỡ.

## Biến môi trường

Các biến sau chỉ được đặt trong `apps/api/.env` ở máy cục bộ hoặc `deploy/oracle/.env` trên máy chủ:

```dotenv
ZALOPAY_APP_ID=
ZALOPAY_KEY1=
ZALOPAY_KEY2=
ZALOPAY_CALLBACK_URL=https://api.example.com/api/payments/zalopay/callback
ZALOPAY_REDIRECT_URL=https://example.com/thanh-toan/ket-qua
ZALOPAY_CREATE_URL=https://sb-openapi.zalopay.vn/v2/create
ZALOPAY_QUERY_URL=https://sb-openapi.zalopay.vn/v2/query
ZALOPAY_EXPIRE_SECONDS=900
```

`ZALOPAY_CALLBACK_URL` và `ZALOPAY_REDIRECT_URL` phục vụ hai đối tượng khác nhau nên không được nhập cùng một URL gốc:

- `ZALOPAY_CALLBACK_URL` là endpoint backend công khai để máy chủ ZaloPay gửi kết quả; khi thử cục bộ bằng ngrok, URL phải kết thúc bằng `/api/payments/zalopay/callback`.
- `ZALOPAY_REDIRECT_URL` là trang frontend mà trình duyệt khách quay về. Khi thử cục bộ bằng một tunnel ngrok trỏ tới Vite, callback và redirect có thể dùng chung miền ngrok nhưng bắt buộc khác đường dẫn: callback kết thúc bằng `/api/payments/zalopay/callback`, redirect kết thúc bằng `/thanh-toan/ket-qua`.
- Giá trị redirect được gắn vào giao dịch lúc tạo đơn. Đổi `.env` không sửa được giao dịch đã tạo trước đó; phải khởi động lại API và tạo một giao dịch thử mới.

Không thêm tiền tố `VITE_` cho các khóa. Không ghi khóa vào mã, ảnh chụp màn hình, log, tài liệu hay Git. Khi xoay khóa, cập nhật biến môi trường rồi khởi động lại API.

## Quy tắc bảo mật và tính đúng

- Backend không nhận đơn giá, thành tiền hoặc trạng thái thanh toán từ frontend.
- `app_trans_id` bắt đầu bằng ngày Việt Nam dạng `yymmdd`; chữ ký tạo đơn dùng đúng thứ tự trường do ZaloPay quy định.
- Callback là endpoint công khai nhưng không được tin cậy trước khi xác minh HMAC bằng phép so sánh an toàn thời gian.
- Chỉ đơn đúng `app_id`, đúng mã giao dịch và đúng số tiền mới chuyển sang `CONFIRMED`.
- Callback hoặc thao tác đối chiếu có thể lặp; câu lệnh cập nhật có điều kiện bảo đảm chỉ xác nhận hoặc hoàn kho một lần.
- Không log `KEY1`, `KEY2`, toàn bộ callback, cookie phiên hoặc dữ liệu cá nhân của người nhận.
- Trình duyệt chuyển hướng về trang kết quả không mang quyền xác nhận thanh toán.

## Kiểm thử Sandbox

Trước khi thử cần có API HTTPS công khai và một tài khoản ZaloPay Sandbox hợp lệ.

1. Chạy migration và seed.
2. Điền đủ biến `ZALOPAY_*`, khởi động lại API.
3. Đăng nhập web, thêm mặt hàng còn tồn kho và tạo đơn.
4. Hoàn tất một giao dịch Sandbox, kiểm tra đơn thành `CONFIRMED`, payment thành `SUCCEEDED` và giỏ được xóa ở trang kết quả.
5. Hủy hoặc để hết hạn một giao dịch, kiểm tra đơn thành `CANCELLED`, payment thành `FAILED`/`EXPIRED` và tồn kho được hoàn đúng một lần.
6. Gửi lại cùng callback, kiểm tra trạng thái và tồn kho không thay đổi lần thứ hai.
7. Thử callback sai MAC hoặc sai số tiền; sai MAC phải bị từ chối, sai số tiền phải chuyển đơn sang `PAYMENT_REVIEW`.

## Giới hạn hiện tại

- Chưa tích hợp hoàn tiền qua API; trạng thái hoàn tiền đã được chừa trong lược đồ cho bước sau.
- Chưa có giao diện quản trị xử lý `PAYMENT_REVIEW`.
- Phí vận chuyển đang bằng 0 trong lát cắt đầu tiên.
- Mỗi thao tác tạo đơn hiện tạo một lần thanh toán; luồng thử lại trên cùng đơn sẽ được thiết kế sau.

## Tài liệu chính thức

- Tạo đơn: <https://docs.zalopay.vn/vi/docs/specs/order-create/>
- Callback: <https://docs.zalopay.vn/vi/docs/developer-tools/knowledge-base/callback/>
- Đối chiếu trạng thái: <https://docs.zalopay.vn/vi/docs/specs/order-query/>
- Luồng cổng thanh toán: <https://docs.zalopay.vn/vi/docs/guides/payment-acceptance/payment-gateway/intro/>
