import { buildCartQuote, type QuoteRequestItem } from './cart-quote.js';
import { findActiveVariantsForQuote } from './cart.repository.js';

export async function quoteCart(requestedItems: QuoteRequestItem[]) {
  const variants = await findActiveVariantsForQuote(
    requestedItems.map((item) => item.variantId),
  );

  return buildCartQuote(requestedItems, variants);
}
