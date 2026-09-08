export type OrderStatus =
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'PAYMENT_REVIEW'
  | 'PREPARING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type CheckoutOrder = {
  orderNumber: string;
  status: OrderStatus;
  currency: 'VND';
  subtotal: string;
  shippingFee: string;
  total: string;
  recipient: {
    name: string;
    phone: string;
    addressLine: string;
    ward: string | null;
    district: string;
    province: string;
  };
  note: string | null;
  items: Array<{
    id: string;
    variantId: string | null;
    productName: string;
    sku: string;
    variantLabel: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }>;
  payment: {
    provider: 'ZALOPAY';
    status: PaymentStatus;
    checkoutUrl: string | null;
    expiresAt: string;
    paidAt: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  idempotencyKey: string;
  recipient: {
    name: string;
    phone: string;
    addressLine: string;
    ward?: string;
    district: string;
    province: string;
  };
  note?: string;
  items: Array<{ variantId: string; quantity: number }>;
};
