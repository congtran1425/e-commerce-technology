import { describe, expect, it } from 'vitest';
import { createAccountToken, hashAccountToken, isAccountToken } from './account-token.js';

describe('account token', () => {
  it('tạo mã ngẫu nhiên 32 byte và chỉ lưu bản băm', () => {
    const one = createAccountToken();
    const two = createAccountToken();
    expect(one).not.toBe(two);
    expect(isAccountToken(one)).toBe(true);
    expect(hashAccountToken(one)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashAccountToken(one)).not.toContain(one);
  });

  it('từ chối chuỗi sai định dạng', () => {
    expect(isAccountToken('abc')).toBe(false);
    expect(isAccountToken(createAccountToken() + '/')).toBe(false);
  });
});
