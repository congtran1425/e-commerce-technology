import type { InventoryReason, OrderStatus, PaymentStatus } from './types';

export const orderStatusLabels: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PAYMENT_REVIEW: 'Cần đối soát',
  PREPARING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Đang chờ',
  SUCCEEDED: 'Thành công',
  FAILED: 'Thất bại',
  EXPIRED: 'Hết hạn',
  CANCELLED: 'Đã hủy',
  REFUND_PENDING: 'Chờ hoàn tiền',
  REFUNDED: 'Đã hoàn tiền',
};

export const inventoryReasonLabels: Record<InventoryReason, string> = {
  INITIAL_STOCK: 'Tồn ban đầu',
  RESTOCK: 'Nhập thêm',
  CORRECTION: 'Kiểm kê',
  DAMAGED: 'Hư hỏng/hao hụt',
  RETURNED: 'Hàng hoàn',
  ORDER_RESERVED: 'Giữ cho đơn hàng',
  ORDER_RELEASED: 'Trả lại từ đơn',
};

export const nextOrderStatus: Partial<Record<OrderStatus, { status: 'CONFIRMED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED'; label: string }>> = {
  PAYMENT_REVIEW: { status: 'CONFIRMED', label: 'Xác nhận đã đối soát' },
  CONFIRMED: { status: 'PREPARING', label: 'Bắt đầu chuẩn bị' },
  PREPARING: { status: 'SHIPPING', label: 'Bàn giao vận chuyển' },
  SHIPPING: { status: 'DELIVERED', label: 'Xác nhận đã giao' },
};

export function formatAdminMoney(value: string, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value));
}

export function formatAdminDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
