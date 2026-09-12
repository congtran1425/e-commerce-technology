import type { RequestHandler } from 'express';
import type { AuthUser } from '../auth/auth.service.js';
import {
  adjustInventorySchema,
  adminInventoryOverviewQuerySchema,
  adminOrderListQuerySchema,
  adminPaymentListQuerySchema,
  adminProductListQuerySchema,
  createProductSchema,
  createVariantSchema,
  inventoryHistoryQuerySchema,
  productParamsSchema,
  orderParamsSchema,
  updateOrderStatusSchema,
  updateProductSchema,
  updateVariantSchema,
  variantParamsSchema,
} from './admin.schemas.js';
import {
  advanceAdminOrder,
  addProduct,
  addVariant,
  changeInventory,
  editProduct,
  editVariant,
  getInventoryHistory,
  getAdminInventoryOverview,
  getAdminOrder,
  getAdminOverview,
  listAdminOrders,
  listAdminPayments,
  listAdminProducts,
} from './admin.service.js';

function authUser(response: Parameters<RequestHandler>[1]) {
  return response.locals.authUser as AuthUser;
}

export const listProductsHandler: RequestHandler = async (request, response, next) => {
  try {
    response.json({ data: await listAdminProducts(adminProductListQuerySchema.parse(request.query)) });
  } catch (error) { next(error); }
};

export const createProductHandler: RequestHandler = async (request, response, next) => {
  try {
    response.status(201).json({ data: await addProduct(createProductSchema.parse(request.body), authUser(response)) });
  } catch (error) { next(error); }
};

export const updateProductHandler: RequestHandler = async (request, response, next) => {
  try {
    const { productId } = productParamsSchema.parse(request.params);
    response.json({ data: await editProduct(productId, updateProductSchema.parse(request.body)) });
  } catch (error) { next(error); }
};

export const createVariantHandler: RequestHandler = async (request, response, next) => {
  try {
    const { productId } = productParamsSchema.parse(request.params);
    response.status(201).json({ data: await addVariant(productId, createVariantSchema.parse(request.body), authUser(response)) });
  } catch (error) { next(error); }
};

export const updateVariantHandler: RequestHandler = async (request, response, next) => {
  try {
    const { variantId } = variantParamsSchema.parse(request.params);
    response.json({ data: await editVariant(variantId, updateVariantSchema.parse(request.body)) });
  } catch (error) { next(error); }
};

export const adjustInventoryHandler: RequestHandler = async (request, response, next) => {
  try {
    const { variantId } = variantParamsSchema.parse(request.params);
    response.status(201).json({ data: await changeInventory(variantId, adjustInventorySchema.parse(request.body), authUser(response)) });
  } catch (error) { next(error); }
};

export const inventoryHistoryHandler: RequestHandler = async (request, response, next) => {
  try {
    const { variantId } = variantParamsSchema.parse(request.params);
    const { limit } = inventoryHistoryQuerySchema.parse(request.query);
    response.json({ data: await getInventoryHistory(variantId, limit) });
  } catch (error) { next(error); }
};

export const overviewHandler: RequestHandler = async (_request, response, next) => {
  try {
    response.json({ data: await getAdminOverview() });
  } catch (error) { next(error); }
};

export const listOrdersHandler: RequestHandler = async (request, response, next) => {
  try {
    response.json({ data: await listAdminOrders(adminOrderListQuerySchema.parse(request.query)) });
  } catch (error) { next(error); }
};

export const orderDetailHandler: RequestHandler = async (request, response, next) => {
  try {
    const { orderNumber } = orderParamsSchema.parse(request.params);
    response.json({ data: await getAdminOrder(orderNumber) });
  } catch (error) { next(error); }
};

export const updateOrderStatusHandler: RequestHandler = async (request, response, next) => {
  try {
    const { orderNumber } = orderParamsSchema.parse(request.params);
    response.json({ data: await advanceAdminOrder(orderNumber, updateOrderStatusSchema.parse(request.body)) });
  } catch (error) { next(error); }
};

export const listPaymentsHandler: RequestHandler = async (request, response, next) => {
  try {
    response.json({ data: await listAdminPayments(adminPaymentListQuerySchema.parse(request.query)) });
  } catch (error) { next(error); }
};

export const inventoryOverviewHandler: RequestHandler = async (request, response, next) => {
  try {
    const { limit } = adminInventoryOverviewQuerySchema.parse(request.query);
    response.json({ data: await getAdminInventoryOverview(limit) });
  } catch (error) { next(error); }
};
