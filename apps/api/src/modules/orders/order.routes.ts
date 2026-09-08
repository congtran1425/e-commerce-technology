import { Router, type RequestHandler } from 'express';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/app-error.js';
import { requireAuthentication } from '../auth/auth.middleware.js';
import {
  createOrderHandler,
  getOrderHandler,
  syncOrderPaymentHandler,
} from './order.controller.js';

const requireTrustedOrigin: RequestHandler = (request, _response, next) => {
  const origin = request.get('origin');
  if (!origin && env.nodeEnv !== 'production') {
    next();
    return;
  }
  if (!origin || !env.corsOrigins.includes(origin)) {
    next(new AppError(403, 'UNTRUSTED_ORIGIN', 'Nguồn gửi yêu cầu không được phép.'));
    return;
  }
  next();
};

export const orderRouter = Router();

orderRouter.post('/', requireAuthentication, requireTrustedOrigin, createOrderHandler);
orderRouter.get('/:orderNumber', requireAuthentication, getOrderHandler);
orderRouter.post('/:orderNumber/payment-status', requireAuthentication, requireTrustedOrigin, syncOrderPaymentHandler);
