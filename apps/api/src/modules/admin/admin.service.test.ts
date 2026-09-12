import { describe, expect, it } from 'vitest';
import { canAdvanceAdminOrder } from './admin.service.js';

describe('admin order status transitions', () => {
  it('cho phép luồng hoàn tất đơn tiến về phía trước', () => {
    expect(canAdvanceAdminOrder('CONFIRMED', 'PREPARING')).toBe(true);
    expect(canAdvanceAdminOrder('PREPARING', 'SHIPPING')).toBe(true);
    expect(canAdvanceAdminOrder('SHIPPING', 'DELIVERED')).toBe(true);
  });

  it('cho phép quản trị viên xác nhận đơn cần đối soát', () => {
    expect(canAdvanceAdminOrder('PAYMENT_REVIEW', 'CONFIRMED')).toBe(true);
  });

  it('không cho bỏ bước hoặc lùi trạng thái', () => {
    expect(canAdvanceAdminOrder('CONFIRMED', 'SHIPPING')).toBe(false);
    expect(canAdvanceAdminOrder('SHIPPING', 'PREPARING')).toBe(false);
    expect(canAdvanceAdminOrder('DELIVERED', 'SHIPPING')).toBe(false);
  });
});
