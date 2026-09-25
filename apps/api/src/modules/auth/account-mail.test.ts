import { describe, expect, it } from 'vitest';
import { buildAccountLink } from './account-mail.js';

describe('account mail links', () => {
  it('giữ mã trong fragment, không đưa vào query gửi tới máy chủ FE', () => {
    const token = 'A'.repeat(43);
    const link = new URL(buildAccountLink('https://bepdubanh.example/', 'verify', token));
    expect(link.pathname).toBe('/xac-minh-email');
    expect(link.search).toBe('');
    expect(link.hash).toBe(`#token=${token}`);
  });

  it('trỏ liên kết đặt lại mật khẩu tới đúng trang', () => {
    expect(new URL(buildAccountLink('http://localhost:5173', 'reset', 'B'.repeat(43))).pathname)
      .toBe('/dat-lai-mat-khau');
  });
});
