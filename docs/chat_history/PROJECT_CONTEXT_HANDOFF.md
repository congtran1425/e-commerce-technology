# TÀI LIỆU BÀN GIAO NGỮ CẢNH DỰ ÁN (PROJECT CONTEXT HANDOFF)

> **Mục đích**: Tài liệu này lưu trữ toàn bộ bức tranh kiến trúc, hiện trạng kỹ thuật, các quyết định quan trọng và tiến độ công việc của dự án **"Một Mẻ Bánh"** (E-Commerce Bakery & POS System).
> 
> Khi chuyển sang máy tính mới (Desktop) hoặc bắt đầu một phiên làm việc mới với AI, chỉ cần cung cấp đường dẫn tệp này:  
> `docs/chat_history/PROJECT_CONTEXT_HANDOFF.md`  
> AI sẽ nắm bắt 100% ngữ cảnh mà không cần hỏi lại từ đầu!

---

## 1. Tổng Quan Dự Án & Tầm Nhìn Sản Phẩm

- **Tên dự án**: Một Mẻ Bánh (Mot Me Banh)
- **Mục tiêu**: Nền tảng thương mại điện tử kết hợp hệ thống POS bán hàng và quản trị chuỗi cho mô hình làm bánh / tiệm bánh tại nhà và cửa hàng.
- **Đối tượng người dùng**: Người tiêu dùng mua bánh/đồ uống online và nhân viên thu ngân/quản lý tại quầy (máy POS).
- **Trải nghiệm thiết kế**: Thủ công, ấm áp, có tính biên tập, chuẩn mực UX mượt mà, tối ưu micro-interactions, tránh giao diện AI generic/slop.

---

## 2. Kiến Trúc Kỹ Thuật (Architecture & Tech Stack)

### 2.1. Cấu trúc Repository (Monorepo)
Dự án được tổ chức dạng monorepo với npm workspaces:
- `apps/web`: Frontend ứng dụng web (React, Vite, CSS Modules / Vanilla CSS hiện đại, Lucide React).
- `apps/api`: Backend RESTful API (Express / TypeScript / Prisma ORM).
- `packages/contracts`: Định nghĩa types, schemas chia sẻ giữa Web và API (Zod / TypeScript).
- `packages/validation`: Bộ quy tắc kiểm tra dữ liệu chung.
- `deploy/`: Cấu hình triển khai hạ tầng VPS, Nginx, Docker.
- `docs/`: Hệ thống tài liệu kiến trúc, API, thiết kế, quyết định kỹ thuật và lịch sử thảo luận.

### 2.2. Cơ Sở Dữ Liệu & ORM
- **Database**: PostgreSQL.
- **ORM**: Prisma (`prisma/schema.prisma`).
- **Nghiệp vụ cốt lõi trong DB**:
  - Người dùng & Nhân sự (`User`, `Staff`, `Branch`, `Role`, `Permission`).
  - Sản phẩm & Công thức bánh (`Product`, `Category`, `Ingredient`, `Recipe`, `RecipeIngredient`).
  - Đơn hàng & POS (`Order`, `OrderItem`, `Payment`, `Invoice`).
  - Thuế suất VAT theo danh mục / từng mặt hàng.
  - Quản trị kho & Nhập hàng (`Inventory`, `PurchaseOrder`, `Supplier`).

### 2.3. Tích Hợp Bên Thứ Ba (Integrations)
- **Thanh toán trực tuyến**: Cổng ZaloPay (Môi trường Sandbox tích hợp tạo đơn, MAC SHA256, kiểm tra trạng thái thanh toán và callback).
- **Email thông báo**: Dịch vụ gửi email thông báo xác nhận đơn hàng qua Gmail SMTP (sử dụng Google App Password bảo mật).

---

## 3. Lịch Sử Các Phiên Làm Việc Đã Hoàn Thành

### 3.1. Các phiên làm việc với Trợ lý AI (Antigravity IDE)

| Tệp lịch sử chat | Nội dung chính |
| :--- | :--- |
| [01_khao_sat_va_phat_trien_cot_loi.md](file:///d:/e-commerce%20technology/docs/chat_history/01_khao_sat_va_phat_trien_cot_loi.md) | Khảo sát toàn bộ repo, thiết kế kiến trúc POS, giải quyết bài toán thuế suất VAT theo từng món nước/bánh, thiết kế luồng nhập hàng và quản trị nhân sự. |
| [02_ke_hoach_trien_khai_auth_va_quan_tri.md](file:///d:/e-commerce%20technology/docs/chat_history/02_ke_hoach_trien_khai_auth_va_quan_tri.md) | Bám sát dàn ý tiểu luận Công nghệ TMĐT, lập kế hoạch triển khai Auth JWT + Refresh Token, phân quyền RBAC và quản trị tiệm bánh. |
| [03_trien_khai_vps_smtp_va_zalopay.md](file:///d:/e-commerce%20technology/docs/chat_history/03_trien_khai_vps_smtp_va_zalopay.md) | Khảo sát hạ tầng VPS, chuẩn bị migrate PostgreSQL lên VPS, tích hợp Gmail SMTP và cấu hình cổng thanh toán ZaloPay Sandbox. |
| [04_toi_uu_navbar_ux_va_nhan_su.md](file:///d:/e-commerce%20technology/docs/chat_history/04_toi_uu_navbar_ux_va_nhan_su.md) | Tối ưu trải nghiệm cuộn và hiệu ứng chuyển động Navbar, chuẩn hóa tên nhân sự (Võ Minh Anh, chi nhánh), dọn dẹp và bảo mật cấu trúc `/docs`. |
| [05_ket_noi_pos_hardware.md](file:///d:/e-commerce%20technology/docs/chat_history/05_ket_noi_pos_hardware.md) | Khảo sát và hướng dẫn kết nối máy POS bán hàng qua cổng USB-C to USB-B với máy tính Windows, kiểm tra nguồn điện và driver. |
| [06_sao_luu_va_chuyen_giao_sang_desktop.md](file:///d:/e-commerce%20technology/docs/chat_history/06_sao_luu_va_chuyen_giao_sang_desktop.md) | Trích xuất toàn bộ dữ liệu đối thoại, bảo tồn artifacts, đóng gói sao lưu để chuyển giao sang Desktop khi gửi Laptop đi bảo hành. |

### 3.2. Các phiên làm việc và giải pháp kỹ thuật cốt lõi với Codex (Codex Sessions)

Các file chi tiết nằm trong [docs/chat_history/codex/](file:///d:/e-commerce%20technology/docs/chat_history/codex/):
- **Sửa luồng hủy thanh toán QR ZaloPay & Tối ưu Sidebar (`01_fix_qr_payment...`)**: Xử lý logic khi khách hàng hoặc thu ngân bấm hủy mã QR; bổ sung nút đóng/hủy an toàn; tối ưu hóa thanh Sidebar; sửa 4 màn hình Compose của máy POS (Lịch sử hóa đơn, tồn kho, đồng bộ, hóa đơn khách hàng); sửa truy vấn `GET /api/v1/sales` trên backend để chỉ trả về và thống kê các đơn `PAID`.
- **Khảo sát & Chuẩn hóa dự án môn học (`02_khao_sat_lai...`)**: Rà soát các tiêu chí bài tập môn Công nghệ Thương mại điện tử, cấu trúc monorepo và các quy chuẩn code.
- **Xử lý phần cứng POS qua cổng USB & Type-C (`03_kiem_tra...`, `04_kiem_tra...`)**: Kiểm tra giao tiếp giữa máy POS và PC qua cổng USB-C/USB-B, cấp nguồn độc lập cho thiết bị.
- **Thiết kế & Triển khai POS đa tenant (`05_final_project...`, `06_final_project...`)**: Kiến trúc dữ liệu multi-tenant cho chuỗi cửa hàng, quản lý đơn hàng theo chi nhánh và phân quyền.
- **Thiết kế luồng Frontend React & Quản lý trạng thái (`07_e_commerce...`)**: Xây dựng cấu trúc component React, quản lý state giỏ hàng, đặt hàng và thanh toán.

---

## 4. Các Tài Liệu Artifacts Kế Hoạch Đã Được Bảo Tồn

Các tài liệu kế hoạch quan trọng đã được lưu trữ an toàn trong thư mục `docs/chat_history/artifacts/`:
1. `01_implementation_plan.md`: Kế hoạch triển khai tổng thể ban đầu.
2. `01_ke_hoach_du_lieu_nhap_hang_va_quan_tri_nhan_su.md`: Kế hoạch mô hình dữ liệu nhập hàng, quản lý nhân viên và chi nhánh.
3. `01_ke_hoach_hoan_thien_nhap_hang_va_dieu_huong_web.md`: Kế hoạch luồng điều hướng UI và nghiệp vụ nhập kho.
4. `01_pos_ui_wireframes_and_code.md`: Bản thiết kế giao diện Wireframe POS chi tiết và mã nguồn mẫu.
5. `01_walkthrough.md`: Hướng dẫn kiểm thử và các bước chạy thực tế.
6. `02_auth_and_management_plan.md`: Kế hoạch triển khai hệ thống xác thực và trang quản trị.
7. `02_filmiliar_implementation_plan.md`: Kế hoạch chuẩn hóa theo yêu cầu tiểu luận.

---

## 5. Hiện Trạng Kỹ Thuật & Các Việc Cần Làm Tiếp Theo

### 5.1. Những việc đã xong
- [x] Khảo sát và tái cấu trúc hệ thống tài liệu `/docs`.
- [x] Thiết kế UI/UX thanh điều hướng Navbar mượt mà, giữ nguyên nhận diện và danh mục.
- [x] Đồng nhất tên nhân viên chi nhánh và chuẩn hóa dữ liệu nhân sự.
- [x] Codebase sạch sẽ, không còn file tạm hay log rác chưa qua rà soát.
- [x] Đã sao lưu toàn bộ lịch sử trò chuyện và tài liệu kế hoạch vào Git.

### 5.2. Các công việc ưu tiên khi khởi động trên máy Desktop
1. **Kiểm tra môi trường local**: Chạy server API (cổng 3000 / 3001) và Web client (cổng 5173).
2. **Triển khai VPS**:
   - Chuyển hostname API sang `apimotmebanh.com` (hoặc domain chỉ định).
   - Thiết lập Docker Compose trên VPS (PostgreSQL + API + Web).
   - Cấu hình file `.env` trên VPS với các biến môi trường bảo mật (Database URL, JWT Secret, ZaloPay Sandbox, Gmail SMTP).
3. **Hoàn thiện luồng thanh toán POS & Online**:
   - Kiểm thử ZaloPay callback và cập nhật trạng thái đơn hàng thời gian thực.
   - In hóa đơn và đồng bộ tồn kho sau khi thanh toán thành công.

---

## 6. Hướng Dẫn Thiết Lập Nhanh Trên Máy Desktop Mới

Sau khi kéo mã nguồn về máy Desktop mới:

```bash
# 1. Clone repository
git clone https://github.com/congtran1425/e-commerce-technology.git
cd e-commerce-technology

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình biến môi trường
# Tạo file .env dựa trên các mẫu trong tài liệu docs/deployment/
# Chạy migration database (nếu chạy DB local)
npx prisma generate
npx prisma migrate dev

# 4. Chạy môi trường phát triển
npm run dev
```

### Prompt Mẫu Dành Cho AI Mới Trên Desktop
> *"Chào bạn, tôi vừa chuyển repo này sang máy Desktop mới. Hãy đọc kỹ tệp `docs/chat_history/PROJECT_CONTEXT_HANDOFF.md` và `AGENTS.md` để nắm toàn bộ ngữ cảnh dự án và tiếp tục công việc của chúng ta."*
