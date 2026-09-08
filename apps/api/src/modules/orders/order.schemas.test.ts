import { describe, expect, it } from 'vitest';
import { createOrderRequestSchema, orderParamsSchema } from './order.schemas.js';

const validRequest = {
  idempotencyKey: 'c32a67f1-d58c-4f25-b16b-f0e6db2910ec',
  recipient: {
    name: 'Nguyễn An',
    phone: '090 123 4567',
    addressLine: '12 Đường Hoa',
    ward: 'Phường 1',
    district: 'Quận 3',
    province: 'Thành phố Hồ Chí Minh',
  },
  note: '',
  items: [{ variantId: '1', quantity: 2 }],
};

describe('createOrderRequestSchema', () => {
  it('chuẩn hóa số điện thoại và nội dung tùy chọn', () => {
    const parsed = createOrderRequestSchema.parse(validRequest);
    expect(parsed.recipient.phone).toBe('0901234567');
    expect(parsed.note).toBeUndefined();
  });

  it('từ chối biến thể trùng nhau', () => {
    const result = createOrderRequestSchema.safeParse({
      ...validRequest,
      items: [validRequest.items[0], validRequest.items[0]],
    });
    expect(result.success).toBe(false);
  });

  it('kiểm tra định dạng mã đơn công khai', () => {
    expect(orderParamsSchema.safeParse({ orderNumber: 'EC260906A1B2C3D4' }).success).toBe(true);
    expect(orderParamsSchema.safeParse({ orderNumber: '../1' }).success).toBe(false);
  });
});
