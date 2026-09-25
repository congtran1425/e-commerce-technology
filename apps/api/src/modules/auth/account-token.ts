import { createHash, randomBytes } from 'node:crypto';

export function createAccountToken() {
  return randomBytes(32).toString('base64url');
}

export function hashAccountToken(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function isAccountToken(token: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}
