import { AppError } from '../../shared/app-error.js';
import {
  countAccountAddresses,
  countAccountOrders,
  createAccountAddress,
  deleteAccountAddress,
  findAccountAddresses,
  findAccountOrders,
  findAccountProfile,
  findRecentAccountOrders,
  updateAccountAddress,
  updateAccountProfile,
} from './account.repository.js';
import type {
  AccountOrderListQuery,
  CreateAddressInput,
  UpdateAddressInput,
  UpdateProfileInput,
} from './account.schemas.js';

type AccountOrderRecord = Awaited<ReturnType<typeof findRecentAccountOrders>>[number];
type AccountAddressRecord = Awaited<ReturnType<typeof findAccountAddresses>>[number];

function serializeProfile(profile: NonNullable<Awaited<ReturnType<typeof findAccountProfile>>>) {
  return {
    id: profile.id.toString(),
    email: profile.email,
    displayName: profile.displayName,
    phone: profile.phone,
    createdAt: profile.createdAt.toISOString(),
  };
}

function serializeOrderSummary(order: AccountOrderRecord) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency.trim(),
    total: order.total.toFixed(2),
    recipientName: order.recipientName,
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    paymentStatus: order.payments[0]?.status ?? null,
    createdAt: order.createdAt.toISOString(),
  };
}

function serializeAddress(address: AccountAddressRecord) {
  return {
    id: address.id.toString(),
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    addressLine: address.addressLine,
    ward: address.ward,
    district: address.district,
    province: address.province,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

async function requireProfile(userId: bigint) {
  const profile = await findAccountProfile(userId);
  if (!profile) throw new AppError(404, 'ACCOUNT_NOT_FOUND', 'Không tìm thấy tài khoản.');
  return profile;
}

export async function getAccountOverview(userId: bigint) {
  const [profile, addressCount, orderCount, recentOrders] = await Promise.all([
    requireProfile(userId),
    countAccountAddresses(userId),
    countAccountOrders(userId),
    findRecentAccountOrders(userId),
  ]);

  return {
    profile: serializeProfile(profile),
    addressCount,
    orderCount,
    recentOrders: recentOrders.map(serializeOrderSummary),
  };
}

export async function changeAccountProfile(userId: bigint, input: UpdateProfileInput) {
  await requireProfile(userId);
  return serializeProfile(await updateAccountProfile(userId, input));
}

export async function listAccountOrders(userId: bigint, query: AccountOrderListQuery) {
  const records = await findAccountOrders(userId, query);
  const hasMore = records.length > query.limit;
  const page = hasMore ? records.slice(0, query.limit) : records;
  return {
    items: page.map(serializeOrderSummary),
    nextCursor: hasMore ? page.at(-1)?.id.toString() ?? null : null,
  };
}

export async function listAccountAddresses(userId: bigint) {
  return (await findAccountAddresses(userId)).map(serializeAddress);
}

export async function addAccountAddress(userId: bigint, input: CreateAddressInput) {
  return serializeAddress(await createAccountAddress(userId, input));
}

export async function changeAccountAddress(userId: bigint, addressId: bigint, input: UpdateAddressInput) {
  const address = await updateAccountAddress(userId, addressId, input);
  if (!address) throw new AppError(404, 'ADDRESS_NOT_FOUND', 'Không tìm thấy địa chỉ trong tài khoản này.');
  return serializeAddress(address);
}

export async function removeAccountAddress(userId: bigint, addressId: bigint) {
  if (!await deleteAccountAddress(userId, addressId)) {
    throw new AppError(404, 'ADDRESS_NOT_FOUND', 'Không tìm thấy địa chỉ trong tài khoản này.');
  }
}
