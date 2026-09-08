import { z } from 'zod';
import { signCreateOrder, signQueryOrder } from './zalopay.security.js';

const createOrderResponseSchema = z.object({
  return_code: z.number().int(),
  return_message: z.string().optional().default(''),
  sub_return_code: z.number().int().optional(),
  sub_return_message: z.string().optional(),
  zp_trans_token: z.string().optional(),
  order_token: z.string().optional(),
  order_url: z.string().url().optional(),
  qr_code: z.string().optional(),
}).passthrough();

const queryOrderResponseSchema = z.object({
  return_code: z.number().int(),
  return_message: z.string().optional().default(''),
  sub_return_code: z.number().int().optional(),
  sub_return_message: z.string().optional(),
  is_processing: z.boolean().optional(),
  amount: z.number().int().optional(),
  zp_trans_id: z.union([z.number(), z.string()]).optional(),
  server_time: z.number().int().optional(),
}).passthrough();

export type ZaloPayConfig = {
  appId: string;
  key1: string;
  createUrl: string;
  queryUrl: string;
};

async function postForm(url: string, form: URLSearchParams) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`ZaloPay phản hồi HTTP ${response.status}.`);
  }

  return response.json() as Promise<unknown>;
}

export async function createZaloPayOrder(config: ZaloPayConfig, input: {
  appTransactionId: string;
  appUser: string;
  appTime: number;
  amount: number;
  description: string;
  callbackUrl: string;
  redirectUrl: string;
  expireSeconds: number;
  items: Array<{
    itemid: string;
    itemname: string;
    itemprice: number;
    itemquantity: number;
  }>;
}) {
  const serializedItems = JSON.stringify(input.items);
  const item = serializedItems.length <= 2_048 ? serializedItems : '[]';
  const embedData = JSON.stringify({ redirecturl: input.redirectUrl });
  const mac = signCreateOrder({
    appId: config.appId,
    appTransactionId: input.appTransactionId,
    appUser: input.appUser,
    amount: input.amount,
    appTime: input.appTime,
    embedData,
    item,
    key1: config.key1,
  });
  const form = new URLSearchParams({
    app_id: config.appId,
    app_trans_id: input.appTransactionId,
    app_user: input.appUser,
    app_time: input.appTime.toString(),
    expire_duration_seconds: input.expireSeconds.toString(),
    amount: input.amount.toString(),
    description: input.description,
    callback_url: input.callbackUrl,
    item,
    embed_data: embedData,
    bank_code: '',
    mac,
  });

  return createOrderResponseSchema.parse(await postForm(config.createUrl, form));
}

export async function queryZaloPayOrder(
  config: ZaloPayConfig,
  appTransactionId: string,
) {
  const form = new URLSearchParams({
    app_id: config.appId,
    app_trans_id: appTransactionId,
    mac: signQueryOrder(config.appId, appTransactionId, config.key1),
  });

  return queryOrderResponseSchema.parse(await postForm(config.queryUrl, form));
}
