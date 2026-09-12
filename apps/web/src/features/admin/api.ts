import type {
  AdminInventoryOverview,
  AdminOrderDetail,
  AdminOrderSummary,
  AdminOverview,
  AdminPayment,
  AdminProduct,
  InventoryMovement,
  InventoryReason,
  OrderStatus,
  PaymentStatus,
  ProductInput,
  VariantInput,
} from './types';
import { apiFetch } from '../../shared/api-client';

type ApiResponse<T> = { data: T };

export class AdminApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = 'AdminApiError';
  }
}

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
  return new AdminApiError(
    response.status,
    body?.error?.code ?? 'ADMIN_REQUEST_FAILED',
    body?.error?.message ?? 'Máy chủ chưa thể xử lý tác vụ quản trị.',
  );
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await apiFetch(path, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
  });
  if (!response.ok) throw await readError(response);
  return (await response.json() as ApiResponse<T>).data;
}

export function fetchAdminProducts(input: { q?: string; status?: 'ALL' | 'ACTIVE' | 'INACTIVE'; cursor?: string; signal?: AbortSignal }) {
  const query = new URLSearchParams();
  if (input.q) query.set('q', input.q);
  if (input.status && input.status !== 'ALL') query.set('status', input.status);
  if (input.cursor) query.set('cursor', input.cursor);
  query.set('limit', '20');
  return request<{ items: AdminProduct[]; nextCursor: string | null }>(`/admin/products?${query}`, { signal: input.signal });
}

export function createAdminProduct(input: ProductInput) {
  return request<AdminProduct>('/admin/products', { method: 'POST', body: JSON.stringify(input) });
}

export function updateAdminProduct(productId: string, input: Partial<Pick<AdminProduct, 'name' | 'description' | 'imageUrl' | 'active'>>) {
  return request<AdminProduct>(`/admin/products/${encodeURIComponent(productId)}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function createAdminVariant(productId: string, input: VariantInput) {
  return request<AdminProduct>(`/admin/products/${encodeURIComponent(productId)}/variants`, { method: 'POST', body: JSON.stringify(input) });
}

export function updateAdminVariant(variantId: string, input: Partial<Pick<VariantInput, 'label' | 'unit' | 'packageQuantity' | 'price' | 'active'>>) {
  return request<AdminProduct>(`/admin/product-variants/${encodeURIComponent(variantId)}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function adjustInventory(variantId: string, input: { quantityDelta: number; reason: Extract<InventoryReason, 'RESTOCK' | 'CORRECTION' | 'DAMAGED' | 'RETURNED'>; note?: string }) {
  return request<{ variantId: string; stockQuantity: number; movement: InventoryMovement }>(
    `/admin/product-variants/${encodeURIComponent(variantId)}/inventory-adjustments`,
    { method: 'POST', body: JSON.stringify(input) },
  );
}

export function fetchInventoryMovements(variantId: string, signal?: AbortSignal) {
  return request<InventoryMovement[]>(`/admin/product-variants/${encodeURIComponent(variantId)}/inventory-movements?limit=20`, { signal });
}

function paginatedQuery(input: { q?: string; status?: string; cursor?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (input.q) query.set('q', input.q);
  if (input.status && input.status !== 'ALL') query.set('status', input.status);
  if (input.cursor) query.set('cursor', input.cursor);
  query.set('limit', String(input.limit ?? 20));
  return query;
}

export function fetchAdminOverview(signal?: AbortSignal) {
  return request<AdminOverview>('/admin/overview', { signal });
}

export function fetchAdminOrders(input: { q?: string; status?: OrderStatus | 'ALL'; cursor?: string; limit?: number; signal?: AbortSignal }) {
  return request<{ items: AdminOrderSummary[]; nextCursor: string | null }>(`/admin/orders?${paginatedQuery(input)}`, { signal: input.signal });
}

export function fetchAdminOrder(orderNumber: string, signal?: AbortSignal) {
  return request<AdminOrderDetail>(`/admin/orders/${encodeURIComponent(orderNumber)}`, { signal });
}

export function updateAdminOrderStatus(orderNumber: string, status: Extract<OrderStatus, 'CONFIRMED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED'>) {
  return request<AdminOrderSummary>(`/admin/orders/${encodeURIComponent(orderNumber)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function fetchAdminPayments(input: { q?: string; status?: PaymentStatus | 'ALL'; cursor?: string; limit?: number; signal?: AbortSignal }) {
  return request<{ items: AdminPayment[]; nextCursor: string | null }>(`/admin/payments?${paginatedQuery(input)}`, { signal: input.signal });
}

export function fetchAdminInventoryOverview(signal?: AbortSignal) {
  return request<AdminInventoryOverview>('/admin/inventory?limit=20', { signal });
}
