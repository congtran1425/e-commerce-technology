# Kế hoạch tích hợp vận chuyển GHTK

Trạng thái: Đề xuất, chưa phải quyết định sản phẩm đã chốt  
Cập nhật: 2026-09-14  
Phạm vi: chuẩn bị toàn bộ phần độc lập với GHTK; chỉ nối bộ chuyển đổi thật sau khi GHTK xác nhận quyền thử nghiệm và hợp đồng API.

## 1. Kết luận ngắn

Có thể chuẩn bị trước gần như toàn bộ chức năng vận chuyển mà không cần token GHTK. Hệ thống nên giao tiếp với một **cổng vận chuyển nội bộ** thay vì gọi GHTK trực tiếp từ các màn hình hoặc từ nghiệp vụ đơn hàng. Trong lúc chờ phản hồi, cổng này dùng nhà cung cấp mô phỏng cục bộ. Khi có thông tin chính thức, chỉ thay nhà cung cấp mô phỏng bằng bộ chuyển đổi GHTK và chạy lại bộ kiểm thử hợp đồng.

Không nên thêm ngay các URL và cấu trúc phản hồi đang thấy trên tài liệu vào nhiều nơi trong mã nguồn. Tài liệu công khai hiện có một số điểm chưa thống nhất, ví dụ trang hủy đơn ghi endpoint là `POST` nhưng ví dụ lại dùng `GET`; phần webhook minh họa cả dữ liệu dạng biểu mẫu lẫn đối tượng JSON. Những điểm này phải được xác nhận hoặc được cô lập trong một bộ chuyển đổi duy nhất.

## 2. Những gì đã xác minh từ tài liệu chính thức

Tại thời điểm 2026-09-14, tài liệu OpenAPI của GHTK công bố:

- Môi trường thử nghiệm: `https://services-staging.ghtklab.com`; môi trường thật: `https://services.giaohangtietkiem.vn`.
- Xác thực bằng header `Token`; tài liệu cũng mô tả header `X-Client-Source` chứa mã đối tác.
- API kiểm tra xác thực, tính phí, đăng đơn, tra cứu trạng thái, hủy đơn, in nhãn và lấy danh sách địa chỉ lấy hàng.
- API tính phí cần địa chỉ lấy/giao và khối lượng theo gram; phản hồi có phí cơ bản, phí khai giá, phụ phí và cờ cho biết địa chỉ có được hỗ trợ giao hay không.
- API đăng đơn dùng khối lượng từng sản phẩm theo kilogram, nhận mã đơn của đối tác và trả mã vận đơn GHTK.
- Một mã đơn đối tác đã đăng thành công không được đăng lại; khi trùng, GHTK có thể trả lại mã vận đơn và trạng thái đã có. Đây là cơ sở để xử lý yêu cầu lặp an toàn.
- Webhook gửi mã đơn đối tác, mã vận đơn, trạng thái, thời điểm, lý do, khối lượng và phí. GHTK xem HTTP `200` là tiếp nhận thành công và tài liệu nói sẽ thử lại một lần nếu không nhận được `200`.

Nguồn chính thức:

- [Môi trường, tham số và xác thực](https://api.ghtk.vn/docs/submit-order/logistic-overview/)
- [API tính phí](https://api.ghtk.vn/docs/submit-order/calculate-shipping-fee/)
- [API đăng đơn](https://api.ghtk.vn/docs/submit-order/submit-order-express/)
- [API trạng thái đơn hàng](https://api.ghtk.vn/docs/submit-order/tracking-status/)
- [API hủy đơn](https://api.ghtk.vn/docs/submit-order/api-cancel-order/)
- [Webhook](https://api.ghtk.vn/docs/submit-order/webhook/)
- [API danh sách kho lấy hàng](https://api.ghtk.vn/docs/submit-order/api-get-pick-addresses/)

Sự tồn tại của URL staging không đồng nghĩa mọi tài khoản đều được cấp token hoặc quyền tạo dữ liệu thử nghiệm. Việc này vẫn chờ GHTK trả lời.

## 3. Khoảng trống hiện tại của dự án

### 3.1. Chưa có dữ liệu khối lượng giao hàng

`ProductVariant` mới có định lượng bán (`packageQuantity`) và đơn vị công thức. Không thể dùng các trường này làm khối lượng kiện hàng:

- 500 g bột không có nghĩa kiện hàng chỉ nặng 500 g vì còn bao bì;
- sản phẩm tính theo ml hoặc theo cái không thể tự đổi chính xác sang gram;
- dụng cụ chưa có khối lượng và kích thước;
- đơn có hàng dễ vỡ hoặc thực phẩm cần quy tắc đóng gói riêng.

Trước khi tính phí thật, mỗi quy cách bán cần có ít nhất `shippingWeightGrams`. Kích thước dài, rộng, cao và nhóm xử lý hàng hóa có thể để tùy chọn ở lát cắt đầu nhưng nên có chỗ mở rộng.

### 3.2. Phí vận chuyển đang cố định bằng 0

Checkout hiện tạo đơn với `shippingFee = 0`. Phí thật phải được báo trước khi tạo giao dịch ZaloPay, vì tổng tiền ZaloPay phải bằng tổng tiền đơn hàng sau khi cộng phí vận chuyển. Không được tạo vận đơn xong mới cộng phí.

### 3.3. Trạng thái đơn hàng đang gộp với trạng thái vận chuyển

`OrderStatus` chỉ có các mốc tổng quát như `PREPARING`, `SHIPPING`, `DELIVERED`. GHTK có nhiều trạng thái như chờ lấy, hoãn lấy, không lấy được, đang giao, không giao được, đang trả và đã trả. Không nên nhét toàn bộ chúng vào `OrderStatus` hoặc cho webhook tùy ý ghi đè đơn hàng.

Cần một thực thể `Shipment` (lần giao hàng) có trạng thái riêng và `ShipmentEvent` (sự kiện vận chuyển) để lưu lịch sử. `OrderStatus` chỉ thay đổi ở các mốc nghiệp vụ được cho phép.

### 3.4. Chưa có điểm lấy hàng và quy tắc hàng tươi

GHTK cần thông tin nơi lấy hàng. Dự án chưa chốt địa chỉ gửi, số điện thoại, thời gian lấy hoặc mã kho GHTK. Đồng thời, tài liệu công khai có phụ phí thực phẩm khô và hàng dễ vỡ nhưng chưa đủ để kết luận họ nhận nguyên liệu tươi, hàng lạnh hoặc bảo đảm chuỗi lạnh. Không được quảng bá khả năng giao nhóm hàng này trước khi có xác nhận bằng văn bản.

## 4. Phạm vi chức năng đầu tiên được đề xuất

### Bao gồm

- Một điểm lấy hàng của Bếp Đủ Bánh.
- Một kiện hàng cho mỗi lần giao; mô hình dữ liệu cho phép thêm lần giao lại sau này.
- Đơn được thanh toán trước bằng ZaloPay; GHTK không thu tiền hàng (`pick_money = 0`).
- Khách trả phí vận chuyển trong tổng tiền website; với GHTK, shop là bên trả phí giao (`is_freeship = 1`) để tránh thu trùng.
- Báo phí tại checkout, kiểm tra vùng phục vụ và khóa báo giá trong một khoảng thời gian ngắn.
- Quản trị viên chủ động bấm tạo vận đơn khi hàng đã sẵn sàng; không tự đẩy đơn sang GHTK ngay khi ZaloPay báo thành công.
- Đồng bộ trạng thái bằng webhook, có nút tra cứu lại thủ công và tác vụ đối soát định kỳ làm đường lui.
- Hủy vận đơn nếu đơn còn ở giai đoạn GHTK cho phép; lưu kết quả và lý do.
- Khách xem hãng vận chuyển, mã vận đơn, trạng thái gần nhất và lịch sử chính.

### Chưa bao gồm

- Thu hộ tiền mặt (COD) của GHTK.
- Tự chọn giữa nhiều hãng vận chuyển.
- Chia một đơn thành nhiều kiện hoặc nhiều hãng trong giao diện.
- Tối ưu tuyến đường, điều phối tài xế hoặc đối soát công nợ kế toán đầy đủ.
- Cam kết giao lạnh, giao đông lạnh hay giao nguyên liệu tươi khi GHTK chưa xác nhận.
- Tự động hoàn tiền ZaloPay chỉ vì vận đơn bị hủy hoặc giao thất bại. Vận chuyển và hoàn tiền là hai quy trình riêng cần người quản trị xác nhận.

## 5. Kiến trúc dự kiến

```text
Checkout / Trang quản trị / Trang tài khoản
                  |
                  v
          ShippingService nội bộ
                  |
                  v
          ShippingProvider (hợp đồng chung)
             /                 \
            v                   v
 MockShippingProvider       GhtkShippingProvider
 dùng khi phát triển         chỉ chứa chi tiết GHTK
```

`ShippingService` giữ quy tắc nghiệp vụ của Bếp Đủ Bánh. `GhtkShippingProvider` chỉ chuyển đổi dữ liệu nội bộ sang request GHTK và chuyển response GHTK về kiểu dữ liệu nội bộ. Token, tên header, endpoint, mã trạng thái và lỗi của GHTK không được rò sang controller, repository hoặc frontend.

Hợp đồng nội bộ tối thiểu:

```ts
interface ShippingProvider {
  checkConnection(): Promise<ConnectionResult>;
  quote(input: QuoteInput): Promise<QuoteResult>;
  createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult>;
  getShipment(trackingCode: string): Promise<ProviderShipment>;
  cancelShipment(trackingCode: string): Promise<CancelShipmentResult>;
}
```

Mỗi thao tác gửi ra ngoài cần timeout, phân loại lỗi có thể thử lại/không thể thử lại, ghi `log_id` của GHTK để hỗ trợ tra soát nhưng tuyệt đối không ghi token hay đầy đủ dữ liệu cá nhân vào log.

## 6. Mô hình dữ liệu dự kiến

Đây mới là thiết kế để triển khai ở bước sau, chưa phải migration đã chấp nhận.

### Bổ sung cho `ProductVariant`

- `shippingWeightGrams`: số nguyên dương, khối lượng cả bao bì của một đơn vị bán.
- `shippingLengthCm`, `shippingWidthCm`, `shippingHeightCm`: tùy chọn trong bản đầu.
- `shippingProfile`: `STANDARD`, `DRY_FOOD`, `FRAGILE`, `RESTRICTED`.
- `shippingEnabled`: cho phép khóa quy cách chưa đủ dữ liệu hoặc không được hãng nhận.

Không được cho sản phẩm vào báo giá thật nếu thiếu khối lượng hoặc đang bị giới hạn giao.

### `ShippingQuote`

- Mã UUID, người dùng, nhà cung cấp và gói dịch vụ.
- Tiền cước cơ bản, phí khai giá, phụ phí và tổng phí bằng VND.
- Dấu vân tay của giỏ hàng và địa chỉ giao; không lưu lặp địa chỉ thô nếu không cần.
- Thời điểm hết hạn, thời điểm dùng và mã tham chiếu/log của nhà cung cấp.

Khi tạo đơn, backend phải kiểm tra báo giá còn hạn, thuộc đúng khách, khớp giỏ hàng và địa chỉ. Frontend không được gửi một con số phí tùy ý.

### `Shipment`

- Đơn hàng, số thứ tự lần giao, nhà cung cấp, mã đơn đối tác và mã vận đơn.
- Trạng thái nội bộ, mã/trạng thái gốc của GHTK và lý do gần nhất.
- Khối lượng, phí dự kiến, phí GHTK trả về khi tạo đơn và phí mới nhất.
- Thời gian dự kiến lấy/giao, thời gian tạo/hủy/giao/hoàn trả.
- Ảnh chụp điểm lấy và địa chỉ giao cần thiết để đối chiếu; không đọc ngược địa chỉ tài khoản đã có thể bị sửa.

### `ShipmentEvent`

- `fingerprint` duy nhất được băm từ mã vận đơn, mã trạng thái, thời gian hành động và lý do để chống xử lý webhook lặp.
- Nguồn sự kiện: webhook, tra cứu thủ công, tác vụ định kỳ hoặc quản trị viên.
- Trạng thái gốc, trạng thái nội bộ sau ánh xạ, thời điểm sự kiện/tiếp nhận/xử lý.
- Lý do, mã lý do và lỗi xử lý nếu có.

Chỉ lưu những trường cần cho kiểm toán. Payload thô chứa dữ liệu cá nhân phải được lược bỏ hoặc có thời hạn lưu rõ ràng.

## 7. Luồng nghiệp vụ

### 7.1. Báo phí tại checkout

1. Khách chọn hoặc nhập địa chỉ.
2. Frontend gửi địa chỉ và danh sách quy cách/số lượng tới `POST /api/shipping/quotes`.
3. Backend đọc giá trị hàng, khối lượng và tính hợp lệ trực tiếp từ database.
4. Nhà cung cấp mô phỏng hoặc GHTK trả vùng phục vụ và các loại phí.
5. Backend lưu báo giá có hạn, trả `quoteId`, tổng phí và thời hạn.
6. Khi tạo đơn, frontend chỉ gửi `quoteId`; backend kiểm tra lại rồi ghi `shippingFee` vào ảnh chụp đơn.
7. Giao dịch ZaloPay được tạo bằng `subtotal + shippingFee`.

Nếu GHTK tạm lỗi, checkout phải hiển thị lỗi rõ ràng và cho thử lại; không âm thầm dùng phí 0. Có thể thêm bảng phí dự phòng sau này, nhưng đó là quyết định sản phẩm riêng.

### 7.2. Tạo vận đơn

1. Đơn đã thanh toán và được quản trị viên xác nhận.
2. Quản trị viên chuyển đơn sang chuẩn bị và bấm “Tạo vận đơn GHTK”.
3. Backend khóa ngắn bản ghi đơn/lần giao, kiểm tra chưa có vận đơn thành công và tạo `partner_id` ổn định từ mã đơn.
4. Backend gọi nhà cung cấp. Nếu timeout, không gửi lại mù quáng: tra cứu bằng `partner_id` trước vì GHTK không cho đăng trùng mã.
5. Lưu mã vận đơn, phí, thời gian dự kiến và sự kiện tạo vận đơn.
6. Đơn vẫn là `PREPARING`/chờ lấy; chỉ chuyển sang `SHIPPING` khi trạng thái đã lấy hàng hoặc đang giao được xác minh.

### 7.3. Webhook và đồng bộ trạng thái

1. Endpoint webhook nhận cả `application/x-www-form-urlencoded` và JSON trong giới hạn kích thước nhỏ.
2. Xác thực theo cơ chế GHTK chính thức. Nếu họ không có chữ ký, dùng bí mật ngẫu nhiên trong callback, giới hạn tốc độ và tra cứu lại trạng thái qua API GHTK trước khi thay đổi nghiệp vụ.
3. Tạo fingerprint và bỏ qua sự kiện đã xử lý.
4. Lưu sự kiện trước, ánh xạ trạng thái sau; sự kiện cũ đến muộn không được làm lùi trạng thái hiện tại.
5. Chỉ các mốc đã chốt mới cập nhật `OrderStatus`: đã lấy/đang giao → `SHIPPING`; đã giao → `DELIVERED`. Hoãn, thất bại và hoàn hàng nằm ở `ShipmentStatus` để quản trị viên xử lý.
6. Trả HTTP `200` nhanh sau khi tiếp nhận hợp lệ. Tác vụ tra cứu định kỳ sửa sai nếu webhook bị mất, vì tài liệu chỉ nói GHTK thử lại một lần.

Không coi các mã thông báo thao tác của shipper `123`, `127`, `128`, `45`, `49`, `410` là trạng thái đơn chính; chính tài liệu GHTK cảnh báo các mã này có thể thay đổi ngược nhau.

### 7.4. Hủy

1. Quy trình hủy đơn của Bếp Đủ Bánh kiểm tra trạng thái đơn, thanh toán và vận đơn.
2. Nếu đã có vận đơn, backend yêu cầu GHTK hủy trước và lưu kết quả.
3. Chỉ khi kết quả đủ chắc chắn mới chuyển trạng thái vận chuyển; hoàn tiền ZaloPay được tạo thành quy trình riêng.
4. Nếu GHTK từ chối vì hàng đã được lấy, đơn không được giả vờ “đã hủy”; chuyển vào hàng đợi xử lý ngoại lệ.

## 8. API nội bộ dự kiến

### Khách hàng

- `POST /api/shipping/quotes`: lấy báo giá có hạn.
- `GET /api/account/orders/:orderNumber/shipment`: xem vận đơn và lịch sử đã lọc.

### Quản trị viên

- `POST /api/admin/orders/:orderNumber/shipments`: tạo vận đơn.
- `POST /api/admin/orders/:orderNumber/shipments/:shipmentId/cancel`: yêu cầu hủy.
- `POST /api/admin/orders/:orderNumber/shipments/:shipmentId/sync`: tra cứu lại ngay.
- `GET /api/admin/shipments`: lọc hàng đợi chờ tạo, chờ lấy, đang giao, ngoại lệ và hoàn hàng.
- `GET /api/admin/shipments/:shipmentId/label`: tải nhãn qua backend; không lộ token GHTK.

### GHTK gọi vào

- `POST /api/integrations/ghtk/webhook`: chỉ dùng cho GHTK, không dùng cookie phiên và không chịu CORS. CORS không phải cơ chế bảo vệ webhook máy chủ–máy chủ.

Mọi API mới phải cập nhật đồng thời route, OpenAPI, kiểu frontend, kiểm thử và tài liệu theo quy tắc repository.

## 9. Biến môi trường dự kiến

Các giá trị thật chỉ nằm trong `apps/api/.env` hoặc kho bí mật khi triển khai; `.env.example` chỉ để trống:

```dotenv
SHIPPING_PROVIDER=mock
SHIPPING_QUOTE_TTL_MINUTES=15

# Chỉ bật sau khi GHTK cấp và xác nhận môi trường
# GHTK_ENVIRONMENT=staging
# GHTK_API_TOKEN=
# GHTK_PARTNER_CODE=
# GHTK_WEBHOOK_SECRET=
# GHTK_PICK_ADDRESS_ID=

# Dùng nếu môi trường thử nghiệm không cấp mã điểm lấy
# SHIPPING_PICKUP_NAME=
# SHIPPING_PICKUP_PHONE=
# SHIPPING_PICKUP_ADDRESS=
# SHIPPING_PICKUP_WARD=
# SHIPPING_PICKUP_DISTRICT=
# SHIPPING_PICKUP_PROVINCE=
```

Không tạo biến `VITE_GHTK_*`: trình duyệt không được biết token, mã bí mật hoặc gọi GHTK trực tiếp. Base URL GHTK nên được chọn từ danh sách cố định theo `GHTK_ENVIRONMENT`, tránh cho một biến URL tùy ý biến backend thành nơi gửi dữ liệu khách hàng tới máy chủ lạ.

## 10. Nhà cung cấp mô phỏng để phát triển trước

`MockShippingProvider` phải có dữ liệu xác định, không dùng số ngẫu nhiên:

- cùng địa chỉ + giỏ hàng luôn cho cùng một phí;
- có địa chỉ mẫu “không hỗ trợ”; quy cách thiếu cân nặng trả lỗi;
- tạo vận đơn trả mã `MOCK-...` ổn định;
- có endpoint chỉ bật trong môi trường phát triển/test để phát sự kiện `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `DELIVERY_FAILED`, `RETURNING`;
- mô phỏng timeout sau khi đã tạo đơn để kiểm tra phục hồi bằng `partner_id`;
- gửi webhook trùng, webhook cũ đến muộn và trạng thái không hợp lệ;
- tuyệt đối không bật endpoint điều khiển mô phỏng trong production.

Frontend và nghiệp vụ chỉ làm việc với hợp đồng nội bộ, nên sau này không cần sửa lại màn hình khi đổi từ `mock` sang `ghtk`.

## 11. Thứ tự triển khai

| Gói việc | Có thể làm ngay | Kết quả nghiệm thu | Phụ thuộc email GHTK |
| --- | --- | --- | --- |
| 0. Chốt nghiệp vụ | Viết ADR cho phạm vi một điểm lấy, trả trước, một kiện; chốt thời điểm tạo vận đơn và cách thu phí | Không còn quy tắc mâu thuẫn giữa checkout, ZaloPay và vận chuyển | Không |
| 1. Dữ liệu vật lý | Thêm khối lượng/nhóm giao cho quy cách; migration, seed, form quản trị và kiểm tra thiếu dữ liệu | Không sản phẩm nào được báo phí thật nếu thiếu cân nặng | Không |
| 2. Lõi độc lập nhà cung cấp | Tạo hợp đồng `ShippingProvider`, service, repository, kiểu lỗi và `MockShippingProvider` | Toàn bộ unit test chạy không cần Internet/token | Không |
| 3. Báo phí và checkout | Tạo `ShippingQuote`, API báo phí, chọn báo giá và cộng phí trước khi tạo ZaloPay | Tổng đơn, phí ship và số tiền ZaloPay khớp tuyệt đối | Không |
| 4. Vận đơn và giao diện | Tạo `Shipment`/`ShipmentEvent`, trang quản trị hàng đợi, nút tạo/hủy/đồng bộ, trang khách xem theo dõi | Chạy trọn luồng bằng mock trên desktop và mobile | Không |
| 5. Webhook và độ bền | Nhận sự kiện có chống lặp/chống lùi, log đã lọc, đồng bộ định kỳ và kiểm thử lỗi | Webhook lặp hoặc đến sai thứ tự không làm hỏng trạng thái | Chỉ cơ chế xác thực cần xác nhận |
| 6. Bộ chuyển đổi GHTK | Ánh xạ request/response, mã trạng thái, lỗi, nhãn; kiểm thử hợp đồng bằng fixture đã làm mờ | Thay `SHIPPING_PROVIDER=ghtk` là dùng staging | Có |
| 7. Chạy staging | Smoke test tính phí → tạo → tra cứu → webhook → hủy; đối chiếu dashboard GHTK | Có biên bản kết quả, mã `log_id`, không dùng dữ liệu thật ngoài mức cần thiết | Có |
| 8. Chuẩn bị production | Token quyền tối thiểu, luân chuyển secret, cảnh báo, sao lưu và hướng dẫn vận hành | Có checklist bật/tắt và quay lui về mock/tắt vận chuyển | Có |

Sau khi gói 1–5 hoàn thành, phần còn lại khi nhận email chủ yếu nằm trong `GhtkShippingProvider`, cấu hình môi trường và bộ ánh xạ trạng thái. Tuy vậy, nếu GHTK trả lời rằng staging có hợp đồng khác tài liệu công khai hoặc không cho mô phỏng trạng thái, vẫn phải điều chỉnh kiểm thử tích hợp; không thể hứa chỉ “dán token là xong”.

## 12. Danh sách kiểm thử bắt buộc

- Báo giá đúng với tổng khối lượng nhiều quy cách và số lượng lớn hơn một.
- Từ chối quy cách thiếu cân nặng, không được giao hoặc địa chỉ ngoài vùng phục vụ.
- Báo giá hết hạn, sai người dùng, đổi giỏ hoặc đổi địa chỉ không tạo được đơn.
- Phí lưu trong đơn và tiền gửi ZaloPay bằng nhau, đều là VND nguyên.
- Bấm tạo vận đơn hai lần không tạo hai đơn GHTK.
- Timeout sau khi GHTK đã tạo đơn được phục hồi bằng tra cứu `partner_id`.
- Webhook giả, thiếu trường, quá lớn, trùng và đến sai thứ tự không làm sai đơn.
- GHTK lỗi/timeout không làm tiến `OrderStatus`.
- Hủy bị GHTK từ chối không đánh dấu đơn là đã hủy.
- Token, địa chỉ đầy đủ, số điện thoại và webhook secret không xuất hiện trong log.
- Trang checkout, tài khoản và quản trị có trạng thái tải, lỗi, rỗng, thành công và không có quyền.
- Kiểm tra bàn phím, giảm chuyển động và các chiều rộng 320, 375, 414, 768 px.

## 13. Cần trích từ email phản hồi của GHTK

1. Tài khoản cá nhân/dự án thử nghiệm có được cấp staging không; cách tạo shop và token staging.
2. `X-Client-Source` có bắt buộc với shop thông thường không và lấy `PARTNER_CODE` ở đâu.
3. Quyền tối thiểu cần cấp cho token: kiểm tra kết nối, tính phí, tạo, tra cứu, hủy, in nhãn và danh sách điểm lấy.
4. Webhook staging được cấu hình ở đâu; có chữ ký, secret header hoặc dải IP chính thức để xác thực không.
5. GHTK gửi webhook theo JSON hay `application/x-www-form-urlencoded`; chính sách retry thực tế và timeout yêu cầu.
6. Endpoint hủy dùng `POST` hay `GET` ở phiên bản hiện hành.
7. `fee.fee` đã bao gồm `insurance_fee` và `extFees` hay phải cộng riêng; phí nào là số cuối cùng shop phải trả.
8. Cách kích hoạt trạng thái giả trong staging để thử webhook và vòng đời đơn.
9. Giới hạn tần suất, timeout khuyến nghị và mã lỗi nào được phép thử lại.
10. Quy tắc chuẩn hóa tỉnh/quận/phường hiện hành và có API mã địa giới hay chỉ nhận tên.
11. Chính sách nhận bột, sữa, bơ, cream cheese, trứng, chocolate, hàng dễ vỡ; có hỗ trợ giữ lạnh/chuỗi lạnh hay không.
12. Trạng thái nào còn được hủy, chi phí hủy/trả hàng và cách đối soát chênh lệch phí.
13. API nhãn trả PDF trực tiếp hay URL tạm; thời hạn và yêu cầu bảo vệ dữ liệu trên nhãn.

## 14. Các quyết định chủ dự án vẫn cần chốt

Các mục dưới đây chưa được coi là yêu cầu chính thức:

1. Phí khách trả bằng đúng phí GHTK, được làm tròn, có phụ thu đóng gói hay miễn phí từ một ngưỡng đơn hàng.
2. Địa chỉ lấy hàng thử nghiệm và sau này là địa chỉ thật nào; có chấp nhận lưu cấu hình này trong database để sửa từ trang quản trị hay chỉ cấu hình máy chủ.
3. Có đồng ý với đề xuất chỉ tạo vận đơn khi quản trị viên bấm “Hàng đã sẵn sàng”, thay vì tự tạo ngay sau thanh toán hay không.
4. Khi GHTK không phản hồi lúc checkout: chặn thanh toán và cho thử lại, hay dùng bảng phí dự phòng. Khuyến nghị ban đầu là chặn có thông báo rõ, vì phí 0 hoặc phí đoán có thể gây lỗ.
5. Nếu một giỏ chứa sản phẩm được giao và sản phẩm bị hạn chế (ví dụ cần giữ lạnh), chặn toàn bộ đơn hay cho khách bỏ sản phẩm đó. Khuyến nghị bản đầu là chỉ rõ sản phẩm gây lỗi và yêu cầu bỏ khỏi giỏ; chưa tự tách kiện.

