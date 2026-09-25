import { describe, expect, it } from 'vitest';
import { loginLimitKey } from './auth.rate-limit.js';

describe('loginLimitKey', () => {
  it('coi email khác kiểu chữ và khoảng trắng là cùng một tài khoản', () => {
    expect(loginLimitKey({ body: { email: '  MINH@example.com ' } } as never))
      .toBe(loginLimitKey({ body: { email: 'minh@example.com' } } as never));
  });

  it('không để lộ email thô trong khóa giới hạn', () => {
    expect(loginLimitKey({ body: { email: 'minh@example.com' } } as never))
      .not.toContain('minh@example.com');
  });
});
