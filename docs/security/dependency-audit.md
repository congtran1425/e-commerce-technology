# Cảnh báo phụ thuộc Prisma (cập nhật 18-09-2026)

`npm.cmd audit --omit=dev` hiện báo **4 mục mức cao**, nhưng không phải bốn lỗ hổng độc lập: `deepmerge-ts < 8` và `mysql2 <= 3.23` là hai gói gốc; `@prisma/config` và `prisma` bị đánh dấu theo chuỗi phụ thuộc. `prisma@7.10.0` ghim `mysql2@3.15.3`; `@prisma/config@7.10.0` ghim `deepmerge-ts@7.1.5`. Dự án dùng PostgreSQL, không dùng MySQL, nhưng npm vẫn kiểm tra toàn bộ cây phụ thuộc.

Đã thử nâng trực tiếp bằng npm overrides và các lệnh cài/cập nhật lại; lockfile vẫn giữ phiên bản do Prisma ghim. `npm audit fix --force` đề xuất hạ Prisma xuống 6.19.3 — thay đổi major version có thể phá schema/client hiện tại, **không thực hiện**. Không chỉnh tay lockfile hoặc bỏ qua cảnh báo để hiện số 0 giả.

Giảm thiểu hiện tại: Dockerfile có stage `migrate` dùng Prisma CLI và stage `runtime` loại các gói CLI/`@prisma/config`/`deepmerge-ts`/`mysql2` trước khi chạy API. Ngày 18-09-2026 đã build image `ecomtech-production-api:latest` và kiểm tra bằng `require.resolve`: cả bốn gói đều **không có trong image runtime**. Điều này giảm bề mặt của tiến trình phục vụ web nhưng **không xóa** cảnh báo trong môi trường build/migrate hoặc ở cây phụ thuộc cục bộ. Việc không có gói trong image cũng không thay thế cho kiểm thử bảo mật toàn hệ thống.

Việc tiếp theo: theo dõi bản Prisma ổn định có nâng hai phụ thuộc; thử nâng trên nhánh riêng, chạy `prisma generate`, migrate trên DB thử nghiệm, toàn bộ test và build, sau đó audit lại. Không hạ phiên bản chỉ vì kết quả audit. Nguồn: [Prisma issue về deepmerge-ts](https://github.com/prisma/orm/issues/30052), [advisory deepmerge-ts](https://github.com/advisories/GHSA-ggr8-5vv4-36mx), [advisory mysql2](https://github.com/advisories/GHSA-3f6p-5ww8-9rcr).
