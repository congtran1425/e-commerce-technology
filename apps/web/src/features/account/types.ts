import type { OrderStatus, PaymentStatus } from '../checkout/types';

export type AccountProfile = {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  createdAt: string;
};

export type AccountOrderSummary = {
  orderNumber: string;
  status: OrderStatus;
  currency: 'VND';
  total: string;
  recipientName: string;
  itemCount: number;
  paymentStatus: PaymentStatus | null;
  createdAt: string;
};

export type AccountOverview = {
  profile: AccountProfile;
  addressCount: number;
  orderCount: number;
  recentOrders: AccountOrderSummary[];
};

export type AccountOrderPage = {
  items: AccountOrderSummary[];
  nextCursor: string | null;
};

export type AccountAddress = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  ward: string | null;
  district: string;
  province: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AccountAddressInput = {
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  ward?: string;
  district: string;
  province: string;
  isDefault?: boolean;
};

export type AccountAddressUpdateInput = Partial<Omit<AccountAddressInput, 'ward' | 'isDefault'>> & {
  ward?: string | null;
  isDefault?: true;
};

export type AccountProfileInput = {
  displayName?: string;
  phone?: string | null;
};
