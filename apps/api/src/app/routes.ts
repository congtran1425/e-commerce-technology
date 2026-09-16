import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { cartRouter } from '../modules/cart/cart.routes.js';
import { recipeRouter } from '../modules/recipes/recipe.routes.js';
import { orderRouter } from '../modules/orders/order.routes.js';
import { paymentRouter } from '../modules/payments/payment.routes.js';
import { adminRouter } from '../modules/admin/admin.routes.js';
import { accountRouter } from '../modules/account/account.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'e-commerce-api',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/recipes', recipeRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/account', accountRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/admin', adminRouter);
