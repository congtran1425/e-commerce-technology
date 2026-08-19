# E-commerce Technology

Monorepo cho đồ án cuối kỳ môn E-commerce Technology, được phát triển bởi nhóm 5 thành viên.

Hệ thống dự kiến gồm:

- `apps/web`: React frontend dành cho khách hàng và quản trị viên.
- `apps/api`: Express REST API, chịu trách nhiệm xác thực, phân quyền và nghiệp vụ.
- `packages/contracts`: kiểu dữ liệu và API contract dùng chung.
- `packages/validation`: nơi dành cho schema validation dùng chung khi có nhu cầu.
- `packages/config`: cấu hình dùng chung như TypeScript hoặc ESLint khi có nhu cầu.

## Kiến trúc triển khai dự kiến

```text
Browser
   |
   v
React trên Vercel
   | HTTPS API
   v
Express API trên dịch vụ backend
   |
   v
Database
```

Frontend có hai vùng giao diện trong cùng một ứng dụng:

```text
/*          -> khách hàng
/admin/*    -> quản trị viên
```

Khi có domain riêng, dự kiến dùng một domain gốc và subdomain:

```text
example.com       -> frontend
api.example.com   -> backend
```

Backend luôn là nơi kiểm tra quyền thực sự. Việc ẩn nút hoặc bảo vệ route ở React không thay thế cho xác thực và phân quyền trên API.

## Cấu trúc repository

```text
.
|-- apps/
|   |-- web/                       # React customer + admin
|   |   |-- public/
|   |   |-- src/
|   |   |   |-- app/
|   |   |   |-- features/
|   |   |   |-- layouts/
|   |   |   |-- pages/
|   |   |   `-- shared/
|   |   `-- tests/
|   `-- api/                       # Express REST API
|       |-- src/
|       |   |-- app/
|       |   |-- config/
|       |   |-- modules/
|       |   |-- middleware/
|       |   `-- shared/
|       `-- tests/
|-- packages/
|   |-- contracts/src/
|   |-- validation/src/
|   `-- config/src/
|-- docs/
|   |-- architecture/
|   |-- api/
|   |-- database/
|   |-- decisions/
|   `-- workflows/
|-- .github/
|   |-- ISSUE_TEMPLATE/
|   `-- workflows/
|-- CONTRIBUTING.md
`-- package.json
```

Đọc thêm:

- [Tổng quan kiến trúc](docs/architecture/overview.md)
- [Xác thực và phân quyền](docs/architecture/authentication.md)
- [Triển khai](docs/architecture/deployment.md)
- [Quy ước API](docs/api/conventions.md)
- [Quy trình Git](docs/workflows/git-workflow.md)
- [Definition of Done](docs/workflows/definition-of-done.md)
- [Hướng dẫn đóng góp](CONTRIBUTING.md)

## Nguồn sự thật của dự án

Mỗi loại thông tin chỉ nên có một nơi chính thức:

| Nội dung | Nơi lưu |
| --- | --- |
| Cách cài đặt và chạy dự án | `README.md` |
| Quy trình đóng góp | `CONTRIBUTING.md` |
| Kiến trúc hệ thống | `docs/architecture/` |
| API contract | `docs/api/openapi.yaml` và `packages/contracts` |
| Database schema | migration của ORM và `docs/database/schema.md` |
| Quyết định kỹ thuật | `docs/decisions/` |
| Công việc và người thực hiện | GitHub Issues/Project |
| Người review theo phạm vi | `.github/CODEOWNERS` |
| Biến môi trường cần có | các file `.env.example` |

Không dùng tin nhắn nhóm hoặc nội dung truyền miệng làm đặc tả cuối cùng. Khi một quyết định thay đổi, cập nhật nguồn sự thật tương ứng trong cùng pull request.

## Nguyên tắc tổ chức code

- Chia code theo module nghiệp vụ, không chia theo tên thành viên.
- Customer và admin dùng layout/route riêng nhưng cùng thuộc `apps/web`.
- Backend tổ chức theo module như auth, products, carts và orders.
- Chỉ đưa mã vào `shared` hoặc `packages` sau khi nó thực sự được dùng chung.
- Không import xuyên sâu vào phần nội bộ của module khác; module nên cung cấp public API qua `index.ts`.
- Một pull request thay đổi API phải cập nhật code, contract, OpenAPI, test và tài liệu liên quan cùng lúc.

## Project skill

Repository cài Hallmark ở `.agents/skills/hallmark`. Đây là skill thiết kế giao diện giúp agent tránh các bố cục và phong cách AI rập khuôn khi xây mới, audit hoặc redesign frontend.

Skill được khóa nguồn trong `skills-lock.json` và thuộc phạm vi repository để các thành viên dùng chung. Sau khi clone/pull, hãy khởi động một phiên Codex mới để skill được phát hiện. Có thể gọi rõ bằng `$hallmark` khi giao nhiệm vụ thiết kế; việc cài skill không tự thay đổi source hoặc giao diện hiện tại.

## Bắt đầu

Yêu cầu Node.js `^20.19.0 || >=22.12.0`. Cài dependency một lần tại thư mục gốc bằng lockfile đã commit:

```bash
npm ci
npm run check
npm run build
```

Chạy development bằng hai terminal:

```bash
npm run dev:api
npm run dev:web
```

- Web: `http://localhost:5173`
- API health check: `http://localhost:3000/api/health`

## Những quyết định còn mở

- Database và ORM.
- Cơ chế access token, refresh token hoặc session.
- Thư viện validation và test.
- Nhà cung cấp dịch vụ triển khai backend.
- Có tích hợp thanh toán thật hay chỉ mô phỏng.

Không tạo cấu trúc phụ thuộc vào các lựa chọn trên trước khi nhóm chấp thuận và ghi nhận bằng ADR.
