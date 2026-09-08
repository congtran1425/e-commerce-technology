import { describe, expect, it } from 'vitest';
import { createSessionToken, hashSessionToken, isSessionToken } from './session-token.js';

describe('session token', () => {
  it('tạo mã phiên đủ entropy và chỉ lưu bản băm có độ dài cố định', () => {
    const firstToken = createSessionToken();
    const secondToken = createSessionToken();
    const tokenHash = hashSessionToken(firstToken);

    expect(isSessionToken(firstToken)).toBe(true);
    expect(firstToken).not.toBe(secondToken);
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(tokenHash).not.toContain(firstToken);
  });

  it('từ chối mã phiên sai định dạng', () => {
    expect(isSessionToken('khong-hop-le')).toBe(false);
  });
});
