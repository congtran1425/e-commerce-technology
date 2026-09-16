import type { OrderStatus, PaymentStatus } from '../checkout/types';

export const accountOrderStatusLabels: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PAYMENT_REVIEW: 'Cần đối chiếu',
  PREPARING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

export const accountPaymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Đang chờ',
  SUCCEEDED: 'Đã thanh toán',
  FAILED: 'Không thành công',
  EXPIRED: 'Đã hết hạn',
  CANCELLED: 'Đã hủy',
  REFUND_PENDING: 'Chờ hoàn tiền',
  REFUNDED: 'Đã hoàn tiền',
};

export const accountMoney = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export const accountDate = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function firstName(displayName: string) {
  return displayName.trim().split(/\s+/).at(-1) || displayName;
}
