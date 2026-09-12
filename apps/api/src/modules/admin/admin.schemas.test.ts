import { describe, expect, it } from 'vitest';
import { adjustInventorySchema, createProductSchema } from './admin.schemas.js';

describe('admin schemas', () => {
  it('chuẩn hóa SKU trước khi tạo sản phẩm', () => {
    const result = createProductSchema.parse({
      name: 'Bột mì số 8',
      description: 'Bột dùng cho bánh mềm.',
      kind: 'INGREDIENT',
      variants: [{ sku: ' flour-08 ', label: 'Túi 500 g', unit: 'GRAM', packageQuantity: 500, price: 25_000, stockQuantity: 12 }],
    });
    expect(result.variants[0]?.sku).toBe('FLOUR-08');
  });

  it('không cho lý do hư hỏng làm tăng tồn kho', () => {
    const result = adjustInventorySchema.safeParse({ quantityDelta: 3, reason: 'DAMAGED' });
    expect(result.success).toBe(false);
  });

  it('cho phép kiểm kê tăng hoặc giảm tồn kho', () => {
    expect(adjustInventorySchema.safeParse({ quantityDelta: -2, reason: 'CORRECTION', note: 'Kiểm đếm lại.' }).success).toBe(true);
  });
});
