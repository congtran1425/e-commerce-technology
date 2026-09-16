import type { RequestHandler } from 'express';
import type { AuthUser } from '../auth/auth.service.js';
import {
  accountOrderListQuerySchema,
  addressParamsSchema,
  createAddressRequestSchema,
  updateAddressRequestSchema,
  updateProfileRequestSchema,
} from './account.schemas.js';
import {
  addAccountAddress,
  changeAccountAddress,
  changeAccountProfile,
  getAccountOverview,
  listAccountAddresses,
  listAccountOrders,
  removeAccountAddress,
} from './account.service.js';

function accountUserId(response: Parameters<RequestHandler>[1]) {
  return BigInt((response.locals.authUser as AuthUser).id);
}

function disableCaching(response: Parameters<RequestHandler>[1]) {
  response.set('Cache-Control', 'no-store');
}

export const getAccountOverviewHandler: RequestHandler = async (_request, response, next) => {
  try {
    disableCaching(response);
    response.json({ data: await getAccountOverview(accountUserId(response)) });
  } catch (error) {
    next(error);
  }
};

export const updateAccountProfileHandler: RequestHandler = async (request, response, next) => {
  try {
    disableCaching(response);
    response.json({
      data: await changeAccountProfile(
        accountUserId(response),
        updateProfileRequestSchema.parse(request.body),
      ),
    });
  } catch (error) {
    next(error);
  }
};

export const listAccountOrdersHandler: RequestHandler = async (request, response, next) => {
  try {
    disableCaching(response);
    response.json({
      data: await listAccountOrders(
        accountUserId(response),
        accountOrderListQuerySchema.parse(request.query),
      ),
    });
  } catch (error) {
    next(error);
  }
};

export const listAccountAddressesHandler: RequestHandler = async (_request, response, next) => {
  try {
    disableCaching(response);
    response.json({ data: await listAccountAddresses(accountUserId(response)) });
  } catch (error) {
    next(error);
  }
};

export const createAccountAddressHandler: RequestHandler = async (request, response, next) => {
  try {
    disableCaching(response);
    response.status(201).json({
      data: await addAccountAddress(
        accountUserId(response),
        createAddressRequestSchema.parse(request.body),
      ),
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccountAddressHandler: RequestHandler = async (request, response, next) => {
  try {
    const { addressId } = addressParamsSchema.parse(request.params);
    disableCaching(response);
    response.json({
      data: await changeAccountAddress(
        accountUserId(response),
        BigInt(addressId),
        updateAddressRequestSchema.parse(request.body),
      ),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccountAddressHandler: RequestHandler = async (request, response, next) => {
  try {
    const { addressId } = addressParamsSchema.parse(request.params);
    await removeAccountAddress(accountUserId(response), BigInt(addressId));
    disableCaching(response);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};
