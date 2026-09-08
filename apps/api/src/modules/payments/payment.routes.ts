import { Router } from 'express';
import { zaloPayCallbackHandler } from '../orders/order.controller.js';

export const paymentRouter = Router();

paymentRouter.post('/zalopay/callback', zaloPayCallbackHandler);
