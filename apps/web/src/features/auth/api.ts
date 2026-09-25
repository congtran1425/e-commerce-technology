import type { AuthUser, LoginInput, RegisterInput } from './types';
import { apiFetch } from '../../shared/api-client';

type AuthResponse = { data: { user: AuthUser } };

export class AuthApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as
    | { error?: { code?: string; message?: string } }
    | null;

  return new AuthApiError(
    response.status,
    body?.error?.code ?? 'AUTH_REQUEST_FAILED',
    body?.error?.message ?? 'Chưa thể xử lý yêu cầu tài khoản.',
  );
}

async function sendCredentials(path: string, body: LoginInput | RegisterInput) {
  const response = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw await readError(response);
  return (await response.json() as AuthResponse).data.user;
}

export function login(input: LoginInput) {
  return sendCredentials('/auth/login', input);
}

export function register(input: RegisterInput) {
  return sendAccountAction('/auth/register', input);
}

async function sendAccountAction(path: string, body: object) {
  const response = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await readError(response);
}

export function resendVerification(email: string) {
  return sendAccountAction('/auth/resend-verification', { email });
}

export function forgotPassword(email: string) {
  return sendAccountAction('/auth/forgot-password', { email });
}

export function verifyEmail(token: string) {
  return sendAccountAction('/auth/verify-email', { token });
}

export function resetPassword(token: string, password: string) {
  return sendAccountAction('/auth/reset-password', { token, password });
}

export async function getCurrentUser(signal?: AbortSignal) {
  const response = await apiFetch('/auth/me', {
    signal,
  });

  if (response.status === 401) return null;
  if (!response.ok) throw await readError(response);
  return (await response.json() as AuthResponse).data.user;
}

export async function logout() {
  const response = await apiFetch('/auth/logout', {
    method: 'POST',
  });

  if (!response.ok) throw await readError(response);
}
