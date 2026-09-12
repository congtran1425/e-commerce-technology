import { database } from '../../config/database.js';
import type { OrderStatus } from '../../generated/prisma/enums.js';
import type {
  AdjustInventoryInput,
  AdminOrderListQuery,
  AdminPaymentListQuery,
  AdminProductListQuery,
  CreateProductInput,
  CreateVariantInput,
  UpdateProductInput,
  UpdateVariantInput,
} from './admin.schemas.js';

const adminOrderInclude = {
  user: { select: { displayName: true, email: true } },
  _count: { select: { items: true } },
  payments: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    select: { status: true, amount: true, paidAt: true },
  },
} as const;

const productInclude = {
  variants: { orderBy: { id: 'asc' as const } },
} as const;

export async function findAdminProducts(query: AdminProductListQuery) {
  const products = await database.product.findMany({
    where: {
      ...(query.status === 'ACTIVE' ? { active: true } : {}),
      ...(query.status === 'INACTIVE' ? { active: false } : {}),
      ...(query.q ? {
        OR: [
          { name: { contains: query.q, mode: 'insensitive' as const } },
          { slug: { contains: query.q, mode: 'insensitive' as const } },
          { variants: { some: { OR: [
            { sku: { contains: query.q, mode: 'insensitive' as const } },
            { label: { contains: query.q, mode: 'insensitive' as const } },
          ] } } },
        ],
      } : {}),
    },
    include: productInclude,
    orderBy: { id: 'desc' },
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: BigInt(query.cursor) }, skip: 1 } : {}),
  });

  const hasMore = products.length > query.limit;
  if (hasMore) products.pop();
  return { products, nextCursor: hasMore ? products.at(-1)?.id.toString() ?? null : null };
}

export function findProductById(productId: bigint) {
  return database.product.findUnique({ where: { id: productId }, include: productInclude });
}

export function findProductBySlug(slug: string) {
  return database.product.findUnique({ where: { slug }, select: { id: true } });
}

export function createProductWithVariants(input: CreateProductInput, slug: string, actorUserId: bigint) {
  return database.$transaction(async (transaction) => {
    const product = await transaction.product.create({
      data: {
        slug,
        name: input.name,
        description: input.description,
        kind: input.kind,
        imageUrl: input.imageUrl,
        active: input.active,
        variants: {
          create: input.variants.map((variant) => ({
            sku: variant.sku,
            label: variant.label,
            unit: variant.unit,
            packageQuantity: variant.packageQuantity.toFixed(3),
            price: variant.price.toFixed(2),
            stockQuantity: variant.stockQuantity,
            active: variant.active,
          })),
        },
      },
      include: productInclude,
    });

    const openingMovements = product.variants
      .filter((variant) => variant.stockQuantity > 0)
      .map((variant) => ({
        productVariantId: variant.id,
        actorUserId,
        quantityDelta: variant.stockQuantity,
        stockBefore: 0,
        stockAfter: variant.stockQuantity,
        reason: 'INITIAL_STOCK' as const,
        note: 'Tồn kho ban đầu khi tạo quy cách.',
      }));
    if (openingMovements.length > 0) {
      await transaction.inventoryMovement.createMany({ data: openingMovements });
    }

    return product;
  });
}

export async function updateProduct(productId: bigint, input: UpdateProductInput) {
  return database.product.update({ where: { id: productId }, data: input, include: productInclude });
}

export function createVariant(productId: bigint, input: CreateVariantInput, actorUserId: bigint) {
  return database.$transaction(async (transaction) => {
    const variant = await transaction.productVariant.create({
      data: {
        productId,
        sku: input.sku,
        label: input.label,
        unit: input.unit,
        packageQuantity: input.packageQuantity.toFixed(3),
        price: input.price.toFixed(2),
        stockQuantity: input.stockQuantity,
        active: input.active,
      },
    });
    if (variant.stockQuantity > 0) {
      await transaction.inventoryMovement.create({
        data: {
          productVariantId: variant.id,
          actorUserId,
          quantityDelta: variant.stockQuantity,
          stockBefore: 0,
          stockAfter: variant.stockQuantity,
          reason: 'INITIAL_STOCK',
          note: 'Tồn kho ban đầu khi tạo quy cách.',
        },
      });
    }
    return transaction.product.findUniqueOrThrow({ where: { id: productId }, include: productInclude });
  });
}

export async function updateVariant(variantId: bigint, input: UpdateVariantInput) {
  const variant = await database.productVariant.update({
    where: { id: variantId },
    data: {
      ...input,
      ...(input.packageQuantity !== undefined ? { packageQuantity: input.packageQuantity.toFixed(3) } : {}),
      ...(input.price !== undefined ? { price: input.price.toFixed(2) } : {}),
    },
    select: { productId: true },
  });
  return database.product.findUniqueOrThrow({ where: { id: variant.productId }, include: productInclude });
}

export function findVariantWithProduct(variantId: bigint) {
  return database.productVariant.findUnique({ where: { id: variantId }, select: { id: true, productId: true, stockQuantity: true, product: { select: { kind: true } } } });
}

export function adjustVariantInventory(variantId: bigint, actorUserId: bigint, input: AdjustInventoryInput) {
  return database.$transaction(async (transaction) => {
    const updated = await transaction.productVariant.updateMany({
      where: {
        id: variantId,
        ...(input.quantityDelta < 0 ? { stockQuantity: { gte: -input.quantityDelta } } : {}),
      },
      data: { stockQuantity: { increment: input.quantityDelta } },
    });
    if (updated.count === 0) return null;

    const variant = await transaction.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    const movement = await transaction.inventoryMovement.create({
      data: {
        productVariantId: variantId,
        actorUserId,
        quantityDelta: input.quantityDelta,
        stockBefore: variant.stockQuantity - input.quantityDelta,
        stockAfter: variant.stockQuantity,
        reason: input.reason,
        note: input.note,
      },
    });
    return { variant, movement };
  });
}

export function findInventoryHistory(variantId: bigint, limit: number) {
  return database.inventoryMovement.findMany({
    where: { productVariantId: variantId },
    include: {
      actorUser: { select: { displayName: true } },
      order: { select: { orderNumber: true } },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit,
  });
}

export async function findAdminOverview() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    orderCounts,
    collectedAllTime,
    collectedLastSevenDays,
    outOfStockCount,
    lowStockCount,
    recentOrders,
  ] = await Promise.all([
    database.order.groupBy({ by: ['status'], _count: { _all: true } }),
    database.payment.aggregate({ where: { status: 'SUCCEEDED' }, _sum: { amount: true }, _count: { _all: true } }),
    database.payment.aggregate({
      where: { status: 'SUCCEEDED', paidAt: { gte: sevenDaysAgo } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    database.productVariant.count({ where: { active: true, product: { active: true }, stockQuantity: 0 } }),
    database.productVariant.count({ where: { active: true, product: { active: true }, stockQuantity: { gt: 0, lte: 5 } } }),
    database.order.findMany({ include: adminOrderInclude, orderBy: { id: 'desc' }, take: 6 }),
  ]);

  return {
    orderCounts,
    collectedAllTime,
    collectedLastSevenDays,
    outOfStockCount,
    lowStockCount,
    recentOrders,
  };
}

export async function findAdminOrders(query: AdminOrderListQuery) {
  const orders = await database.order.findMany({
    where: {
      ...(query.status !== 'ALL' ? { status: query.status } : {}),
      ...(query.q ? {
        OR: [
          { orderNumber: { contains: query.q, mode: 'insensitive' as const } },
          { recipientName: { contains: query.q, mode: 'insensitive' as const } },
          { recipientPhone: { contains: query.q } },
          { user: { is: { email: { contains: query.q, mode: 'insensitive' as const } } } },
        ],
      } : {}),
    },
    include: adminOrderInclude,
    orderBy: { id: 'desc' },
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: BigInt(query.cursor) }, skip: 1 } : {}),
  });
  const hasMore = orders.length > query.limit;
  if (hasMore) orders.pop();
  return { orders, nextCursor: hasMore ? orders.at(-1)?.id.toString() ?? null : null };
}

export function findAdminOrderByNumber(orderNumber: string) {
  return database.order.findUnique({
    where: { orderNumber },
    include: {
      user: { select: { displayName: true, email: true } },
      items: { orderBy: { id: 'asc' } },
      payments: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          provider: true,
          status: true,
          amount: true,
          merchantTransactionId: true,
          providerTransactionId: true,
          returnCode: true,
          returnMessage: true,
          expiresAt: true,
          paidAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function updateAdminOrderStatus(orderId: bigint, currentStatus: OrderStatus, nextStatus: OrderStatus) {
  const update = await database.order.updateMany({
    where: { id: orderId, status: currentStatus },
    data: { status: nextStatus },
  });
  if (update.count === 0) return null;
  return database.order.findUniqueOrThrow({ where: { id: orderId }, include: adminOrderInclude });
}

export async function findAdminPayments(query: AdminPaymentListQuery) {
  const payments = await database.payment.findMany({
    where: {
      ...(query.status !== 'ALL' ? { status: query.status } : {}),
      ...(query.q ? {
        OR: [
          { merchantTransactionId: { contains: query.q, mode: 'insensitive' as const } },
          { providerTransactionId: { contains: query.q, mode: 'insensitive' as const } },
          { order: { is: { orderNumber: { contains: query.q, mode: 'insensitive' as const } } } },
        ],
      } : {}),
    },
    select: {
      id: true,
      provider: true,
      status: true,
      amount: true,
      merchantTransactionId: true,
      providerTransactionId: true,
      returnCode: true,
      returnMessage: true,
      expiresAt: true,
      paidAt: true,
      createdAt: true,
      updatedAt: true,
      order: { select: { orderNumber: true, recipientName: true } },
    },
    orderBy: { id: 'desc' },
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: BigInt(query.cursor) }, skip: 1 } : {}),
  });
  const hasMore = payments.length > query.limit;
  if (hasMore) payments.pop();
  return { payments, nextCursor: hasMore ? payments.at(-1)?.id.toString() ?? null : null };
}

export async function findAdminInventoryOverview(limit: number) {
  const [attentionVariants, recentMovements] = await Promise.all([
    database.productVariant.findMany({
      where: { active: true, product: { active: true }, stockQuantity: { lte: 5 } },
      select: {
        id: true,
        sku: true,
        label: true,
        stockQuantity: true,
        product: { select: { id: true, name: true, kind: true } },
      },
      orderBy: [{ stockQuantity: 'asc' }, { id: 'desc' }],
      take: limit,
    }),
    database.inventoryMovement.findMany({
      include: {
        productVariant: { select: { sku: true, label: true, product: { select: { name: true } } } },
        actorUser: { select: { displayName: true } },
        order: { select: { orderNumber: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    }),
  ]);
  return { attentionVariants, recentMovements };
}
