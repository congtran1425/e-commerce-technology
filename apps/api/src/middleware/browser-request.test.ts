import { describe, expect, it } from 'vitest';
import { isBrowserRequestAllowed } from './browser-request.js';

const allowedOrigins = ['https://bepdubanh.congtc145.id.vn'];

describe('isBrowserRequestAllowed', () => {
  it('cho phép đọc công thức mà không cần header', () => {
    expect(isBrowserRequestAllowed({ method: 'GET', path: '/api/recipes', allowedOrigins })).toBe(true);
  });

  it('từ chối biểu mẫu giả mạo và nguồn không nằm trong danh sách', () => {
    expect(isBrowserRequestAllowed({ method: 'POST', path: '/api/orders', allowedOrigins })).toBe(false);
    expect(isBrowserRequestAllowed({ method: 'POST', path: '/api/orders', clientHeader: '1', origin: 'https://evil.example', allowedOrigins })).toBe(false);
  });

  it('cho phép web đã cấu hình gửi yêu cầu thay đổi dữ liệu', () => {
    expect(isBrowserRequestAllowed({ method: 'POST', path: '/api/auth/login', clientHeader: '1', origin: allowedOrigins[0], allowedOrigins })).toBe(true);
  });

  it('để callback ZaloPay đi qua lớp kiểm tra chữ ký riêng', () => {
    expect(isBrowserRequestAllowed({ method: 'POST', path: '/api/payments/zalopay/callback', allowedOrigins })).toBe(true);
    expect(isBrowserRequestAllowed({ method: 'POST', path: '/api/payments/zalopay/other', allowedOrigins })).toBe(false);
  });
});
