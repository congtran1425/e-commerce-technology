# Web application

React frontend dành cho khách hàng (`/*`) và quản trị viên (`/admin/*`).

## Chạy ứng dụng

Từ thư mục gốc repository:

```bash
npm ci
npm run dev:web
```

Mở `http://localhost:5173`. Build production bằng `npm run build --workspace=@ecommerce/web`.

Web cần API chạy tại URL trong `VITE_API_BASE_URL`. Luồng hiện có: danh sách công thức → chi tiết → chọn khẩu phần → bỏ dụng cụ đã có → thêm cả bộ vào giỏ cục bộ. Ảnh và giá hiện được ghi rõ là dữ liệu minh họa.

Stack hiện tại: TypeScript, React 19, Vite 8 và React Router 7. Phiên bản chính xác nằm trong `package-lock.json`.

Cấu trúc dự kiến khi khởi tạo source:

```text
src/
|-- app/                # router, providers, entry composition
|-- features/           # auth, catalog, cart, checkout, orders, admin...
|-- layouts/            # CustomerLayout, AdminLayout
|-- pages/              # trang customer, admin và lỗi
|-- shared/             # api client, component, hook, style dùng chung
`-- main.tsx
```

Mỗi feature nên tự chứa `api`, `components`, `hooks`, kiểu dữ liệu và `index.ts`. Không đặt business logic đáng kể trong `pages`.

Route `/admin` được route guard phía React giới hạn cho vai trò `ADMIN`; đây chỉ là lớp trải nghiệm. Mọi API quản trị được tạo sau này vẫn phải tự kiểm tra phiên và quyền ở backend.

## Giỏ hàng tạm

Giỏ tạm được lưu cục bộ trong trình duyệt để khách chưa đăng nhập vẫn có thể đi từ công thức đến danh sách cần mua. Mỗi khi mở giỏ hoặc đổi số lượng, web gọi `POST /api/cart/quote` để lấy lại giá và tồn kho từ backend. Giá/tồn kho trả về từ API mới là dữ liệu hiển thị trước khi thanh toán; dữ liệu trong trình duyệt không được tin cậy để tạo đơn.

Trang giỏ đã có bố cục một cột cho điện thoại và được kiểm tra ở chiều rộng 320, 375, 414 và 768 px. Biểu tượng giỏ luôn hiện trên thanh đầu trang ở màn hình hẹp.

## Đăng nhập và bắt đầu thanh toán

Nút thanh toán chỉ bật sau khi backend xác nhận toàn bộ mặt hàng còn bán và đủ tồn kho. Khách chưa đăng nhập được chuyển đến `/dang-nhap?next=/thanh-toan`; sau khi đăng nhập hoặc tạo tài khoản, web quay lại đúng đường dẫn và giữ nguyên giỏ trong trình duyệt.

`AuthProvider` đọc phiên từ `/api/auth/me`; frontend không đọc hoặc lưu mã phiên. Tại `/thanh-toan`, khách nhập địa chỉ nhận hàng, kiểm tra lại giỏ rồi chuyển sang ZaloPay Sandbox. Trang `/thanh-toan/ket-qua` luôn hỏi lại backend về trạng thái đơn; nó không xem tham số chuyển hướng từ cổng thanh toán là bằng chứng đã trả tiền.

Frontend chỉ cần `VITE_API_BASE_URL`. Biến có tiền tố `VITE_` được đóng gói vào mã JavaScript công khai, vì vậy không đặt khóa ZaloPay, mật khẩu database hoặc bất kỳ bí mật nào trong cấu hình Vercel của web.
