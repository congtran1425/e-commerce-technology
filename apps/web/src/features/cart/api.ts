import type { CartItem } from './cart-storage';
import type { CartQuote } from './types';
import { apiFetch } from '../../shared/api-client';

type ApiResponse<T> = { data: T };

export class CartApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'CartApiError';
  }
}

export async function quoteCart(items: CartItem[], signal?: AbortSignal) {
  const response = await apiFetch('/cart/quote', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new CartApiError(
      response.status,
      body?.error?.message ?? 'Chưa thể kiểm tra lại giỏ hàng.',
    );
  }

  return (await response.json() as ApiResponse<CartQuote>).data;
}
