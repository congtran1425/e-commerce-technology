import { database } from '../../config/database.js';
import { AppError } from '../../shared/app-error.js';
import { minorUnitsToDecimal } from './order.money.js';

const orderInclude = {
  items: { orderBy: { id: 'asc' as const } },
  payments: { orderBy: { createdAt: 'desc' as const }, take: 1 },
} as const;

export type ReservedOrderItem = {
  variantId: bigint;
  productName: string;
  sku: string;
  variantLabel: string;
  quantity: number;
  unitPriceMinor: bigint;
  lineTotalMinor: bigint;
};

export type ReserveOrderInput = {
  orderNumber: string;
  idempotencyKey: string;
  userId: bigint;
  merchantTransactionId: string;
  expiresAt: Date;
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

export function findOrderByIdempotencyKey(idempotencyKey: string) {
  return database.order.findUnique({ where: { idempotencyKey }, include: orderInclude });
}

export function findOrderByNumber(orderNumber: string) {
  return database.order.findUnique({ where: { orderNumber }, include: orderInclude });
}

export function findPaymentByMerchantTransactionId(merchantTransactionId: string) {
  return database.payment.findUnique({
    where: { merchantTransactionId },
    include: { order: { include: orderInclude } },
  });
}

export function findExpiredPendingPayments(before: Date, take = 20) {
  return database.payment.findMany({
    where: {
      status: 'PENDING',
      expiresAt: { lte: before },
      order: { status: 'AWAITING_PAYMENT' },
    },
    orderBy: { expiresAt: 'asc' },
    take,
  });
}

export async function reserveOrder(input: ReserveOrderInput) {
  return database.$transaction(async (transaction) => {
    const existing = await transaction.order.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      include: orderInclude,
    });
    if (existing) return existing;

    const variantIds = input.items.map((item) => BigInt(item.variantId));
    const variants = await transaction.productVariant.findMany({
      where: {
        id: { in: variantIds },
        active: true,
        currency: 'VND',
        product: { active: true },
      },
      select: {
        id: true,
        sku: true,
        label: true,
        price: true,
        stockQuantity: true,
        product: { select: { name: true } },
      },
    });
    const variantsById = new Map(variants.map((variant) => [variant.id.toString(), variant]));

    const reservedItems = input.items.map<ReservedOrderItem>((item) => {
      const variant = variantsById.get(item.variantId);
      if (!variant) {
        throw new AppError(409, 'CART_CHANGED', 'Một sản phẩm trong giỏ không còn được bán. Hãy kiểm tra lại giỏ hàng.');
      }

      const unitPriceMinor = BigInt(variant.price.mul(100).toFixed(0));
      if (unitPriceMinor % 100n !== 0n) {
        throw new AppError(
          409,
          'PRICE_NOT_PAYABLE',
          `${variant.product.name} đang có giá không phù hợp với thanh toán VND.`,
        );
      }
      return {
        variantId: variant.id,
        productName: variant.product.name,
        sku: variant.sku,
        variantLabel: variant.label,
        quantity: item.quantity,
        unitPriceMinor,
        lineTotalMinor: unitPriceMinor * BigInt(item.quantity),
      };
    }).sort((left, right) => left.variantId < right.variantId ? -1 : 1);

    for (const item of reservedItems) {
      const update = await transaction.productVariant.updateMany({
        where: {
          id: item.variantId,
          active: true,
          stockQuantity: { gte: item.quantity },
        },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      if (update.count !== 1) {
        throw new AppError(409, 'INSUFFICIENT_STOCK', `${item.productName} không còn đủ số lượng để đặt.`);
      }
    }

    const subtotalMinor = reservedItems.reduce((total, item) => total + item.lineTotalMinor, 0n);
    if (subtotalMinor <= 0n) throw new AppError(409, 'INVALID_ORDER_TOTAL', 'Tổng tiền đơn hàng không hợp lệ.');
    const subtotal = minorUnitsToDecimal(subtotalMinor);

    return transaction.order.create({
      data: {
        orderNumber: input.orderNumber,
        idempotencyKey: input.idempotencyKey,
        userId: input.userId,
        subtotal,
        shippingFee: '0.00',
        total: subtotal,
        recipientName: input.recipient.name,
        recipientPhone: input.recipient.phone,
        addressLine: input.recipient.addressLine,
        ward: input.recipient.ward,
        district: input.recipient.district,
        province: input.recipient.province,
        note: input.note,
        items: {
          create: reservedItems.map((item) => ({
            productVariantId: item.variantId,
            productName: item.productName,
            sku: item.sku,
            variantLabel: item.variantLabel,
            quantity: item.quantity,
            unitPrice: minorUnitsToDecimal(item.unitPriceMinor),
            lineTotal: minorUnitsToDecimal(item.lineTotalMinor),
          })),
        },
        payments: {
          create: {
            provider: 'ZALOPAY',
            amount: subtotal,
            merchantTransactionId: input.merchantTransactionId,
            expiresAt: input.expiresAt,
          },
        },
      },
      include: orderInclude,
    });
  });
}

export async function savePaymentCheckout(input: {
  paymentId: bigint;
  checkoutUrl: string;
  providerToken?: string;
  returnCode: number;
  returnMessage: string;
}) {
  const payment = await database.payment.update({
    where: { id: input.paymentId },
    data: {
      checkoutUrl: input.checkoutUrl,
      providerToken: input.providerToken,
      returnCode: input.returnCode,
      returnMessage: input.returnMessage.slice(0, 500),
    },
    select: { orderId: true },
  });
  return database.order.findUniqueOrThrow({ where: { id: payment.orderId }, include: orderInclude });
}

export async function savePendingPaymentResponse(paymentId: bigint, returnCode: number, returnMessage: string) {
  const payment = await database.payment.update({
    where: { id: paymentId },
    data: { returnCode, returnMessage: returnMessage.slice(0, 500) },
    select: { orderId: true },
  });
  return database.order.findUniqueOrThrow({ where: { id: payment.orderId }, include: orderInclude });
}

export async function releaseOrderReservation(input: {
  orderId: bigint;
  paymentId: bigint;
  paymentStatus: 'FAILED' | 'EXPIRED';
  returnCode?: number;
  returnMessage: string;
}) {
  await database.$transaction(async (transaction) => {
    const transition = await transaction.order.updateMany({
      where: { id: input.orderId, status: 'AWAITING_PAYMENT' },
      data: { status: 'CANCELLED' },
    });
    if (transition.count === 0) return;

    const items = await transaction.orderItem.findMany({
      where: { orderId: input.orderId, productVariantId: { not: null } },
      select: { productVariantId: true, quantity: true },
      orderBy: { productVariantId: 'asc' },
    });
    for (const item of items) {
      if (!item.productVariantId) continue;
      await transaction.productVariant.update({
        where: { id: item.productVariantId },
        data: { stockQuantity: { increment: item.quantity } },
      });
    }

    await transaction.payment.updateMany({
      where: { id: input.paymentId, status: 'PENDING' },
      data: {
        status: input.paymentStatus,
        returnCode: input.returnCode,
        returnMessage: input.returnMessage.slice(0, 500),
      },
    });
  });
}

export async function markPaymentSucceeded(input: {
  paymentId: bigint;
  providerTransactionId: string;
  paidAt: Date;
  returnCode: number;
  returnMessage: string;
}) {
  return database.$transaction(async (transaction) => {
    const payment = await transaction.payment.findUniqueOrThrow({
      where: { id: input.paymentId },
      select: { orderId: true, status: true },
    });

    if (payment.status !== 'SUCCEEDED') {
      await transaction.payment.update({
        where: { id: input.paymentId },
        data: {
          status: 'SUCCEEDED',
          providerTransactionId: input.providerTransactionId,
          paidAt: input.paidAt,
          returnCode: input.returnCode,
          returnMessage: input.returnMessage.slice(0, 500),
        },
      });
    }

    const order = await transaction.order.findUniqueOrThrow({
      where: { id: payment.orderId },
      select: { status: true },
    });
    if (order.status === 'AWAITING_PAYMENT') {
      await transaction.order.update({ where: { id: payment.orderId }, data: { status: 'CONFIRMED' } });
    } else if (order.status === 'CANCELLED') {
      await transaction.order.update({ where: { id: payment.orderId }, data: { status: 'PAYMENT_REVIEW' } });
    }

    return transaction.order.findUniqueOrThrow({ where: { id: payment.orderId }, include: orderInclude });
  });
}

export async function markPaymentForReview(input: {
  paymentId: bigint;
  providerTransactionId?: string;
  returnCode: number;
  returnMessage: string;
}) {
  return database.$transaction(async (transaction) => {
    const payment = await transaction.payment.update({
      where: { id: input.paymentId },
      data: {
        status: 'SUCCEEDED',
        providerTransactionId: input.providerTransactionId,
        returnCode: input.returnCode,
        returnMessage: input.returnMessage.slice(0, 500),
      },
      select: { orderId: true },
    });
    await transaction.order.update({
      where: { id: payment.orderId },
      data: { status: 'PAYMENT_REVIEW' },
    });
    return transaction.order.findUniqueOrThrow({ where: { id: payment.orderId }, include: orderInclude });
  });
}
