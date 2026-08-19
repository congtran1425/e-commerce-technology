# Sử dụng TypeScript, React/Vite và Express 5

Status: Accepted
Date: 2026-08-20

## Context

Frontend và backend cần được khởi tạo để nhóm có một môi trường phát triển thống nhất. Dự án cũng chia sẻ API contract giữa hai phía.

## Decision

- Dùng TypeScript cho cả frontend và backend.
- Dùng React 19 với Vite 8 và React Router 7 cho `apps/web`.
- Dùng Express 5 cho `apps/api`.
- Dùng `tsx` để chạy API trong development và `tsc` để build production.
- Yêu cầu Node.js `^20.19.0 || >=22.12.0`, phù hợp yêu cầu runtime của Vite 8.

Phiên bản chính xác được khóa trong `package-lock.json`; thành viên phải dùng `npm ci` thay vì tự chọn lại phiên bản.

## Consequences

- FE và BE có kiểm tra kiểu thống nhất và có thể tái sử dụng contract.
- Nhóm chỉ cần cài dependency một lần tại root nhờ npm workspaces.
- Vite và Express được triển khai độc lập.
- Việc nâng major version cần PR riêng, chạy đầy đủ check/build và cập nhật ADR nếu có ảnh hưởng kiến trúc.
