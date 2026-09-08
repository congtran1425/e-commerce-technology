export type QuoteRequestItem = {
  variantId: string;
  quantity: number;
};

export type QuoteVariant = {
  id: string;
  productName: string;
  label: string;
  price: string;
  currency: string;
  stockQuantity: number;
};

export type CartQuoteItem = {
  variantId: string;
  productName: string | null;
  label: string | null;
  requestedQuantity: number;
  availableQuantity: number | null;
  unitPrice: string | null;
  lineTotal: string | null;
  currency: string | null;
  status: 'AVAILABLE' | 'INSUFFICIENT_STOCK' | 'UNAVAILABLE';
};

export type CartQuote = {
  items: CartQuoteItem[];
  subtotal: string;
  currency: 'VND';
  canCheckout: boolean;
};

const MONEY_SCALE = 100n;

function toMinorUnits(value: string) {
  const [wholePart, decimalPart = ''] = value.split('.');
  if (!wholePart || !/^\d+$/.test(wholePart) || !/^\d*$/.test(decimalPart)) {
    throw new Error(`Giá biến thể không hợp lệ: ${value}`);
  }

  const fractionalPart = `${decimalPart}00`.slice(0, 2);
  return BigInt(wholePart) * MONEY_SCALE + BigInt(fractionalPart);
}

function fromMinorUnits(value: bigint) {
  const wholePart = value / MONEY_SCALE;
  const decimalPart = (value % MONEY_SCALE).toString().padStart(2, '0');
  return `${wholePart}.${decimalPart}`;
}

export function buildCartQuote(
  requestedItems: QuoteRequestItem[],
  variants: QuoteVariant[],
): CartQuote {
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  let subtotal = 0n;
  let canCheckout = true;

  const items = requestedItems.map<CartQuoteItem>((requestedItem) => {
    const variant = variantsById.get(requestedItem.variantId);

    if (!variant) {
      canCheckout = false;
      return {
        variantId: requestedItem.variantId,
        productName: null,
        label: null,
        requestedQuantity: requestedItem.quantity,
        availableQuantity: null,
        unitPrice: null,
        lineTotal: null,
        currency: null,
        status: 'UNAVAILABLE',
      };
    }

    const unitPrice = toMinorUnits(variant.price);
    const lineTotal = unitPrice * BigInt(requestedItem.quantity);
    subtotal += lineTotal;
    const hasEnoughStock = variant.stockQuantity >= requestedItem.quantity;

    if (!hasEnoughStock) canCheckout = false;

    return {
      variantId: requestedItem.variantId,
      productName: variant.productName,
      label: variant.label,
      requestedQuantity: requestedItem.quantity,
      availableQuantity: variant.stockQuantity,
      unitPrice: fromMinorUnits(unitPrice),
      lineTotal: fromMinorUnits(lineTotal),
      currency: variant.currency,
      status: hasEnoughStock ? 'AVAILABLE' : 'INSUFFICIENT_STOCK',
    };
  });

  return {
    items,
    subtotal: fromMinorUnits(subtotal),
    currency: 'VND',
    canCheckout,
  };
}
