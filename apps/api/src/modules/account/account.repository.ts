import { database } from '../../config/database.js';
import type {
  AccountOrderListQuery,
  CreateAddressInput,
  UpdateAddressInput,
  UpdateProfileInput,
} from './account.schemas.js';

const profileSelect = {
  id: true,
  email: true,
  displayName: true,
  phone: true,
  createdAt: true,
} as const;

const addressSelect = {
  id: true,
  label: true,
  recipientName: true,
  phone: true,
  addressLine: true,
  ward: true,
  district: true,
  province: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} as const;

const orderSummarySelect = {
  id: true,
  orderNumber: true,
  status: true,
  currency: true,
  total: true,
  recipientName: true,
  createdAt: true,
  items: { select: { quantity: true } },
  payments: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    select: { status: true },
  },
} as const;

export function findAccountProfile(userId: bigint) {
  return database.user.findUnique({ where: { id: userId }, select: profileSelect });
}

export function updateAccountProfile(userId: bigint, input: UpdateProfileInput) {
  return database.user.update({
    where: { id: userId },
    data: input,
    select: profileSelect,
  });
}

export function countAccountAddresses(userId: bigint) {
  return database.customerAddress.count({ where: { userId } });
}

export function countAccountOrders(userId: bigint) {
  return database.order.count({ where: { userId } });
}

export function findRecentAccountOrders(userId: bigint, take = 3) {
  return database.order.findMany({
    where: { userId },
    orderBy: { id: 'desc' },
    take,
    select: orderSummarySelect,
  });
}

export function findAccountOrders(userId: bigint, query: AccountOrderListQuery) {
  return database.order.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.cursor ? { id: { lt: BigInt(query.cursor) } } : {}),
    },
    orderBy: { id: 'desc' },
    take: query.limit + 1,
    select: orderSummarySelect,
  });
}

export function findAccountAddresses(userId: bigint) {
  return database.customerAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    select: addressSelect,
  });
}

export function createAccountAddress(userId: bigint, input: CreateAddressInput) {
  return database.$transaction(async (transaction) => {
    const addressCount = await transaction.customerAddress.count({ where: { userId } });
    const shouldBeDefault = addressCount === 0 || input.isDefault;

    if (shouldBeDefault) {
      await transaction.customerAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return transaction.customerAddress.create({
      data: { ...input, userId, isDefault: shouldBeDefault },
      select: addressSelect,
    });
  });
}

export function updateAccountAddress(userId: bigint, addressId: bigint, input: UpdateAddressInput) {
  return database.$transaction(async (transaction) => {
    const current = await transaction.customerAddress.findFirst({
      where: { id: addressId, userId },
      select: { id: true },
    });
    if (!current) return null;

    if (input.isDefault) {
      await transaction.customerAddress.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return transaction.customerAddress.update({
      where: { id: addressId },
      data: input,
      select: addressSelect,
    });
  });
}

export function deleteAccountAddress(userId: bigint, addressId: bigint) {
  return database.$transaction(async (transaction) => {
    const current = await transaction.customerAddress.findFirst({
      where: { id: addressId, userId },
      select: { id: true, isDefault: true },
    });
    if (!current) return false;

    await transaction.customerAddress.delete({ where: { id: addressId } });

    if (current.isDefault) {
      const replacement = await transaction.customerAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      if (replacement) {
        await transaction.customerAddress.update({
          where: { id: replacement.id },
          data: { isDefault: true },
        });
      }
    }

    return true;
  });
}
