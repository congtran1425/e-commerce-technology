import { describe, expect, it } from 'vitest';
import {
  accountOrderListQuerySchema,
  createAddressRequestSchema,
  updateAddressRequestSchema,
  updateProfileRequestSchema,
} from './account.schemas.js';

const address = {
  label: 'Nhà',
  recipientName: 'Nguyễn An',
  phone: '090 123 4567',
  addressLine: '12 Đường Hoa',
  ward: '',
  district: 'Quận 3',
  province: 'Thành phố Hồ Chí Minh',
};

describe('account schemas', () => {
  it('chuẩn hóa số điện thoại và nội dung địa chỉ tùy chọn', () => {
    const parsed = createAddressRequestSchema.parse(address);
    expect(parsed.phone).toBe('0901234567');
    expect(parsed.ward).toBeUndefined();
    expect(parsed.isDefault).toBe(false);
  });

  it('không cho cập nhật rỗng hoặc gỡ cờ mặc định trực tiếp', () => {
    expect(updateProfileRequestSchema.safeParse({}).success).toBe(false);
    expect(updateAddressRequestSchema.safeParse({ isDefault: false }).success).toBe(false);
  });

  it('từ chối số điện thoại không đúng dạng Việt Nam', () => {
    expect(createAddressRequestSchema.safeParse({ ...address, phone: '12345' }).success).toBe(false);
    expect(updateProfileRequestSchema.safeParse({ phone: '+84 901.234-567' }).success).toBe(true);
    expect(updateProfileRequestSchema.parse({ phone: null }).phone).toBeNull();
  });

  it('giới hạn phân trang và kiểm tra con trỏ đơn hàng', () => {
    expect(accountOrderListQuerySchema.parse({ limit: '20', cursor: '15' })).toMatchObject({ limit: 20, cursor: '15' });
    expect(accountOrderListQuerySchema.safeParse({ limit: 21 }).success).toBe(false);
    expect(accountOrderListQuerySchema.safeParse({ cursor: '../1' }).success).toBe(false);
  });
});
