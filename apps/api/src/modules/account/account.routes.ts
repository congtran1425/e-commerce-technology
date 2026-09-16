import { Router, type RequestHandler } from 'express';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/app-error.js';
import { requireAuthentication, requireRole } from '../auth/auth.middleware.js';
import {
  createAccountAddressHandler,
  deleteAccountAddressHandler,
  getAccountOverviewHandler,
  listAccountAddressesHandler,
  listAccountOrdersHandler,
  updateAccountAddressHandler,
  updateAccountProfileHandler,
} from './account.controller.js';

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

export const accountRouter = Router();

accountRouter.use(requireAuthentication, requireRole('CUSTOMER'));
accountRouter.get('/overview', getAccountOverviewHandler);
accountRouter.patch('/profile', requireTrustedOrigin, updateAccountProfileHandler);
accountRouter.get('/orders', listAccountOrdersHandler);
accountRouter.get('/addresses', listAccountAddressesHandler);
accountRouter.post('/addresses', requireTrustedOrigin, createAccountAddressHandler);
accountRouter.patch('/addresses/:addressId', requireTrustedOrigin, updateAccountAddressHandler);
accountRouter.delete('/addresses/:addressId', requireTrustedOrigin, deleteAccountAddressHandler);
