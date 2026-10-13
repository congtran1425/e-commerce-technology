# LỊCH SỬ HỘI THOẠI & BẢN SAO LƯU NGỮ CẢNH DỰ ÁN

Thư mục này chứa toàn bộ lịch sử trao đổi, các quyết định kiến trúc, bản thiết kế kế hoạch (artifacts) và dữ liệu ngữ cảnh làm việc của dự án **Một Mẻ Bánh**.

Tài liệu này được tạo ra để phục vụ việc chuyển đổi máy tính làm việc (từ Laptop sang Desktop) mà **không bị mất bất kỳ ngữ cảnh hay lịch sử phát triển nào**.

---

## 📌 1. Mục Lục Các Phiên Làm Việc

Tất cả các phiên trò chuyện đã được chuyển đổi sang định dạng Markdown sạch sẽ, dễ đọc, đã được rà soát để loại bỏ thông tin nhạy cảm:

| STT | Phiên làm việc | Chi tiết nội dung |
| :-: | :--- | :--- |
| **01** | [01_khao_sat_va_phat_trien_cot_loi.md](./01_khao_sat_va_phat_trien_cot_loi.md) | Khảo sát dự án, phát triển hệ thống POS, thuế VAT theo từng món bánh, luồng nhập hàng & nhân sự (78 lượt trao đổi). |
| **02** | [02_ke_hoach_trien_khai_auth_va_quan_tri.md](./02_ke_hoach_trien_khai_auth_va_quan_tri.md) | Kế hoạch triển khai bám sát dàn ý tiểu luận TMĐT, kiến trúc Auth & phân quyền quản trị (29 lượt trao đổi). |
| **03** | [03_trien_khai_vps_smtp_va_zalopay.md](./03_trien_khai_vps_smtp_va_zalopay.md) | Khảo sát triển khai VPS, chuyển đổi Database, cấu hình Gmail SMTP & cổng ZaloPay Sandbox (15 lượt trao đổi). |
| **04** | [04_toi_uu_navbar_ux_va_nhan_su.md](./04_toi_uu_navbar_ux_va_nhan_su.md) | Tối ưu trải nghiệm vi tương tác Navbar UX, đồng nhất dữ liệu nhân viên chi nhánh, tái cấu trúc thư mục `/docs` (9 lượt trao đổi). |
| **05** | [05_ket_noi_pos_hardware.md](./05_ket_noi_pos_hardware.md) | Chẩn đoán và hướng dẫn kết nối phần cứng máy POS qua cổng USB-C to USB-B (7 lượt trao đổi). |
| **06** | [06_sao_luu_va_chuyen_giao_sang_desktop.md](./06_sao_luu_va_chuyen_giao_sang_desktop.md) | Trích xuất toàn bộ dữ liệu, đóng gói artifacts và hướng dẫn chuyển giao ngữ cảnh sang Desktop (phiên hiện tại). |

---

## 🤖 2. Lịch Sử Các Cuộc Trò Chuyện Với Codex (Codex CLI / Desktop)

Toàn bộ các phiên trao đổi trước đây giữa bạn và **Codex** (trong `~/.codex/sessions`) đã được trích xuất thành Markdown sạch sẽ trong thư mục [codex/](./codex/):

| STT | Tệp lịch sử Codex | Chi tiết nội dung | Thời gian |
| :-: | :--- | :--- | :-: |
| **C01** | [01_fix_qr_payment_va_sidebar_pos.md](./codex/01_fix_qr_payment_va_sidebar_pos.md) | Sửa nút hủy luồng thanh toán QR ZaloPay, tối ưu Sidebar, cập nhật 4 màn POS Jetpack Compose, lọc đơn `PAID` trên API `/api/v1/sales`. | 12/10/2026 |
| **C02** | [02_khao_sat_lai_du_an_va_filmiliar.md](./codex/02_khao_sat_lai_du_an_va_filmiliar.md) | Khảo sát lại cấu trúc dự án môn học và chuẩn hóa cấu trúc ứng dụng. | 11/10 - 12/10/2026 |
| **C03** | [03_kiem_tra_ket_noi_may_pos_usb.md](./codex/03_kiem_tra_ket_noi_may_pos_usb.md) | Kiểm tra kết nối máy POS qua cổng USB trên Windows. | 03/10/2026 |
| **C04** | [04_kiem_tra_ket_noi_cong_type_c.md](./codex/04_kiem_tra_ket_noi_cong_type_c.md) | Xử lý kiểm tra kết nối thiết bị bán hàng qua cổng Type-C. | 03/10/2026 |
| **C05** | [05_final_project_pos_da_tenant_p2.md](./codex/05_final_project_pos_da_tenant_p2.md) | Triển khai chi tiết POS đa tenant, kết nối database và logic quản lý (Phần 2 - 106 lượt chat). | 10/09/2026 |
| **C06** | [06_final_project_pos_da_tenant_p1.md](./codex/06_final_project_pos_da_tenant_p1.md) | Phân tích tính khả thi và thiết kế kiến trúc POS đa tenant (Phần 1 - 28 lượt chat). | 20/08 - 21/08/2026 |
| **C07** | [07_e_commerce_technology_fe_react.md](./codex/07_e_commerce_technology_fe_react.md) | Thiết kế phân luồng Frontend React, cấu trúc component và state quản lý giỏ hàng/sản phẩm (156 lượt chat). | 19/08/2026 |
| **C08** | [08_dat_ten_de_tai_woocommerce.md](./codex/08_dat_ten_de_tai_woocommerce.md) | Đặt tên đề tài website và định hướng nghiên cứu đề tài TMĐT. | 28/08/2026 |
| **C09** | [09_cai_woocommerce_tu_ben_ngoai.md](./codex/09_cai_woocommerce_tu_ben_ngoai.md) | Cài đặt và tích hợp WooCommerce từ bên ngoài. | 27/08 - 28/08/2026 |
| **C10** | [10_social_calendar_thiet_ke.md](./codex/10_social_calendar_thiet_ke.md) | Phân tích và thiết kế mô-đun Social Calendar (64 lượt chat). | 27/07 - 29/07/2026 |

---

## 📑 3. Thư Mục Kế Hoạch & Thiết Kế (Artifacts)

Tất cả các tệp kế hoạch, wireframe và tài liệu hướng dẫn được AI tạo ra trong các phiên làm việc trước đây đã được lưu trữ an toàn tại thư mục [artifacts/](./artifacts/):

- `01_implementation_plan.md`: Kế hoạch triển khai tổng thể.
- `01_ke_hoach_du_lieu_nhap_hang_va_quan_tri_nhan_su.md`: Thiết kế mô hình nhập kho và quản lý nhân sự.
- `01_ke_hoach_hoan_thien_nhap_hang_va_dieu_huong_web.md`: Thiết kế điều hướng giao diện và phân trang web.
- `01_pos_ui_wireframes_and_code.md`: Bản thiết kế Wireframes và mã nguồn UI máy POS.
- `01_walkthrough.md`: Tài liệu hướng dẫn nghiệm thu và chạy thử.
- `02_auth_and_management_plan.md`: Kế hoạch hệ thống xác thực Auth và Dashboard quản trị.
- `02_filmiliar_implementation_plan.md`: Kế hoạch bám sát đề tài tiểu luận.

---

## 🎯 4. Tài Liệu Bàn Giao Ngữ Cảnh Nhanh (Master Context)

Khi chuyển sang Desktop hoặc muốn một AI mới hiểu toàn bộ dự án trong 30 giây:
👉 Hãy mở hoặc chuyển tệp [PROJECT_CONTEXT_HANDOFF.md](./PROJECT_CONTEXT_HANDOFF.md) cho AI.

---

## 🔄 5. Hướng Dẫn Khôi Phục Dữ Liệu Lên Máy Desktop Mới

### Cách 1: Sử dụng ngữ cảnh với AI mới (Khuyên Dùng - Đơn giản nhất)
1. Trên Desktop, mở terminal clone repository về máy:
   ```bash
   git clone https://github.com/congtran1425/e-commerce-technology.git
   ```
2. Mở dự án bằng Antigravity IDE (hoặc VS Code, Cursor).
3. Mở khung chat với AI và chỉ cần nhắn:
   > *"Đọc file `docs/chat_history/PROJECT_CONTEXT_HANDOFF.md` và tiếp tục công việc của dự án Một Mẻ Bánh."*
   AI sẽ tự động đọc hiểu toàn bộ kiến trúc, tiến độ và tiếp tục công việc mượt mà.

---

### Cách 2: Khôi phục trực tiếp vào Antigravity IDE (Nâng Cao - Tùy Chọn)
Nếu bạn muốn trong danh sách chat của Antigravity IDE trên Desktop hiển thị lại đúng các phiên trò chuyện cũ:
1. File nén `raw_transcripts.zip` trong thư mục này chứa toàn bộ dữ liệu session gốc (`transcript.jsonl`).
2. Trên máy Desktop, mở thư mục AppData của Antigravity IDE:
   `C:\Users\<Tên_User_Của_Desktop>\.gemini\antigravity-ide\brain\`
3. Giải nén các file từ `raw_transcripts.zip` vào thư mục brain tương ứng với mã Conversation ID.
4. Khởi động lại Antigravity IDE, toàn bộ lịch sử trò chuyện trong quá khứ sẽ hiển thị lại trên giao diện.
