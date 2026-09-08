import type { RequestHandler } from 'express';
import type { AuthUser } from '../auth/auth.service.js';
import {
  createOrder,
  getOrder,
  processZaloPayCallback,
  syncOrderPayment,
} from './order.service.js';
import {
  createOrderRequestSchema,
  orderParamsSchema,
  zaloPayCallbackRequestSchema,
} from './order.schemas.js';

function authUser(response: Parameters<RequestHandler>[1]) {
  return response.locals.authUser as AuthUser;
}

export const createOrderHandler: RequestHandler = async (request, response, next) => {
  try {
    const order = await createOrder(authUser(response), createOrderRequestSchema.parse(request.body));
    response.status(201).json({ data: order });
  } catch (error) {
    next(error);
  }
};

export const getOrderHandler: RequestHandler = async (request, response, next) => {
  try {
    const { orderNumber } = orderParamsSchema.parse(request.params);
    response.set('Cache-Control', 'no-store');
    response.json({ data: await getOrder(authUser(response), orderNumber) });
  } catch (error) {
    next(error);
  }
};

export const syncOrderPaymentHandler: RequestHandler = async (request, response, next) => {
  try {
    const { orderNumber } = orderParamsSchema.parse(request.params);
    response.set('Cache-Control', 'no-store');
    response.json({ data: await syncOrderPayment(authUser(response), orderNumber) });
  } catch (error) {
    next(error);
  }
};

export const zaloPayCallbackHandler: RequestHandler = async (request, response) => {
  const parsed = zaloPayCallbackRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.json({ return_code: -1, return_message: 'callback request invalid' });
    return;
  }

  try {
    response.json(await processZaloPayCallback(parsed.data));
  } catch (error) {
    console.error('Không xử lý được callback ZaloPay.', error);
    response.json({ return_code: 0, return_message: 'temporary processing error' });
  }
};
