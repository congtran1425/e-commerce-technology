# Báo cáo Nâng cấp: Tinh chỉnh Giao diện POS (TopBar, Leftbar & Thẻ sản phẩm)

Toàn bộ các yêu cầu tinh chỉnh giao diện đã được triển khai, biên dịch và kiểm thử trực tiếp trên máy ảo Tablet Android POS:

---

## 1. Thanh Toolbar (TopAppBar) mới chuẩn hóa
Bố cục mới được tái sắp xếp công thái học, loại bỏ chữ "UEH" và gom chức năng "Attendance" vào bên trong Menu 6 ô:

* **Bên trái (Nhân sự):**
  * **Icon Đăng xuất / Khóa ca (`ExitToApp`)**: Bấm vào đăng xuất ngay và làm sạch ID/PIN.
  * **Avatar + Tên thu ngân**: `[N] Nguyễn Văn Thu Ngân`.
* **Trung tâm (Định vị cửa hàng):**
  * **Tóm tắt địa chỉ chi nhánh & Mã máy**: `🏪 59C Nguyễn Đình Chiểu, P. Võ Thị Sáu • POS-01`.
* **Bên phải (Hệ thống & Tiện ích):**
  * **Đồng hồ thực tế (Live Clock)**: Chạy thời gian thực theo múi giờ `Asia/Ho_Chi_Minh` (`03:30 - 22/09/2026`).
  * **Trạng thái kết nối & Sync Outbox**: `🟢 Trực tuyến • Đã đồng bộ`.
  * **Nút Menu 6 ô**: Mở bảng chức năng hệ thống (chứa tính năng **Attendance**, Kiểm kho, Bàn giao ca,...).

![Màn hình Bán hàng với TopAppBar mới](file:///C:/Users/ADMIN/.gemini/antigravity-ide/brain/72ed18fc-077f-4361-884e-b27886e60856/pos_new_order_screen.png)

---

## 2. Thanh Leftbar (Danh mục Category)
* **Loại bỏ mục "Tất cả":** Giờ đây chỉ còn hiển thị các danh mục thực sự:
  * ☕ **Cà Phê** (mặc định được chọn khi khởi động)
  * 🥐 **Bánh Ngọt**
  * 🧋 **Trà Sữa**
  * 🍹 **Trà Trái Cây**
* Giúp thu ngân chuyển đổi nhanh theo nhóm đồ uống mà không bị rối mắt bởi danh sách quá dài.

![Chọn danh mục Bánh Ngọt](file:///C:/Users/ADMIN/.gemini/antigravity-ide/brain/72ed18fc-077f-4361-884e-b27886e60856/pos_banh_ngot_selected.png)

---

## 3. Thẻ Sản phẩm (Product Card)
* **Loại bỏ Mã sản phẩm (`CF01`) và Thuế VAT (`VAT 10%`) khỏi thẻ:** Tiết kiệm không gian hiển thị.
* **Mở rộng diện tích Tên món:**
  * Cho phép hiển thị trọn vẹn 2 dòng với font chữ 14sp đậm rõ nét.
  * Toàn bộ tên sản phẩm dài (như *Caramel Macchiato, Espresso Macchiato, Cheesecake Chanh Dây, Cà Phê Muối Huế...*) đều hiển thị **đầy đủ 100%**, không còn tình trạng bị cắt cụt dấu `"..."`.
  * Hàng dưới giữ giá bán màu hổ phách CoffeeAmber cùng nút tròn nhỏ `+` thêm nhanh vào giỏ hàng.

---

## 4. Chức năng Attendance trong Menu
* Nút Attendance đã được gom gọn vào ô thứ 2 trong **Menu Chức Năng Hệ Thống** (`FunctionsMenuScreen`), giúp TopBar luôn thoáng đãng trong suốt ca bán hàng.

![Menu chức năng chứa nút Attendance](file:///C:/Users/ADMIN/.gemini/antigravity-ide/brain/72ed18fc-077f-4361-884e-b27886e60856/pos_menu_screen_opened.png)
