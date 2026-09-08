import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('password', () => {
  it('băm mật khẩu bằng Argon2id và kiểm tra đúng mật khẩu', async () => {
    const passwordHash = await hashPassword('mot-mat-khau-du-dai');

    expect(passwordHash).toMatch(/^\$argon2id\$/);
    await expect(verifyPassword(passwordHash, 'mot-mat-khau-du-dai')).resolves.toBe(true);
    await expect(verifyPassword(passwordHash, 'mat-khau-khac')).resolves.toBe(false);
  });

  it('tạo muối ngẫu nhiên cho mỗi lần băm', async () => {
    const [firstHash, secondHash] = await Promise.all([
      hashPassword('mot-mat-khau-du-dai'),
      hashPassword('mot-mat-khau-du-dai'),
    ]);

    expect(firstHash).not.toBe(secondHash);
  });
});
