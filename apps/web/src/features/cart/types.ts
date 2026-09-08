export type CartQuoteStatus = 'AVAILABLE' | 'INSUFFICIENT_STOCK' | 'UNAVAILABLE';

export type CartQuoteItem = {
  variantId: string;
  productName: string | null;
  label: string | null;
  requestedQuantity: number;
  availableQuantity: number | null;
  unitPrice: string | null;
  lineTotal: string | null;
  currency: string | null;
  status: CartQuoteStatus;
};

export type CartQuote = {
  items: CartQuoteItem[];
  subtotal: string;
  currency: 'VND';
  canCheckout: boolean;
};
