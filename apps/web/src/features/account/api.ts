import { apiFetch } from '../../shared/api-client';
import type { OrderStatus } from '../checkout/types';
import type {
  AccountAddress,
  AccountAddressInput,
  AccountAddressUpdateInput,
  AccountOrderPage,
  AccountOverview,
  AccountProfile,
  AccountProfileInput,
} from './types';

type ApiResponse<T> = { data: T };

export class AccountApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = 'AccountApiError';
  }
}

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as
    | { error?: { code?: string; message?: string } }
    | null;
  return new AccountApiError(
    response.status,
    body?.error?.code ?? 'ACCOUNT_REQUEST_FAILED',
    body?.error?.message ?? 'Chưa thể xử lý yêu cầu tài khoản.',
  );
}

async function readData<T>(response: Response) {
  if (!response.ok) throw await readError(response);
  return (await response.json() as ApiResponse<T>).data;
}

export async function fetchAccountOverview(signal?: AbortSignal) {
  return readData<AccountOverview>(await apiFetch('/account/overview', { signal }));
}

export async function updateAccountProfile(input: AccountProfileInput) {
  return readData<AccountProfile>(await apiFetch('/account/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }));
}

export async function fetchAccountOrders(input: {
  cursor?: string;
  status?: OrderStatus;
  limit?: number;
  signal?: AbortSignal;
} = {}) {
  const query = new URLSearchParams();
  if (input.cursor) query.set('cursor', input.cursor);
  if (input.status) query.set('status', input.status);
  if (input.limit) query.set('limit', String(input.limit));
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return readData<AccountOrderPage>(await apiFetch(`/account/orders${suffix}`, { signal: input.signal }));
}

export async function fetchAccountAddresses(signal?: AbortSignal) {
  return readData<AccountAddress[]>(await apiFetch('/account/addresses', { signal }));
}

export async function createAccountAddress(input: AccountAddressInput) {
  return readData<AccountAddress>(await apiFetch('/account/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }));
}

export async function updateAccountAddress(addressId: string, input: AccountAddressUpdateInput) {
  return readData<AccountAddress>(await apiFetch(`/account/addresses/${encodeURIComponent(addressId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }));
}

export async function deleteAccountAddress(addressId: string) {
  const response = await apiFetch(`/account/addresses/${encodeURIComponent(addressId)}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw await readError(response);
}
