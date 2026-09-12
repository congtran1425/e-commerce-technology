import { describe, expect, it, vi } from 'vitest';
import { requireRole } from './auth.middleware.js';

function createResponse(user?: { role: 'CUSTOMER' | 'ADMIN' }) {
  return { locals: user ? { authUser: { ...user } } : {} };
}

describe('requireRole', () => {
  it('cho phép tài khoản quản trị đi tiếp', () => {
    const next = vi.fn();
    requireRole('ADMIN')({} as never, createResponse({ role: 'ADMIN' }) as never, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('từ chối tài khoản khách bằng lỗi 403', () => {
    const next = vi.fn();
    requireRole('ADMIN')({} as never, createResponse({ role: 'CUSTOMER' }) as never, next);
    expect(next.mock.calls[0]?.[0]).toMatchObject({ status: 403, code: 'FORBIDDEN' });
  });

  it('không coi người chưa xác thực là quản trị', () => {
    const next = vi.fn();
    requireRole('ADMIN')({} as never, createResponse() as never, next);
    expect(next.mock.calls[0]?.[0]).toMatchObject({ status: 401, code: 'AUTHENTICATION_REQUIRED' });
  });
});
