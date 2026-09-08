import { describe, expect, it } from 'vitest';
import { buildCartQuote, type QuoteVariant } from './cart-quote.js';

const variants: QuoteVariant[] = [
  {
    id: '1',
    productName: 'Kem phô mai',
    label: 'Hộp 200 g',
    price: '85000.00',
    currency: 'VND',
    stockQuantity: 5,
  },
  {
    id: '2',
    productName: 'Khuôn đế rời',
    label: 'Khuôn 18 cm',
    price: '120000.00',
    currency: 'VND',
    stockQuantity: 1,
  },
];

describe('buildCartQuote', () => {
  it('dùng giá hiện tại từ máy chủ và tính tổng bằng số nguyên tiền tệ', () => {
    const quote = buildCartQuote([{ variantId: '1', quantity: 2 }], variants);

    expect(quote).toMatchObject({
      subtotal: '170000.00',
      currency: 'VND',
      canCheckout: true,
      items: [{ status: 'AVAILABLE', unitPrice: '85000.00', lineTotal: '170000.00' }],
    });
  });

  it('không cho chuyển sang thanh toán khi số lượng yêu cầu vượt tồn kho', () => {
    const quote = buildCartQuote([{ variantId: '2', quantity: 2 }], variants);

    expect(quote.canCheckout).toBe(false);
    expect(quote.items[0]).toMatchObject({
      status: 'INSUFFICIENT_STOCK',
      availableQuantity: 1,
      lineTotal: '240000.00',
    });
  });

  it('đánh dấu biến thể không còn bán hoặc không tồn tại là không sẵn sàng', () => {
    const quote = buildCartQuote([{ variantId: '99', quantity: 1 }], variants);

    expect(quote).toMatchObject({
      subtotal: '0.00',
      canCheckout: false,
      items: [{ variantId: '99', status: 'UNAVAILABLE', unitPrice: null }],
    });
  });
});
