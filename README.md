# Bếp Đủ Bánh

Dự án thương mại điện tử cá nhân dành cho người Việt muốn tự làm bánh tại nhà, từ người mới bắt đầu đến người đã có kinh nghiệm.

Giá trị cốt lõi:

```text
chọn món bánh → chọn khẩu phần → mua đủ nguyên liệu và dụng cụ
```

`Bếp Đủ Bánh` là tên thương hiệu chính thức của sản phẩm. Tên repository và các định danh kỹ thuật cũ được giữ lại để tránh làm hỏng cấu hình triển khai và lịch sử phát triển.

## Thành phần hệ thống

- `apps/web`: ứng dụng React dành cho khách hàng và quản trị viên.
- `apps/api`: Express REST API xử lý xác thực, phân quyền và nghiệp vụ.
- `packages/contracts`: kiểu dữ liệu và hợp đồng API dùng chung.
- `packages/validation`: lược đồ kiểm tra dữ liệu dùng chung khi có nhu cầu.
- `packages/config`: cấu hình TypeScript, ESLint và công cụ dùng chung.

## Kiến trúc triển khai dự kiến

```text
Trình duyệt
   |
   v
React trên Vercel
   | HTTPS API
   v
Oracle Cloud VM: Caddy -> Express API
   |
   v
PostgreSQL trên cùng máy ảo
```

Khách hàng và quản trị viên dùng chung một ứng dụng React nhưng có vùng giao diện riêng:

```text
/*          → khách hàng
/admin/*    → quản trị viên
```

Tên miền dự kiến:

```text
bepdubanh.congtc145.id.vn      → frontend hiện tại
api.ecomtech.congtc145.id.vn   → backend dự kiến
```

Backend luôn là nơi kiểm tra quyền thực sự. Chặn đường dẫn ở React chỉ hỗ trợ trải nghiệm, không thay thế xác thực và phân quyền tại API.

## Cấu trúc repository

```text
.
|-- apps/
|   |-- web/                       # React: khách hàng + quản trị
|   `-- api/                       # Express REST API
|-- packages/
|   |-- contracts/src/
|   |-- validation/src/
|   `-- config/src/
|-- docs/
|   |-- architecture/
|   |-- api/
|   |-- database/
|   |-- data/
|   |-- decisions/
|   |-- design/
|   |-- legal/
|   |-- product/
|   |-- payments/
|   |-- deployment/
|   `-- workflows/
|-- .github/
|-- compose.yaml                   # PostgreSQL cục bộ tại cổng 5433
|-- compose.production.yaml        # API + PostgreSQL + HTTPS trên Oracle
|-- deploy/oracle/                 # cấu hình Caddy và mẫu biến môi trường
|-- AGENTS.md
|-- CONTRIBUTING.md
`-- package.json
```

Đọc thêm:

- [Tầm nhìn sản phẩm](docs/product/vision.md)
- [Định hướng trải nghiệm và giao diện](docs/design/direction.md)
- [Nền tảng câu chuyện thương hiệu](docs/content/brand-story.md)
- [Rà soát nguồn công thức](docs/content/recipe-source-review.md)
- [Danh mục mã nguồn giao diện tham khảo](docs/design/reference-catalog.md)
- [Tổng quan kiến trúc](docs/architecture/overview.md)
- [Xác thực và phân quyền](docs/architecture/authentication.md)
- [Triển khai](docs/architecture/deployment.md)
- [Triển khai Oracle Cloud](docs/deployment/oracle-cloud.md)
- [Mở API cục bộ bằng ngrok](docs/deployment/local-ngrok.md)
- [Nguồn và quy tắc nhập công thức](docs/data/recipe-import.md)
- [Tích hợp ZaloPay Sandbox](docs/payments/zalopay.md)
- [Quy ước API](docs/api/conventions.md)
- [Quy tắc sử dụng mã nguồn bên thứ ba](docs/legal/source-policy.md)
- [Quy trình Git](docs/workflows/git-workflow.md)
- [Điều kiện hoàn thành](docs/workflows/definition-of-done.md)

## Nguồn thông tin chính thức

| Nội dung | Nơi lưu |
| --- | --- |
| Cài đặt và chạy dự án | `README.md` |
| Tầm nhìn, phạm vi và quyết định sản phẩm đã chốt | `docs/product/vision.md` |
| Kiến trúc hệ thống | `docs/architecture/` |
| Hợp đồng API | `docs/api/openapi.yaml` và `packages/contracts` |
| Lược đồ cơ sở dữ liệu | migration Prisma và `docs/database/schema.md` |
| Quyết định kỹ thuật | `docs/decisions/` |
| Công việc đang làm | GitHub Issues/Project |
| Biến môi trường cần có | các tệp `.env.example` |

Một thay đổi về hành vi, API hoặc kiến trúc phải cập nhật nguồn thông tin tương ứng trong cùng pull request.

## Nguyên tắc tổ chức mã nguồn

- Chia mã theo miền nghiệp vụ.
- Giao diện khách hàng và quản trị dùng layout/route riêng nhưng cùng thuộc `apps/web`.
- Backend tổ chức theo module như auth, recipes, products, carts, orders và payments.
- Chỉ đưa mã vào `shared` hoặc `packages` khi thực sự được dùng ở nhiều nơi.
- Không import sâu vào phần nội bộ của module khác; mỗi module cung cấp điểm truy cập công khai qua `index.ts`.
- Thay đổi API phải cập nhật đồng thời mã nguồn, OpenAPI, kiểu dùng chung, kiểm thử và tài liệu liên quan.

## Thiết kế và tái sử dụng mã nguồn

Không tạo toàn bộ giao diện chỉ từ một mô tả chung. Trước khi xây giao diện mới, cần khảo sát mã nguồn tham khảo có giấy phép phù hợp, ghi nhận nguồn, rồi chọn lọc và biến đổi cho đúng sản phẩm. Không sao chép nguyên giao diện, hình ảnh, nội dung hoặc nhận diện của dự án khác.

Hallmark được cài tại `.agents/skills/hallmark` để hỗ trợ tránh bố cục AI rập khuôn. Quy tắc dành cho tác nhân AI nằm trong `AGENTS.md`; quy tắc pháp lý nằm trong `docs/legal/source-policy.md`.

## Bắt đầu

Yêu cầu Node.js `^20.19.0 || >=22.12.0`.

```bash
npm ci
npm run db:start
npm run db:migrate
npm run db:seed
npm run check
npm run build
```

Chạy môi trường phát triển bằng hai terminal:

```bash
npm run dev:api
npm run dev:web
```

- Web: `http://localhost:5173`
- API health check: `http://localhost:3000/api/health`
- PostgreSQL cục bộ: `localhost:5433`

Để ZaloPay Sandbox gọi được API cục bộ, làm theo [hướng dẫn ngrok](docs/deployment/local-ngrok.md). Không mở cổng PostgreSQL ra Internet.

## Quyết định còn mở

- Nhà cung cấp và chính sách lưu ảnh/tệp.
- Vận chuyển và quy trình hoàn tiền ZaloPay.
- Chiến lược biên tập và bản quyền nội dung.

Không âm thầm chọn mặc định cho các vấn đề trên. Khi cần triển khai phần phụ thuộc, phải ghi quyết định vào tài liệu hoặc ADR trước.

## Giấy phép

Mã nguồn của dự án được phát hành theo [MIT License](LICENSE).
