import type { RequestHandler } from 'express';
import { cartQuoteRequestSchema } from './cart.schemas.js';
import { quoteCart } from './cart.service.js';

export const quoteCartHandler: RequestHandler = async (request, response, next) => {
  try {
    const { items } = cartQuoteRequestSchema.parse(request.body);
    response.json({ data: await quoteCart(items) });
  } catch (error) {
    next(error);
  }
};
