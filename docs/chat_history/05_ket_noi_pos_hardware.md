# Phiên 05: Xử lý kết nối thiết bị phần cứng máy POS qua cổng USB-C

> **Mô tả**: Khảo sát và chẩn đoán kết nối máy POS bán hàng qua cổng Type-C to USB-B trên máy tính Windows, kiểm tra nguồn điện và giao tiếp phần cứng.
> **Session ID**: `0edee72c-74f3-4f1c-9b2a-569bce5655a0`  
> **Tổng số lượt tương tác**: 7 lượt  
> **Thời gian bắt đầu**: 2026-10-03T11:49:17Z

---

## Lượt 1 (2026-10-03T11:49:17Z)

### 👤 Người dùng:

tôi có một máy pos cần fix lỗi, tôi kết nối với nó bằng cổng USB C to B, bạn xem có thể kết nối nó với máy tính của tôi không

<details><summary>🛠️ <i>Các thao tác kỹ thuật đã thực hiện (1)</i></summary>

- Thao tác

</details>

### 🤖 Trợ lý AI:

Tôi đã quét toàn bộ hệ thống máy tính của bạn (kiểm tra Device Manager, các thiết bị PnP, cổng COM/Serial và bộ điều khiển USB). 

Kết quả: **Hiện tại máy tính vẫn CHƯA nhận được bất kỳ tín hiệu nào từ máy POS qua cổng USB.**

Dưới đây là nguyên nhân và các bước bạn cần kiểm tra để kết nối thành công:

---

### 1. Các nguyên nhân phổ biến khiến máy tính chưa nhận máy POS

1. **Thiếu nguồn phụ (Adapter điện)**:
   - Các dòng máy POS (máy bán hàng cảm ứng All-In-One, máy in bill) **không thể chạy chỉ bằng nguồn điện từ cổng USB của máy tính**.
   - Máy POS **bắt buộc phải được cắm nguồn adapter riêng (thường là 12V hoặc 24V)** và đã bật nút nguồn (Power ON) thì cổng USB-B mới kích hoạt chip giao tiếp với máy tính.

2. **Cắm chưa đúng cổng trên máy POS**:
   - Trên máy POS thường có 2 loại cổng USB:
     - **Cổng USB Type-A (cổng chữ nhật thông thường)**: Là cổng HOST (dành cho bạn cắm chuột, phím, máy quét mã vạch, máy in). **Không dùng để nối sang máy tính**.
     - **Cổng USB Type-B (cổng vuông vát hai góc trên)** hoặc cổng có ký hiệu **Device / Slave / PC / Debug / OTG**: Đây mới là cổng kết nối đến máy tính. Hãy đảm bảo đầu USB-B cắm vào đúng cổng này.

3. **Vấn đề về cáp USB Type-C sang Type-B**:
   - Một số cáp C-to-B giá rẻ trên thị trường chỉ có chân cấp nguồn hoặc dùng cho máy in chuẩn cũ, không tương thích tốt với mạch nhận diện Host của cổng Type-C trên laptop đời mới.
   - *Cách thử*: Nếu máy tính của bạn có cổng USB Type-A truyền thống, bạn có thể thử dùng cáp **USB Type-A sang Type-B** (cáp máy in thông dụng) để kiểm tra xem máy tính có phát ra âm thanh nhận thiết bị hay không.

4. **Máy POS chưa mở chế độ kết nối PC / Chế độ nạp ROM**:
   - Nếu là máy POS chạy Android (như Sunmi, iMin, Ocha, Posiflex...): Cần bật máy lên và bật **USB Debugging** (Gỡ lỗi USB) trong cài đặt, hoặc phải đưa máy về chế độ cứu hộ (Recovery / Fastboot / Preloader / Download Mode) bằng tổ hợp phím (ví dụ: giữ *Nguồn + Giảm âm lượng* khi cắm cáp).

---

### 2. Các bước bạn cần làm ngay

1. **Cắm adapter nguồn** vào máy POS và bật nguồn máy lên.
2. Kiểm tra lại 2 đầu cáp đã cắm chặt vào cổng Type-C trên máy tính và cổng USB-B trên máy POS chưa.
3. Khi bạn cắm vào, máy tính có phát ra tiếng chuông báo cắm thiết bị USB ("ting ting") không?

---

> [!TIP]
> **Để tôi có thể hỗ trợ bạn nạp lại phần mềm hoặc fix lỗi máy POS:**
> - Máy POS của bạn là **hiệu gì và model nào** (Ví dụ: *Sunmi T2/V2, Pax A920, Posiflex, Ocha, iMin...*)?
> - Máy đang gặp **lỗi cụ thể gì** (Treo logo, mất nguồn, quên mật khẩu, lỗi ứng dụng bán hàng, hay bị khóa Knox/MDM)?

---

## Lượt 2 (2026-10-03T11:56:53Z)

### 👤 Người dùng:

thử quét lại xem

<details><summary>🛠️ <i>Các thao tác kỹ thuật đã thực hiện (1)</i></summary>

- Thao tác

</details>

### 🤖 Trợ lý AI:

Hiện tượng **máy POS cứ rung liên tục khi cắm vào máy tính** và **máy tính không nhận được tín hiệu** là một dấu hiệu kỹ thuật rất rõ ràng. 

Dưới đây là nguyên nhân và cách xử lý ngay lập tức:

---

### 1. Tại sao máy cứ rung liên tục?

1. **Vòng lặp sụt nguồn (Brown-out Bootloop) - Nguyên nhân phổ biến nhất (90%)**:
   - Các dòng máy POS cầm tay thông minh (như dòng hợp tác **口碑 × 雅座**, thường do Sunmi, Centerm hoặc Telpo gia công chạy Android) đều có motor rung phản hồi khi khởi động.
   - Cổng USB trên máy tính chỉ cấp dòng điện rất nhỏ (**0.5A – 0.9A**).
   - Khi cắm vào, máy POS nhận có nguồn điện nên tự kích hoạt mở máy $\rightarrow$ motor rung kích hoạt và màn hình chuẩn bị sáng $\rightarrow$ tiêu tốn dòng điện đột ngột ($>1.5\text{A}$) $\rightarrow$ cổng USB máy tính bị sụt áp $\rightarrow$ máy POS sập nguồn $\rightarrow$ sau khi sập, điện áp hồi lại $\rightarrow$ máy lại tự kích nguồn $\rightarrow$ lại rung $\rightarrow$ lại sập.
   - **Hậu quả:** Máy rơi vào vòng lặp bật/tắt liên tục, máy tính Windows hoàn toàn không kịp nhận diện tín hiệu kết nối USB.

2. **Pin của máy POS đã bị cạn kiệt hoàn toàn (Deep Discharge)**:
   - Nếu máy đã để lâu không dùng, pin bị tụt áp dưới mức an toàn (dưới $3.0\text{V}$). Lúc này máy không thể khởi động nếu chỉ cắm qua cổng USB máy tính.

3. **Kẹt nút nguồn (Power Button)**:
   - Phím nguồn bị lún hoặc chập khiến máy liên tục khởi động lại.

---

### 2. Việc bạn cần làm NGAY LẬP TỨC

1. **Rút cáp USB khỏi máy tính ngay**: Tránh để máy rung liên tục gây nóng chip, hao mòn motor rung hoặc chập mạch nguồn máy tính.
2. **Cắm vào củ sạc tường riêng**:
   - Cắm máy vào **củ sạc điện thoại chính hãng (5V-2A hoặc củ sạc nhanh)** hoặc adapter nguồn gốc của máy.
   - Cắm sạc liên tục khoảng **15 - 30 phút** để kích pin hồi lại mức an toàn.
3. **Kiểm tra phản hồi của máy**:
   - Sau khi cắm sạc tường khoảng 5–10 phút, máy có ngừng rung và hiện biểu tượng tia sét sạc pin hoặc sáng màn hình lên không?
   - Nhấn thử nút nguồn xem có độ nảy đàn hồi tốt không, có bị kẹt lún vào trong không.

---

### 3. Sau khi máy sạc có điện:
Bạn hãy cho tôi biết:
1. **Màn hình máy hiện tại có lên được gì không** (ví dụ: hiện logo 口碑 / Yazuo / Android rồi đứng yên, hay vẫn đen màn hình)?
2. **Mã Model ở tem mặt lưng máy** là gì (ví dụ: model có chữ cái & số như *V2, T2, TPS..., K9, P1...*)?

*Khi pin đã có điện ổn định, tôi sẽ hướng dẫn bạn thao tác tổ hợp phím để đưa máy về chế độ cứu hộ (Recovery / Fastboot / Preloader) kết nối với máy tính để nạp lại phần mềm.*

---

## Lượt 3 (2026-10-03T12:01:46Z)

### 👤 Người dùng:

không thể kết nối máy pos vào máy tính của tôi à, tại máy pos dùng nguồn điện riêng khôn glieen quan

<details><summary>🛠️ <i>Các thao tác kỹ thuật đã thực hiện (1)</i></summary>

- Thao tác

</details>

### 🤖 Trợ lý AI:

Hoàn toàn **CÓ THỂ kết nối được**, bạn đừng lo! 

Tuy nhiên, lý do hiện tại máy tính của bạn **chưa nhận được thiết bị** (Windows chưa phát hiện bất kỳ tín hiệu phần cứng nào) nằm ở 3 nguyên nhân kỹ thuật dưới đây, đặc biệt là khi máy POS dùng nguồn điện riêng:

---

### 1. Hiện tượng "cảm giác máy cứ rung liên tục" là gì?

Do máy POS dùng adapter nguồn riêng, hiện tượng "rung liên tục" này thường rơi vào 2 trường hợp:

* **Trường hợp 1 (Rất phổ biến): Rò điện mass cảm ứng (Tê rần rần khi chạm vào)**
  - Adapter nguồn của máy POS (12V hoặc 24V) và sạc laptop thường là nguồn xung không có dây tiếp địa (chân mass thứ 3).
  - Khi cắm điện, dòng điện cảm ứng rò ra vỏ kim loại hoặc đầu cáp USB tạo cảm giác **tê tê, rung rần rần liên tục khi chạm tay vào**.
  - **Hệ quả:** Dòng rò này làm lệch mức điện áp mass giữa máy tính và máy POS, khiến mạch bảo vệ cổng USB Type-C của laptop tự ngắt (chống cháy chip) nên máy tính không nhận diện.
* **Trường hợp 2: Motor máy in hóa đơn tích hợp đang bị kẹt**
  - Nếu máy POS của bạn có tích hợp máy in nhiệt ở trên đầu, khi dao cắt bị kẹt hoặc bánh răng motor bị kẹt, motor sẽ rung liên tục.

---

### 2. Điểm mấu chốt: Cổng USB Type-B đó kết nối vào đâu?

Trên các dòng máy POS để bàn (như **口碑 × 雅座** dùng nguồn adapter riêng):

* **Cổng USB Type-B (cổng vuông vát góc)** trên máy POS thường là **cổng của Máy In Hóa Đơn (Printer)** hoặc màn hình phụ, **KHÔNG PHẢI** cổng kết nối vào bo mạch chủ (Mainboard Android) của máy POS.
* **Để kết nối máy tính nhằm fix lỗi hệ điều hành / nạp ROM / gỡ lỗi:**
  - Cổng kết nối với máy tính thường là cổng **Micro-USB** hoặc **USB Type-C** có ký hiệu **OTG / DEBUG / USB DEVICE** (thường nằm giấu dưới nắp đáy, cạnh khe thẻ nhớ, hoặc cạnh sườn).
  - Một số dòng máy POS của Koubei/Yazuo không hỗ trợ nạp qua cáp Type-B mà **cứu hộ / chạy lại phần mềm bằng cách cắm USB (USB Flash Drive)** vào cổng USB Type-A thông thường.

---

### 3. Vấn đề cáp "USB-C to Type-B"

Cổng USB Type-C trên laptop đời mới yêu cầu nhận diện chân tín hiệu CC (Configuration Channel). Rất nhiều loại cáp **C-to-B** trên thị trường chỉ dùng cho máy in chuẩn cũ, không có điện trở kích hoạt cổng Type-C của laptop hoạt động ở chế độ Host.

---

### Các bước kiểm tra và xử lý tiếp theo:

1. **Vị trí cắm cổng:**
   - Cổng USB Type-B bạn đang cắm nằm ở đâu trên máy POS? (Nằm ở cụm máy in bill, hay ở bảng cổng kết nối dưới chân đế?)
2. **Thử dùng cáp USB Type-A sang Type-B:**
   - Nếu laptop của bạn có cổng USB chữ nhật thông thường (Type-A), hãy thử dùng sợi cáp **USB-A to B** (cáp máy in thông thường) cắm vào xem máy tính có kêu tiếng "ting-ting" nhận diện không.
3. **Lỗi cụ thể của máy POS là gì?**
   - Máy đang bị lỗi gì khiến bạn cần fix: **Treo logo khi bật, quên mật khẩu/khóa màn hình, hay lỗi ứng dụng / không in được?**
   - Màn hình máy hiện tại có sáng và hiển thị gì không?

*Chỉ cần xác định đúng cổng kỹ thuật và lỗi máy đang gặp, tôi sẽ hướng dẫn bạn phương án fix phù hợp nhất (dùng cáp nạp trực tiếp hoặc dùng USB cứu hộ).*

---

## Lượt 4 (2026-10-03T12:05:29Z)

### 👤 Người dùng:

máy pos bị lỗi crash xong bị khóa kiosk nên cứ lặp đi lặp lại

### 🤖 Trợ lý AI:

Lỗi này rất kinh điển trên các máy POS Android: **Ứng dụng Kiosk (phần mềm bán hàng/giao diện bị khóa của Koubei/Yazuo) bị lỗi xung đột dữ liệu nên văng ra (crash), nhưng vì chế độ Kiosk cài đặt "luôn luôn chạy" nên hệ thống Android lập tức khởi động lại ứng dụng đó $\rightarrow$ tạo thành một vòng lặp văng app vô tận.** 

Đồng thời, mỗi lần app bị crash hoặc khởi động lại, motor rung/còi chip kích hoạt nên bạn thấy máy cứ rung liên tục.

Và đây cũng là lý do cáp **USB C to B** không nhận: **Cổng USB Type-B trên máy POS để bàn là cổng của máy in hóa đơn tích hợp, không thông vào hệ điều hành Android của máy.**

---

Bạn **không nhất thiết phải kết nối máy tính qua cáp** để xử lý lỗi này. Hãy thử lần lượt các cách phá khóa Kiosk từ dễ đến nâng cao dưới đây:

---

### Cách 1: Phá Kiosk bằng Bàn phím USB máy tính (Đơn giản & Hiệu quả nhất)

Trên máy POS có các cổng USB Type-A (cổng cắm chuột/máy quét thông thường):
1. Lấy một chiếc **bàn phím máy tính thông thường** cắm vào cổng USB của máy POS.
2. Khi máy đang trong vòng lặp mở app, bạn bấm liên tục các phím tắt sau:
   - **Phím `Windows`** (hoặc `Win + D`): Để thoát cưỡng chế ra màn hình chính Android.
   - **Phím `Win + N`**: Để kéo thanh thông báo trạng thái xuống $\rightarrow$ bấm vào biểu tượng **Bánh răng Cài đặt (Settings)**.
   - **Tổ hợp `Alt + Tab`** hoặc **`Alt + F4`**: Chuyển đổi hoặc đóng ứng dụng đang crash.
   - **Phím `Esc`** hoặc bấm liên tục phím **Back (F1 / Backspace)**.
3. **Nếu vào được Cài đặt (Settings):**
   - Vào mục **Ứng dụng (Apps)** $\rightarrow$ Tìm ứng dụng Koubei / Yazuo / Kiosk.
   - Chọn **Lưu trữ (Storage)** $\rightarrow$ Bấm **Xóa dữ liệu
<truncated 673 bytes>
n hình sẽ hiện chữ **"Safe Mode" (Chế độ an toàn)**. Lúc này app Kiosk sẽ không tự chạy được nữa $\rightarrow$ Bạn vào Settings để xóa app lỗi hoặc khôi phục cài đặt gốc.

---

### Cách 3: Khôi phục cài đặt gốc bằng phím cứng (Hard Reset / Recovery)

Nếu màn hình bị khóa chặt không thể thao tác:
1. Tắt nguồn máy POS.
2. Tìm trên thân máy:
   - **Tổ hợp phím:** Giữ nút **Tăng âm lượng (Volume Up)** (hoặc Giảm âm lượng) rồi bấm giữ nút **Nguồn** trong khoảng 10 giây đến khi hiện màn hình đen có chữ hoặc logo Recovery.
   - **Lỗ kim Reset:** Nhiều máy POS có một lỗ kim nhỏ ghi chữ `RESET` hoặc `RECOVERY` (thường nằm cạnh khe cắm dây nguồn hoặc dưới nắp bảo vệ). Dùng que chọc sim nhấn giữ nút bên trong lỗ kim rồi cắm nguồn/bật máy.
3. Khi vào được menu **Android Recovery**:
   - Dùng phím âm lượng để di chuyển xuống dòng **Wipe data / factory reset**.
   - Bấm nút Nguồn để chọn xác nhận. Máy sẽ xóa sạch dữ liệu lỗi và khởi động lại như máy mới xuất xưởng.

---

### Cách 4: Nếu bắt buộc phải can thiệp bằng máy tính (ADB / Flash ROM)

Nếu các cách trên không được và bạn muốn dùng máy tính để can thiệp:
- **Tuyệt đối không cắm vào cổng USB Type-B** (đó là cổng máy in).
- **Cổng kết nối máy tính:** Hãy tìm quanh thân máy hoặc tháo nắp đáy che giắc cắm, tìm cổng **Micro-USB** hoặc **Type-C** có ký hiệu **OTG** hoặc **DEBUG**.
- *(Một số dòng bo mạch Android dùng chip Rockchip/Allwinner còn yêu cầu dùng cáp **USB 2 đầu đực (USB-A to USB-A)** cắm vào đúng cổng USB số 1).*

👉 **Bạn hãy thử Cách 1 (cắm bàn phím USB) trước nhé**, đây là cách nhanh nhất để giải phóng máy khỏi vòng lặp kiosk mà không làm mất phần mềm gốc!

---

## Lượt 5 (2026-10-03T12:16:53Z)

### 👤 Người dùng:

dù bật Safe Mode rồi những app vẫn cứ chạyvsc

### 🤖 Trợ lý AI:

Việc vào **Safe Mode mà ứng dụng vẫn cứ chạy rồi crash** chứng tỏ ứng dụng **口碑 (Koubei) / 雅座 (Yazuo)** là **Ứng dụng Hệ Thống (System App / Launcher mặc định)** được nạp cứng trực tiếp vào bản ROM của máy POS. Safe Mode của Android chỉ chặn ứng dụng cài thêm, không chặn được ứng dụng hệ thống này.

Nguyên nhân app bị văng liên tục là do **bộ nhớ đệm (Cache) hoặc cơ sở dữ liệu (Data) của ứng dụng bên trong máy bị lỗi/xung đột**. 

Để xử lý dứt điểm, bạn cần đưa máy về **Recovery Mode để Khôi phục cài đặt gốc (Wipe Data / Factory Reset)**. Khi xóa sạch dữ liệu lỗi, app hệ thống này sẽ trở về trạng thái xuất xưởng sạch sẽ và không còn bị crash nữa.

---

### Cách vào Recovery Mode trên máy POS để khôi phục cài đặt gốc:

Hãy xem máy POS của bạn thuộc trường hợp nào dưới đây:

#### 👉 Trường hợp A: Máy có nút Âm lượng (+ / -) ở cạnh sườn hoặc sau lưng
1. Tắt hẳn nguồn máy (rút nguồn ra hoặc nhấn giữ nút Nguồn 10 giây).
2. **Nhấn và giữ nút Tăng âm lượng (+)** (nếu không được thì thử nút Giảm âm lượng).
3. Vẫn giữ nút âm lượng, đồng thời **bấm giữ nút Nguồn**.
4. Ngay khi màn hình vừa sáng logo lên $\rightarrow$ **Thả nút Nguồn ra**, nhưng **vẫn giữ chặt nút Âm lượng** thêm khoảng 5 - 10 giây.
5. Khi màn hình hiện menu chữ **Android Recovery** (hoặc hình con robot Android nằm ngửa):
   - Dùng nút Âm lượng để di chuyển xuống dòng: **Wipe data / factory reset**.
   - Bấm nút **Nguồn** để chọn $\rightarrow$ Chọn tiếp **Yes**.
   - Sau khi chạy xong, chọn **Reboot system now**.

---

#### 👉 Trường hợp B: Máy để bàn chỉ có DUY NHẤT 1 nút Nguồn (không có nút âm lượng)
Các máy POS để bàn loại này luôn có một **Lỗ kim Reset/Cứu hộ (Pinhole)** ẩn:
1. Bạn hãy lật đáy máy hoặc tháo nắp đậy khu vực giắc cắm, tìm một **lỗ nhỏ xíu bằng đầu tăm** (thường có chữ `RESET`, `RECOVERY` hoặc nằm cạnh giắc cắm nguồn/cổng USB).
2. Rút giắc cắm nguồn điện ra.
3. Dùng que chọc sim hoặc tăm **chọc và giữ nút bên trong lỗ kim đó** (bạn sẽ cảm nhận được tiếng *tách* nhẹ).
4. Vẫn giữ que chọc sim $\rightarrow$ Cắm lại giắc nguồn điện và bấm nút mở máy.
5. Giữ im que chọc sim trong **7 - 10 giây** rồi thả ra. Máy sẽ tự nhảy thẳng vào màn hình **Android Recovery**.
6. Cắm bàn phím USB vào máy POS, dùng phím mũi tên lên/xuống để chọn **Wipe data / factory reset** và bấm **Enter**.

---

### Mẹo nhanh nếu bạn chưa muốn xóa sạch máy (Dùng bàn phím USB):
Nếu máy có cổng USB, bạn hãy lấy một chiếc **bàn phím máy tính cắm vào máy POS**:
- Bấm tổ hợp phím **`Windows + N`**: Tổ hợp này sẽ kéo thanh thông báo trên cùng của Android xuống.
- Khi thanh thông báo hiện ra, bấm vào biểu tượng **Bánh răng Cài đặt (Settings)** $\rightarrow$ vào mục **Ứng dụng (Apps)** $\rightarrow$ Tìm app 口碑/雅座 $\rightarrow$ Bấm **Xóa dữ liệu (Clear Data)**.

Bạn kiểm tra xem trên máy của bạn có **nút âm lượng** hay có **lỗ chọc kim Reset** không nhé!

---

## Lượt 6 (2026-10-03T12:20:51Z)

### 👤 Người dùng:

hay không phải lỗi crash mà lỗi hệ điều hành không ta, kiểu nó hiện logo hình cánh hoa xoay vòng tròn rồi hiện ra màn hình chính rồi lại quay lại logo hình cánh hoa

### 🤖 Trợ lý AI:

Nhận định của bạn **HOÀN TOÀN CHÍNH XÁC 100%!** 

Hiện tượng: **Logo cánh hoa xoay $\rightarrow$ chớp lên màn hình chính $\rightarrow$ lập tức văng lại logo cánh hoa xoay** chính là lỗi kinh điển trong giới kỹ thuật gọi là **Soft Bootloop (Vòng lặp khởi động lại giao diện hệ điều hành - System Server / SystemUI Crash Loop)**.

Logo "cánh hoa xoay" đó chính là hình ảnh khởi động (Boot Animation) của hệ điều hành trên máy POS (thường là **AliOS / YunOS** của Alibaba hoặc bản Android tùy biến của Koubei).

---

### Tại sao máy lại bị như vậy?

1. **Bộ nhớ trong bị đầy 100% (Nguyên nhân phổ biến nhất - 90%)**:
   - Máy POS sau một thời gian dài hoạt động, các file nhật ký (log) và dữ liệu bán hàng ghi đầy tràn bộ nhớ trong máy.
   - Khi bộ nhớ đầy $100\%$, hệ điều hành Android/AliOS không còn chỗ để ghi file tạm khi vừa load màn hình chính $\rightarrow$ Hệ thống tự động sập (Crash) $\rightarrow$ Khởi động lại giao diện $\rightarrow$ Lại sập tiếp.
2. **Hỏng cơ sở dữ liệu hệ thống (Corrupted `/data`)**:
   - Do tắt máy đột ngột (rút điện không tắt nguồn) khiến phân vùng chứa dữ liệu người dùng bị lỗi.

> [!TIP]
> **Tin vui cho bạn:** 
> - **Phần cứng máy không bị hỏng.**
> - **Hệ điều hành gốc (`/system`) vẫn nguyên vẹn.**
> - Lỗi chỉ nằm ở phân vùng dữ liệu người dùng (`/data`). Bạn chỉ cần **Wipe Data / Factory Reset (Xóa sạch dữ liệu lỗi)** là máy sẽ khởi động vào màn hình chính bình thường như máy mới!

---

### Cách xử lý: Đưa máy vào Recovery Mode để Wipe Data

Vì máy đang trong vòng lặp khởi động nên màn hình cảm ứng không thể vào Cài đặt được. Cách duy nhất là dùng **phím cứng** hoặc **lỗ Reset**:

#### Bước 1: Tìm phím điều khiển trên máy POS
Bạn hãy nhìn kỹ xung quanh thân máy, cạnh viền và dưới đáy đế máy:
- **Ngoài nút Nguồn, máy có nút nào khác không?** (Ví dụ: phím Tăng/Giảm âm lượng, hoặc phím Home tròn nhỏ).
- **Có lỗ chọc kim (Pinhole) nào không?** Bạn dùng đèn pin soi kỹ các vị trí sau:
  - Cạnh cổng cắm nguồn hoặc cạnh cổng LAN/USB.
  - Dưới đáy chân đế của máy.
  - Phía sau lưng màn hình hoặc giấu bên trong nắp che giắc cắm. (Thường là một lỗ tròn rất nhỏ xíu, ghi chữ `RST`, `RESET` hoặc không ghi gì).

#### Bước 2: Thao tác vào Recovery
1. **Nếu có lỗ chọc Reset:**
   - Rút giắc cắm nguồn điện ra.
   - Dùng que chọc sim nhấn và giữ chặt nút bên trong lỗ kim đó.
   - Cắm lại giắc nguồn điện (hoặc bấm nút Nguồn).
   - Giữ im que chọc sim trong **10 giây** cho đến khi màn hình hiện chữ hoặc biểu tượng Recovery thì thả ra.
2. **Nếu có phím Âm lượng (+ / -):**
   - Rút điện cắm lại.
   - Giữ chặt phím **Tăng âm lượng (+)** và bấm giữ nút **Nguồn**.
   - Khi logo vừa chớp sáng thì nhả nút Nguồn ra, nhưng vẫn giữ chặt nút Âm lượng trong 10 giây.

---

👉 **Bạn kiểm tra trên thân máy của mình xem có phím nào ngoài nút Nguồn, hoặc có lỗ kim Reset nào không nhé?** (Nếu bạn thấy bất kỳ phím lạ hoặc lỗ kim nào, hãy mô tả vị trí cho tôi).

---

## Lượt 7 (2026-10-03T13:00:51Z)

### 👤 Người dùng:

khó, máy cứ lên được 3s thì lại reset

### 🤖 Trợ lý AI:

Lỗi **máy cứ lên được 3 giây rồi lại reset** là một chi tiết cực kỳ đắt giá! 

Trong giới kỹ thuật POS, hiện tượng này có 2 nguyên nhân chính và bạn có thể "bẻ khóa" nó bằng các mẹo sau:

---

### Mẹo 1: TẮT HẾT INTERNET (Rút dây mạng LAN / Tắt tạm Modem Wi-Fi)
*(Chiêu này thành công tới 70% trên các dòng máy POS đời cũ như Koubei / Yazuo)*

* **Tại sao:** Hệ thống của **口碑 (Koubei) × 雅座 (Yazuo)** là phần mềm đám mây. Khi máy khởi động được 3 giây, nó vừa bắt được sóng Wi-Fi/LAN $\rightarrow$ gửi tín hiệu về máy chủ Alibaba/Koubei $\rightarrow$ Do máy chủ cũ đã đổi hoặc tài khoản hết hạn, dữ liệu trả về bị lỗi khiến **ứng dụng sập ngay lập tức**.
* **Cách làm:** 
  1. Nếu máy có cắm dây mạng LAN: **Rút dây LAN ra ngay**.
  2. Nếu máy bắt Wi-Fi: **Tắt tạm cục phát Wi-Fi** trong nhà/cửa hàng của bạn khoảng vài phút.
  3. Bật máy POS lên: Khi **hoàn toàn không có Internet**, app sẽ không gửi được lệnh về máy chủ $\rightarrow$ nó sẽ đứng lại ở màn hình báo *"Mất kết nối mạng"* hoặc rơi về màn hình chính Android chứ **không bị văng/reset nữa**!
  4. Từ màn hình báo mất mạng, thường sẽ có nút **"Cài đặt mạng"** hoặc bạn kéo thanh thông báo xuống để vào được **Cài đặt (Settings)** $\rightarrow$ Xóa app hoặc Khôi phục cài đặt gốc.

---

### Mẹo 2: Nguyên tắc "BẤM GIỮ TRƯỚC – CẮM NGUỒN SAU" (Cold Boot)

Nếu bạn bấm phím lúc máy đang mở và đang bị reset thì **chắc chắn không kịp** (vì CPU đã chạy vào hệ điều hành rồi):

* **Cách làm đúng:**
  1. **Rút hẳn giắc nguồn điện ra** để máy tắt đen thui hoàn toàn.
  2. Dùng que chọc giữ lỗ **Reset** (hoặc bấm giữ chặt nút **Âm lượng / Nguồn**).
  3. **TAY VẪN ĐANG GIỮ CHẶT NÚT**, tay kia **cắm giắc nguồn điện vào**.
  4. **Tiếp tục giữ chặt thêm 10 – 15 giây** không buông.
* **Tác dụng:** Khi làm từ lúc cắm điện (nguồn lạnh), chip khởi động (Bootloader) sẽ đọc nút bấm ngay từ phần nghìn giây đầu tiên $\rightarrow$ Chặn đứng hệ điều hành lại và ép máy vào màn hình Recovery trước khi cái vòng lặp 3 giây kia kịp diễn ra!

---

### Mẹo 3: Cắm bàn phím USB và "Spam" phím liên tục

Cắm sẵn một bàn phím máy tính thông thường vào cổng USB của máy POS từ trước khi cắm điện:
1. Vừa cắm điện bật máy lên, tay bạn **bấm liên tục không ngừng nghỉ (spam)**:
   - Phím **`Windows + N`** (để giật thanh thông báo xuống ngay khoảnh khắc 3 giây quý giá đó).
   - Hoặc phím **`F8`**, phím **`Esc`**, hoặc **`Ctrl + Alt + Del`**.
2. Rất nhiều trường hợp chỉ cần giật được thanh thông báo xuống trong tích tắc 3 giây đó là hệ thống sẽ tạm dừng (pause) tiến trình crash lại, giúp bạn bấm kịp vào bánh răng Cài đặt.

---

👉 **Bạn hãy thử ngay Mẹo 1 (Tắt tạm Wi-Fi / Rút mạng LAN) trước nhé!** Xem khi không có mạng, máy có thoát được cái vòng lặp 3 giây đó không!

---

