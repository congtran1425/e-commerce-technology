import { database } from '../../config/database.js';

export type CartQuoteVariantRecord = {
  id: string;
  productName: string;
  label: string;
  price: string;
  currency: string;
  stockQuantity: number;
};

export async function findActiveVariantsForQuote(variantIds: string[]) {
  const variants = await database.productVariant.findMany({
    where: {
      id: { in: variantIds.map((variantId) => BigInt(variantId)) },
      active: true,
      currency: 'VND',
      product: { active: true },
    },
    select: {
      id: true,
      label: true,
      price: true,
      currency: true,
      stockQuantity: true,
      product: { select: { name: true } },
    },
  });

  return variants.map<CartQuoteVariantRecord>((variant) => ({
    id: variant.id.toString(),
    productName: variant.product.name,
    label: variant.label,
    price: variant.price.toString(),
    currency: variant.currency.trim(),
    stockQuantity: variant.stockQuantity,
  }));
}
