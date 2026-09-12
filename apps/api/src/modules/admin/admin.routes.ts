import { Router } from 'express';
import { requireAuthentication, requireRole } from '../auth/auth.middleware.js';
import {
  adjustInventoryHandler,
  createProductHandler,
  createVariantHandler,
  inventoryHistoryHandler,
  inventoryOverviewHandler,
  listOrdersHandler,
  listPaymentsHandler,
  listProductsHandler,
  orderDetailHandler,
  overviewHandler,
  updateOrderStatusHandler,
  updateProductHandler,
  updateVariantHandler,
} from './admin.controller.js';

export const adminRouter = Router();

adminRouter.use(requireAuthentication, requireRole('ADMIN'));
adminRouter.get('/overview', overviewHandler);
adminRouter.get('/orders', listOrdersHandler);
adminRouter.get('/orders/:orderNumber', orderDetailHandler);
adminRouter.patch('/orders/:orderNumber/status', updateOrderStatusHandler);
adminRouter.get('/payments', listPaymentsHandler);
adminRouter.get('/inventory', inventoryOverviewHandler);
adminRouter.get('/products', listProductsHandler);
adminRouter.post('/products', createProductHandler);
adminRouter.patch('/products/:productId', updateProductHandler);
adminRouter.post('/products/:productId/variants', createVariantHandler);
adminRouter.patch('/product-variants/:variantId', updateVariantHandler);
adminRouter.get('/product-variants/:variantId/inventory-movements', inventoryHistoryHandler);
adminRouter.post('/product-variants/:variantId/inventory-adjustments', adjustInventoryHandler);
