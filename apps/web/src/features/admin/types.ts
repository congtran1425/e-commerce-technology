export type ProductKind = 'INGREDIENT' | 'TOOL';
export type MeasurementUnit = 'GRAM' | 'MILLILITER' | 'PIECE';
export type InventoryReason = 'RESTOCK' | 'CORRECTION' | 'DAMAGED' | 'RETURNED' | 'INITIAL_STOCK' | 'ORDER_RESERVED' | 'ORDER_RELEASED';
export type OrderStatus = 'AWAITING_PAYMENT' | 'CONFIRMED' | 'PAYMENT_REVIEW' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED';

export type AdminVariant = {
  id: string;
  sku: string;
  label: string;
  unit: MeasurementUnit;
  packageQuantity: string;
  price: string;
  currency: string;
  stockQuantity: number;
  active: boolean;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  kind: ProductKind;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  stockQuantity: number;
  variants: AdminVariant[];
};

export type InventoryMovement = {
  id: string;
  quantityDelta: number;
  stockBefore: number;
  stockAfter: number;
  reason: InventoryReason;
  note: string | null;
  createdAt: string;
  actorName: string | null;
  orderNumber: string | null;
};

export type VariantInput = {
  sku: string;
  label: string;
  unit: MeasurementUnit;
  packageQuantity: number;
  price: number;
  stockQuantity: number;
  active?: boolean;
};

export type ProductInput = {
  name: string;
  description: string;
  kind: ProductKind;
  imageUrl?: string | null;
  active?: boolean;
  variants: VariantInput[];
};

export type AdminOrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  subtotal: string;
  shippingFee: string;
  total: string;
  recipientName: string;
  recipientPhone: string;
  province: string;
  itemCount: number;
  customer: { displayName: string; email: string };
  latestPayment: { status: PaymentStatus; amount: string; paidAt: string | null } | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminPayment = {
  id: string;
  provider: 'ZALOPAY';
  status: PaymentStatus;
  amount: string;
  merchantTransactionId: string;
  providerTransactionId: string | null;
  returnCode: number | null;
  returnMessage: string | null;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: { orderNumber: string; recipientName: string };
};

export type AdminOrderDetail = AdminOrderSummary & {
  address: { addressLine: string; ward: string | null; district: string; province: string };
  note: string | null;
  items: Array<{ id: string; productName: string; sku: string; variantLabel: string; quantity: number; unitPrice: string; lineTotal: string }>;
  payments: AdminPayment[];
};

export type AdminOverview = {
  ordersByStatus: Partial<Record<OrderStatus, number>>;
  collectedRevenue: { allTime: string; allTimePaymentCount: number; lastSevenDays: string; lastSevenDaysPaymentCount: number };
  inventory: { outOfStockCount: number; lowStockCount: number; lowStockThreshold: number };
  recentOrders: AdminOrderSummary[];
};

export type AdminInventoryOverview = {
  lowStockThreshold: number;
  attentionVariants: Array<{
    id: string;
    sku: string;
    label: string;
    stockQuantity: number;
    product: { id: string; name: string; kind: ProductKind };
  }>;
  recentMovements: Array<InventoryMovement & {
    variant: { sku: string; label: string; product: { name: string } };
  }>;
};
