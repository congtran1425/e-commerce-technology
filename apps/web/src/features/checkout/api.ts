import type { CheckoutOrder, CreateOrderInput } from './types';
import { apiFetch } from '../../shared/api-client';

type ApiResponse<T> = { data: T };

export class CheckoutApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'CheckoutApiError';
  }
}

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as
    | { error?: { code?: string; message?: string } }
    | null;
  return new CheckoutApiError(
    response.status,
    body?.error?.code ?? 'CHECKOUT_REQUEST_FAILED',
    body?.error?.message ?? 'Chưa thể xử lý yêu cầu thanh toán.',
  );
}

export async function createOrder(input: CreateOrderInput) {
  const response = await apiFetch('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await readError(response);
  return (await response.json() as ApiResponse<CheckoutOrder>).data;
}

export async function getOrder(orderNumber: string, signal?: AbortSignal) {
  const response = await apiFetch(`/orders/${encodeURIComponent(orderNumber)}`, {
    signal,
  });
  if (!response.ok) throw await readError(response);
  return (await response.json() as ApiResponse<CheckoutOrder>).data;
}

export async function syncOrderPayment(orderNumber: string, signal?: AbortSignal) {
  const response = await apiFetch(
    `/orders/${encodeURIComponent(orderNumber)}/payment-status`,
    { method: 'POST', signal },
  );
  if (!response.ok) throw await readError(response);
  return (await response.json() as ApiResponse<CheckoutOrder>).data;
}
