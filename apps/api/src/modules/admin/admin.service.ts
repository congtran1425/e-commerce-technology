import { AppError } from '../../shared/app-error.js';
import type { OrderStatus } from '../../generated/prisma/enums.js';
import type { AuthUser } from '../auth/auth.service.js';
import type {
  AdjustInventoryInput,
  AdminOrderListQuery,
  AdminPaymentListQuery,
  AdminProductListQuery,
  CreateProductInput,
  CreateVariantInput,
  UpdateProductInput,
  UpdateVariantInput,
  UpdateOrderStatusInput,
} from './admin.schemas.js';
import {
  adjustVariantInventory,
  createProductWithVariants,
  createVariant,
  findAdminProducts,
  findInventoryHistory,
  findAdminInventoryOverview,
  findAdminOrderByNumber,
  findAdminOrders,
  findAdminOverview,
  findAdminPayments,
  findProductById,
  findProductBySlug,
  findVariantWithProduct,
  updateProduct,
  updateAdminOrderStatus,
  updateVariant,
} from './admin.repository.js';

type ProductRecord = NonNullable<Awaited<ReturnType<typeof findProductById>>>;

function isPrismaError(error: unknown, code: string) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

function toSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'san-pham';
}

async function createAvailableSlug(name: string) {
  const base = toSlug(name);
  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    if (!await findProductBySlug(candidate)) return candidate;
  }
  throw new AppError(409, 'PRODUCT_SLUG_EXHAUSTED', 'Không thể tạo đường dẫn riêng cho tên sản phẩm này. Hãy đổi tên sản phẩm rồi thử lại.');
}

function ensureToolUnits(kind: 'INGREDIENT' | 'TOOL', units: Array<'GRAM' | 'MILLILITER' | 'PIECE'>) {
  if (kind === 'TOOL' && units.some((unit) => unit !== 'PIECE')) {
    throw new AppError(400, 'INVALID_TOOL_UNIT', 'Dụng cụ chỉ được bán theo đơn vị cái.');
  }
}

function serializeProduct(product: ProductRecord) {
  return {
    id: product.id.toString(),
    slug: product.slug,
    name: product.name,
    description: product.description,
    kind: product.kind,
    imageUrl: product.imageUrl,
    active: product.active,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    stockQuantity: product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
    variants: product.variants.map((variant) => ({
      id: variant.id.toString(),
      sku: variant.sku,
      label: variant.label,
      unit: variant.unit,
      packageQuantity: variant.packageQuantity.toString(),
      price: variant.price.toString(),
      currency: variant.currency.trim(),
      stockQuantity: variant.stockQuantity,
      active: variant.active,
    })),
  };
}

export async function listAdminProducts(query: AdminProductListQuery) {
  const result = await findAdminProducts(query);
  return { items: result.products.map(serializeProduct), nextCursor: result.nextCursor };
}

export async function addProduct(input: CreateProductInput, actor: AuthUser) {
  ensureToolUnits(input.kind, input.variants.map((variant) => variant.unit));
  try {
    return serializeProduct(await createProductWithVariants(input, await createAvailableSlug(input.name), BigInt(actor.id)));
  } catch (error) {
    if (isPrismaError(error, 'P2002')) {
      throw new AppError(409, 'PRODUCT_CONFLICT', 'Tên đường dẫn hoặc mã hàng đã tồn tại. Hãy dùng mã hàng khác.');
    }
    throw error;
  }
}

export async function editProduct(productId: string, input: UpdateProductInput) {
  if (!await findProductById(BigInt(productId))) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Không tìm thấy sản phẩm cần sửa.');
  }
  return serializeProduct(await updateProduct(BigInt(productId), input));
}

export async function addVariant(productId: string, input: CreateVariantInput, actor: AuthUser) {
  const product = await findProductById(BigInt(productId));
  if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Không tìm thấy sản phẩm cần thêm quy cách.');
  ensureToolUnits(product.kind, [input.unit]);
  try {
    return serializeProduct(await createVariant(product.id, input, BigInt(actor.id)));
  } catch (error) {
    if (isPrismaError(error, 'P2002')) {
      throw new AppError(409, 'SKU_ALREADY_USED', 'Mã hàng này đã được sử dụng. Hãy nhập mã khác.');
    }
    throw error;
  }
}

export async function editVariant(variantId: string, input: UpdateVariantInput) {
  const variant = await findVariantWithProduct(BigInt(variantId));
  if (!variant) throw new AppError(404, 'VARIANT_NOT_FOUND', 'Không tìm thấy quy cách cần sửa.');
  if (input.unit) ensureToolUnits(variant.product.kind, [input.unit]);
  return serializeProduct(await updateVariant(variant.id, input));
}

export async function changeInventory(variantId: string, input: AdjustInventoryInput, actor: AuthUser) {
  const existing = await findVariantWithProduct(BigInt(variantId));
  if (!existing) throw new AppError(404, 'VARIANT_NOT_FOUND', 'Không tìm thấy quy cách cần điều chỉnh kho.');

  const result = await adjustVariantInventory(existing.id, BigInt(actor.id), input);
  if (!result) {
    throw new AppError(409, 'INSUFFICIENT_STOCK', `Tồn kho hiện có là ${existing.stockQuantity}; không thể giảm ${-input.quantityDelta}.`);
  }
  return {
    variantId: result.variant.id.toString(),
    stockQuantity: result.variant.stockQuantity,
    movement: {
      id: result.movement.id.toString(),
      quantityDelta: result.movement.quantityDelta,
      stockBefore: result.movement.stockBefore,
      stockAfter: result.movement.stockAfter,
      reason: result.movement.reason,
      note: result.movement.note,
      createdAt: result.movement.createdAt.toISOString(),
      actorName: actor.displayName,
      orderNumber: null,
    },
  };
}

export async function getInventoryHistory(variantId: string, limit: number) {
  if (!await findVariantWithProduct(BigInt(variantId))) {
    throw new AppError(404, 'VARIANT_NOT_FOUND', 'Không tìm thấy quy cách cần xem sổ kho.');
  }
  const movements = await findInventoryHistory(BigInt(variantId), limit);
  return movements.map((movement) => ({
    id: movement.id.toString(),
    quantityDelta: movement.quantityDelta,
    stockBefore: movement.stockBefore,
    stockAfter: movement.stockAfter,
    reason: movement.reason,
    note: movement.note,
    createdAt: movement.createdAt.toISOString(),
    actorName: movement.actorUser?.displayName ?? null,
    orderNumber: movement.order?.orderNumber ?? null,
  }));
}

type AdminOrderSummaryRecord = Awaited<ReturnType<typeof findAdminOrders>>['orders'][number];
type AdminOrderDetailRecord = NonNullable<Awaited<ReturnType<typeof findAdminOrderByNumber>>>;
type AdminPaymentRecord = Awaited<ReturnType<typeof findAdminPayments>>['payments'][number];

function serializeOrderSummary(order: AdminOrderSummaryRecord) {
  const latestPayment = order.payments[0];
  return {
    id: order.id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency.trim(),
    subtotal: order.subtotal.toString(),
    shippingFee: order.shippingFee.toString(),
    total: order.total.toString(),
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    province: order.province,
    itemCount: order._count.items,
    customer: order.user,
    latestPayment: latestPayment ? {
      status: latestPayment.status,
      amount: latestPayment.amount.toString(),
      paidAt: latestPayment.paidAt?.toISOString() ?? null,
    } : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

function serializePayment(payment: AdminPaymentRecord) {
  return {
    id: payment.id.toString(),
    provider: payment.provider,
    status: payment.status,
    amount: payment.amount.toString(),
    merchantTransactionId: payment.merchantTransactionId,
    providerTransactionId: payment.providerTransactionId,
    returnCode: payment.returnCode,
    returnMessage: payment.returnMessage,
    expiresAt: payment.expiresAt.toISOString(),
    paidAt: payment.paidAt?.toISOString() ?? null,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    order: payment.order,
  };
}

function serializeOrderDetail(order: AdminOrderDetailRecord) {
  return {
    ...serializeOrderSummary({ ...order, _count: { items: order.items.length }, payments: order.payments.slice(0, 1) }),
    address: {
      addressLine: order.addressLine,
      ward: order.ward,
      district: order.district,
      province: order.province,
    },
    note: order.note,
    items: order.items.map((item) => ({
      id: item.id.toString(),
      productName: item.productName,
      sku: item.sku,
      variantLabel: item.variantLabel,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      lineTotal: item.lineTotal.toString(),
    })),
    payments: order.payments.map((payment) => serializePayment({ ...payment, order: { orderNumber: order.orderNumber, recipientName: order.recipientName } })),
  };
}

export async function getAdminOverview() {
  const result = await findAdminOverview();
  return {
    ordersByStatus: Object.fromEntries(result.orderCounts.map((item) => [item.status, item._count._all])),
    collectedRevenue: {
      allTime: result.collectedAllTime._sum.amount?.toString() ?? '0',
      allTimePaymentCount: result.collectedAllTime._count._all,
      lastSevenDays: result.collectedLastSevenDays._sum.amount?.toString() ?? '0',
      lastSevenDaysPaymentCount: result.collectedLastSevenDays._count._all,
    },
    inventory: {
      outOfStockCount: result.outOfStockCount,
      lowStockCount: result.lowStockCount,
      lowStockThreshold: 5,
    },
    recentOrders: result.recentOrders.map(serializeOrderSummary),
  };
}

export async function listAdminOrders(query: AdminOrderListQuery) {
  const result = await findAdminOrders(query);
  return { items: result.orders.map(serializeOrderSummary), nextCursor: result.nextCursor };
}

export async function getAdminOrder(orderNumber: string) {
  const order = await findAdminOrderByNumber(orderNumber);
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.');
  return serializeOrderDetail(order);
}

const allowedStatusTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PAYMENT_REVIEW: ['CONFIRMED'],
  CONFIRMED: ['PREPARING'],
  PREPARING: ['SHIPPING'],
  SHIPPING: ['DELIVERED'],
};

export function canAdvanceAdminOrder(currentStatus: OrderStatus, nextStatus: OrderStatus) {
  return allowedStatusTransitions[currentStatus]?.includes(nextStatus) ?? false;
}

export async function advanceAdminOrder(orderNumber: string, input: UpdateOrderStatusInput) {
  const order = await findAdminOrderByNumber(orderNumber);
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.');
  if (!canAdvanceAdminOrder(order.status, input.status)) {
    throw new AppError(409, 'INVALID_ORDER_STATUS_TRANSITION', `Không thể chuyển đơn từ ${order.status} sang ${input.status}.`);
  }
  const updated = await updateAdminOrderStatus(order.id, order.status, input.status);
  if (!updated) {
    throw new AppError(409, 'ORDER_STATUS_CHANGED', 'Trạng thái đơn vừa được thay đổi ở phiên khác. Hãy tải lại dữ liệu.');
  }
  return serializeOrderSummary(updated);
}

export async function listAdminPayments(query: AdminPaymentListQuery) {
  const result = await findAdminPayments(query);
  return { items: result.payments.map(serializePayment), nextCursor: result.nextCursor };
}

export async function getAdminInventoryOverview(limit: number) {
  const result = await findAdminInventoryOverview(limit);
  return {
    lowStockThreshold: 5,
    attentionVariants: result.attentionVariants.map((variant) => ({
      id: variant.id.toString(),
      sku: variant.sku,
      label: variant.label,
      stockQuantity: variant.stockQuantity,
      product: { ...variant.product, id: variant.product.id.toString() },
    })),
    recentMovements: result.recentMovements.map((movement) => ({
      id: movement.id.toString(),
      quantityDelta: movement.quantityDelta,
      stockBefore: movement.stockBefore,
      stockAfter: movement.stockAfter,
      reason: movement.reason,
      note: movement.note,
      createdAt: movement.createdAt.toISOString(),
      actorName: movement.actorUser?.displayName ?? null,
      orderNumber: movement.order?.orderNumber ?? null,
      variant: movement.productVariant,
    })),
  };
}
