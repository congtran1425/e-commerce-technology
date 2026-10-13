# KẾ HOẠCH THIẾT KẾ & HOÀN THIỆN: AUTH, TRANG CÁ NHÂN & QUẢN TRỊ ADMIN (FILMILIAR)

> **Mục tiêu**: Nâng cấp Filmiliar từ phiên bản xem trước danh mục thành một nền tảng thương mại điện tử O2O hoàn chỉnh với hệ thống xác thực phân quyền 2 cấp (Customer / Admin), trang quản lý cá nhân minh bạch hợp đồng & tiền cọc, và trung tâm điều hành quản trị kho máy kiểm định (Technical Passport Hub).

---

## I. KIẾN TRÚC PHÂN QUYỀN & LUỒNG XÁC THỰC (AUTHENTICATION & RBAC)

### 1. Mô hình Phân quyền (Role-Based Access Control)
```
┌────────────────────────────────────────────────────────────────────────┐
│                        NGƯỜI DÙNG HỆ THỐNG                             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│       CUSTOMER (Khách hàng)     │         │          ADMIN (Quản trị)       │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│ • Đăng ký / Đăng nhập tài khoản │         │ • Đăng nhập với quyền quản trị  │
│ • Xem & cập nhật hồ sơ cá nhân  │         │ • Xem Dashboard KPIs doanh thu  │
│ • Tải ảnh CCCD & định danh eKYC │         │ • Quản lý kho máy & Passport    │
│ • Theo dõi đơn thuê & hoàn cọc  │         │ • Duyệt đơn thuê & xác nhận cọc │
│ • Quản lý đơn mua máy cũ        │         │ • Duyệt định danh eKYC khách    │
│ • Truy cập: /tai-khoan          │         │ • Truy cập: /admin & /tai-khoan │
└─────────────────────────────────┘         └─────────────────────────────────┘
```

### 2. Luồng Đăng nhập & Điều hướng (UX Flow)
1. **Modal Đăng nhập nhanh (Quick Modal)**:
   - Xuất hiện linh hoạt từ thanh Navbar (Desktop & Mobile) khi người dùng bấm "Đăng nhập" hoặc bấm thao tác cần tài khoản (Thuê máy, Lưu hồ sơ).
   - Tích hợp tính năng **Demo 1-Click Fill** (dành cho Ban Giám khảo, Giảng viên chấm bài, Tester):
     - **Nút "Tài khoản Khách hàng"**: Tự điền `customer@filmiliar.vn` / `FilmiliarUser@2026`
     - **Nút "Tài khoản Quản trị viên"**: Tự điền `admin@filmiliar.vn` / `FilmiliarAdmin@2026`
2. **Trang chuyên biệt (Dedicated Route)**:
   - `/dang-nhap` và `/dang-ky`: Phục vụ khi người dùng truy cập trực tiếp hoặc bị chuyển hướng khi hết hạn phiên đăng nhập.
3. **Cơ chế Bảo vệ Tuyến đường (Route Guarding)**:
   - `ProtectedRoute`: Kiểm tra đăng nhập trước khi cho phép vào `/tai-khoan`. Nếu chưa đăng nhập, tự động mở AuthModal hoặc chuyển về `/dang-nhap?redirect=/tai-khoan`.
   - `AdminRoute`: Kiểm tra token và `role === 'ADMIN'` trước khi cho phép vào `/admin`. Nếu không phải Admin, chuyển hướng về trang chủ và thông báo cảnh báo.

---

## II. THIẾT KẾ TRANG QUẢN LÝ CÁ NHÂN (`/tai-khoan`)

Giao diện được thiết kế theo phong cách Film Dark & Warm Accent đồng bộ với thương hiệu Filmiliar, bố cục chia 2 cột: Sidebar điều hướng thẻ + Content hiển thị tương tác.

### Bố cục Tab chức năng:
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ FILMILIAR - TRANG CÁ NHÂN                                      [Đăng xuất]       │
├──────────────────────┬───────────────────────────────────────────────────────────┤
│ [Ảnh Avatar / Initial]│ 📑 TAB 1: THÔNG TIN HỒ SƠ & BẢO MẬT                       │
│ Trần Chí Công        │ • Họ và tên, Email, Số điện thoại, Địa chỉ nhận máy       │
│ customer@filmiliar.vn│ • Trạng thái tài khoản & Nút Cập nhật thông tin           │
│ Trạng thái: Đã xác minh│ • Đổi mật khẩu bảo mật (Mật khẩu cũ / Mới)                │
│                      ├───────────────────────────────────────────────────────────┤
│ ── CHỌN MỤC ──       │ 🪪 TAB 2: ĐỊNH DANH ĐIỆN TỬ (eKYC / CCCD)                 │
│ 1. Hồ sơ cá nhân     │ • Thẻ trạng thái: [CHƯA XÁC MINH | CHỜ DUYỆT | ĐÃ DUYỆT]  │
│ 2. Định danh eKYC    │ • Số CCCD / CMND 12 số                                    │
│ 3. Đơn thuê máy (2)  │ • Vùng tải ảnh mặt trước, mặt sau và Chữ ký số điện tử    │
│ 4. Đơn mua máy (1)   │ • Quyền lợi: Khách eKYC thành công được giảm 50% tiền cọc │
│                      ├───────────────────────────────────────────────────────────┤
│                      │ 📦 TAB 3: THIẾT BỊ & ĐƠN THUÊ CỦA TÔI                     │
│                      │ • Thẻ hợp đồng: Mã đơn (BK-...), Thời gian thuê (Start-End)│
│                      │ • Máy thuê kèm Serial & Hộ chiếu KT (Click xem Passport)  │
│                      │ • Trạng thái cọc: [ĐANG GIỮ AN TOÀN | ĐÃ HOÀN CỌC 100%]   │
│                      │ • Trạng thái đơn: [CHỜ NHẬN | ĐANG SỬ DỤNG | HOÀN TẤT]    │
│                      ├───────────────────────────────────────────────────────────┤
│                      │ 🛍️ TAB 4: ĐƠN MUA MÁY SECOND-HAND KIỂM ĐỊNH              │
│                      │ • Mã đơn hàng mua, giá thanh toán                         │
│                      │ • Thời hạn bảo hành 6 tháng (Đếm ngược ngày còn lại)      │
└──────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## III. THIẾT KẾ TRANG QUẢN TRỊ TRANG WEB (`/admin`)

Dành riêng cho Quản trị viên điều hành kinh doanh O2O, theo dõi tình trạng thiết bị trong kho và vận hành đơn thuê/mua.

### Bố cục Tab chức năng:

### 1. Tab `Tổng quan & KPIs` (Dashboard Metrics)
- **Tỷ lệ khai thác thiết bị (Fleet Utilization Rate)**: Thước đo quan trọng nhất của mô hình cho thuê (% số máy đang được khách thuê trên tổng số máy).
- **Thống kê kho máy**: Tổng dòng máy (11 models), tổng số máy vật lý (10 units), số máy sẵn sàng, số máy đang bảo dưỡng/đang cho thuê.
- **Dòng tiền ký quỹ (Escrow Deposit Ledger)**: Tổng số tiền cọc Filmiliar đang nắm giữ bảo đảm cho khách hàng.
- **Biểu đồ tỷ lệ danh mục**: Phân bố tỷ trọng thuê (Sony vs Fujifilm vs Canon).

### 2. Tab `Quản lý Đơn thuê & Hoàn cọc` (Rental & Deposit Ops)
- Bảng danh sách toàn bộ hợp đồng thuê trong hệ thống kèm bộ lọc trạng thái (`PENDING_PAYMENT`, `CONFIRMED`, `ACTIVE_RENTAL`, `COMPLETED`, `CANCELLED`).
- **Nút hành động nhanh cho Admin**:
  - `Xác nhận & Giữ cọc`: Chuyển đơn sang trạng thái sẵn sàng giao máy.
  - `Bàn giao thiết bị`: Kích hoạt trạng thái `ACTIVE_RENTAL`, tự động khóa máy trong kho sang `RENTED`.
  - `Thu hồi & Nghiệm thu kỹ thuật`: Mở modal kiểm tra vết xước/số shot lúc trả, nhập ghi chú nghiệm thu (`returnInspectionNote`), bấm `Hoàn cọc` để trả cọc cho khách và đưa máy về trạng thái `AVAILABLE`.

### 3. Tab `Kho máy & Technical Passport` (Inventory & Passport Management)
- Quản lý từng con máy vật lý cụ thể (Physical Instance):
  - Tra cứu theo mã Serial định danh (`S01-A7M4-...`).
  - Cập nhật số lần bấm máy (Shutter Count).
  - Cập nhật xếp hạng ngoại hình (Grade A+, A, B+).
  - Cập nhật tình trạng cảm biến (Sensor Inspection) & thấu kính (Optics Condition).
  - Đổi trạng thái khả dụng (`AVAILABLE`, `RENTED`, `MAINTENANCE`, `SOLD`).

### 4. Tab `Người dùng & Duyệt eKYC` (User & Verification Ops)
- Danh sách tài khoản khách hàng đăng ký trên hệ thống.
- Xem xét hồ sơ định danh CCCD và duyệt eKYC (`VERIFIED` hoặc `REJECTED` kèm lý do).
- Phân quyền tài khoản (`CUSTOMER` -> `TECHNICIAN` -> `ADMIN`).

---

## IV. ĐẶC TẢ API BACKEND CẦN BỔ SUNG & HOÀN THIỆN

Hiện tại Backend đã có nền tảng tốt (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/admin/stats`, `/api/admin/bookings`). Cần bổ sung các endpoints sau:

| Phương thức | Endpoint | Phân quyền | Mục đích |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/seed-users` | Public (Dev/VPS) | Khởi tạo tài khoản Admin & Khách mẫu vào DB |
| `PUT` | `/api/user/profile` | Logged In | Cập nhật họ tên, SĐT, địa chỉ nhận hàng |
| `POST` | `/api/user/kyc` | Logged In | Gửi số CCCD & thông tin eKYC để chờ duyệt |
| `PUT` | `/api/user/change-password` | Logged In | Đổi mật khẩu người dùng |
| `GET` | `/api/admin/inventory` | ADMIN | Lấy danh sách toàn bộ các con máy kèm thông số Passport |
| `PATCH` | `/api/admin/inventory/:serial`| ADMIN | Cập nhật số shot, tình trạng sensor/vỏ, trạng thái kho |
| `GET` | `/api/admin/users` | ADMIN | Danh sách người dùng & hồ sơ eKYC |
| `PATCH` | `/api/admin/users/:id/kyc` | ADMIN | Duyệt (`VERIFIED`) hoặc Từ chối (`REJECTED`) eKYC |

---

## V. LỘ TRÌNH THỰC HIỆN 4 GIAI ĐOẠN (ROADMAP)

- [ ] **Giai đoạn 1: Chuẩn hóa Dữ liệu & API Backend**
  - Cập nhật `seed.ts` để tạo sẵn 2 tài khoản tiêu chuẩn: `admin@filmiliar.vn` (Role ADMIN) và `khachhang@filmiliar.vn` (Role CUSTOMER) với mật khẩu scrypt chuẩn (`FilmiliarAdmin@2026`, `FilmiliarUser@2026`).
  - Viết các API cập nhật Profile, nộp KYC, đổi mật khẩu và quản lý kho máy/Passport cho Admin.
  - Viết script test độc lập kiểm tra tất cả endpoints.

- [ ] **Giai đoạn 2: Tối ưu Luồng Xác thực Frontend & Demo Quick-Login**
  - Cập nhật [AuthModal.tsx](file:///d:/Filmiliar/apps/client/src/components/AuthModal.tsx): Sửa nút 1-click Quick Fill với mật khẩu hợp lệ mới.
  - Tạo trang chuyên biệt `/dang-nhap` và `/dang-ky`.
  - Thiết lập Context quản lý phiên đăng nhập và các component bảo vệ tuyến (`ProtectedRoute`, `AdminRoute`).

- [ ] **Giai đoạn 3: Xây dựng Trang Quản lý Cá nhân (`/tai-khoan`)**
  - Tạo trang [AccountPage.tsx](file:///d:/Filmiliar/apps/client/src/pages/AccountPage.tsx) với đầy đủ 4 Tabs: Thông tin cá nhân, Định danh eKYC, Thiết bị & Đơn thuê của tôi, Đơn mua máy kiểm định.
  - Tích hợp gọi API cập nhật hồ sơ, gửi CCCD và hiển thị tình trạng cọc.

- [ ] **Giai đoạn 4: Xây dựng Trang Quản trị Trang web (`/admin`)**
  - Tạo trang [AdminPage.tsx](file:///d:/Filmiliar/apps/client/src/pages/AdminPage.tsx) với 4 Tabs: Dashboard KPIs, Đơn thuê & Hoàn cọc, Kho máy & Technical Passport, Thành viên & Duyệt eKYC.
  - Tích hợp tương tác cập nhật tình trạng con máy (Serial, số shot, grade) và duyệt đơn thuê trực tiếp.
  - Cập nhật thanh điều hướng [Navbar.tsx](file:///d:/Filmiliar/apps/client/src/components/Navbar.tsx) để dẫn trực tiếp vào 2 trang mới.
  - Kiểm thử, build kiểm tra correctness, commit và đồng bộ lên GitHub & VPS.
