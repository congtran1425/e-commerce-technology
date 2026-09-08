# Sử dụng monorepo với npm workspaces

Status: Accepted
Date: 2026-08-20

## Context

Dự án có React frontend, Express backend và hợp đồng API dùng chung. Một repository duy nhất giúp thay đổi xuyên suốt frontend, backend, contract và tài liệu theo cùng một lịch sử.

## Decision

Sử dụng một repository với các ứng dụng trong `apps/*`, package dùng chung trong `packages/*` và npm workspaces ở root.

## Consequences

- FE, BE, contract và tài liệu có thể thay đổi nguyên tử trong cùng PR.
- Một lockfile và các lệnh root giúp CI nhất quán.
- Cần giữ ranh giới package rõ ràng để tránh phụ thuộc vòng.
- CI và deploy phải lọc đúng workspace khi dự án phát triển.
