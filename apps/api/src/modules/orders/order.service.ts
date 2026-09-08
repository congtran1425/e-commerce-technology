import { randomBytes } from 'node:crypto';
import { env } from '../../config/env.js';
import type { AuthUser } from '../auth/auth.service.js';
import {
  createZaloPayOrder,
  queryZaloPayOrder,
} from '../payments/zalopay/zalopay.client.js';
import {
  buildAppTransactionId,
  verifyCallbackMac,
  vietnamDatePrefix,
} from '../payments/zalopay/zalopay.security.js';
import { AppError } from '../../shared/app-error.js';
import { decimalToMinorUnits, minorUnitsToWholeVnd } from './order.money.js';
import {
  findOrderByIdempotencyKey,
  findOrderByNumber,
  findExpiredPendingPayments,
  findPaymentByMerchantTransactionId,
  markPaymentForReview,
  markPaymentSucceeded,
  releaseOrderReservation,
  reserveOrder,
  savePaymentCheckout,
  savePendingPaymentResponse,
} from './order.repository.js';
import { zaloPayCallbackDataSchema, type CreateOrderInput } from './order.schemas.js';

type OrderRecord = NonNullable<Awaited<ReturnType<typeof findOrderByNumber>>>;

function serializeOrder(order: OrderRecord) {
  const payment = order.payments[0] ?? null;
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency.trim(),
    subtotal: order.subtotal.toFixed(2),
    shippingFee: order.shippingFee.toFixed(2),
    total: order.total.toFixed(2),
    recipient: {
      name: order.recipientName,
      phone: order.recipientPhone,
      addressLine: order.addressLine,
      ward: order.ward,
      district: order.district,
      province: order.province,
    },
    note: order.note,
    items: order.items.map((item) => ({
      id: item.id.toString(),
      variantId: item.productVariantId?.toString() ?? null,
      productName: item.productName,
      sku: item.sku,
      variantLabel: item.variantLabel,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      lineTotal: item.lineTotal.toFixed(2),
    })),
    payment: payment ? {
      provider: payment.provider,
      status: payment.status,
      checkoutUrl: payment.checkoutUrl,
      expiresAt: payment.expiresAt.toISOString(),
      paidAt: payment.paidAt?.toISOString() ?? null,
    } : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

function requireZaloPayConfig() {
  if (!env.zaloPay) {
    throw new AppError(
      503,
      'PAYMENT_NOT_CONFIGURED',
      'ZaloPay Sandbox chưa được cấu hình trên máy chủ.',
    );
  }
  return env.zaloPay;
}

function assertOrderAccess(order: OrderRecord, user: AuthUser) {
  if (user.role !== 'ADMIN' && order.userId.toString() !== user.id) {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.');
  }
}

function createOrderNumber(now: Date) {
  return `EC${vietnamDatePrefix(now)}${randomBytes(4).toString('hex').toUpperCase()}`;
}

function latestPayment(order: OrderRecord) {
  const payment = order.payments[0];
  if (!payment) throw new AppError(500, 'PAYMENT_MISSING', 'Đơn hàng chưa có lần thanh toán.');
  return payment;
}

function resolveExistingAttempt(order: OrderRecord, user: AuthUser) {
  assertOrderAccess(order, user);
  const payment = latestPayment(order);
  if (payment.status === 'PENDING' && payment.checkoutUrl) return serializeOrder(order);
  if (payment.status === 'PENDING') {
    throw new AppError(
      409,
      'ORDER_CREATION_IN_PROGRESS',
      'Đơn hàng đang được tạo. Hãy chờ một lát rồi kiểm tra lại.',
    );
  }
  throw new AppError(
    409,
    'ORDER_ATTEMPT_ALREADY_USED',
    'Lần đặt hàng này đã kết thúc. Hãy thử thanh toán lại.',
  );
}

export async function createOrder(user: AuthUser, input: CreateOrderInput) {
  const config = requireZaloPayConfig();
  const existing = await findOrderByIdempotencyKey(input.idempotencyKey);
  if (existing) return resolveExistingAttempt(existing, user);

  const now = new Date();
  const orderNumber = createOrderNumber(now);
  const merchantTransactionId = buildAppTransactionId(orderNumber, now);
  const expiresAt = new Date(now.getTime() + config.expireSeconds * 1_000);
  let order: OrderRecord;
  try {
    order = await reserveOrder({
      orderNumber,
      idempotencyKey: input.idempotencyKey,
      userId: BigInt(user.id),
      merchantTransactionId,
      expiresAt,
      recipient: input.recipient,
      note: input.note,
      items: input.items,
    });
  } catch (error) {
    const concurrentAttempt = await findOrderByIdempotencyKey(input.idempotencyKey);
    if (concurrentAttempt) return resolveExistingAttempt(concurrentAttempt, user);
    throw error;
  }

  if (order.orderNumber !== orderNumber) return resolveExistingAttempt(order, user);

  const payment = latestPayment(order);
  const amount = minorUnitsToWholeVnd(decimalToMinorUnits(order.total.toFixed(2)));
  const redirectUrl = new URL(config.redirectUrl);
  redirectUrl.searchParams.set('order', order.orderNumber);

  try {
    const providerResponse = await createZaloPayOrder(config, {
      appTransactionId: merchantTransactionId,
      appUser: `u${user.id}`,
      appTime: now.getTime(),
      amount,
      description: `Thanh toán đơn ${order.orderNumber}`,
      callbackUrl: config.callbackUrl,
      redirectUrl: redirectUrl.toString(),
      expireSeconds: config.expireSeconds,
      items: order.items.map((item) => ({
        itemid: item.sku,
        itemname: item.productName.slice(0, 80),
        itemprice: minorUnitsToWholeVnd(decimalToMinorUnits(item.unitPrice.toFixed(2))),
        itemquantity: item.quantity,
      })),
    });

    if (providerResponse.return_code !== 1 || !providerResponse.order_url) {
      await releaseOrderReservation({
        orderId: order.id,
        paymentId: payment.id,
        paymentStatus: 'FAILED',
        returnCode: providerResponse.return_code,
        returnMessage: providerResponse.return_message || 'ZaloPay từ chối tạo giao dịch.',
      });
      throw new AppError(502, 'PAYMENT_CREATE_FAILED', 'ZaloPay chưa thể tạo giao dịch. Tồn kho đã được hoàn lại.');
    }

    return serializeOrder(await savePaymentCheckout({
      paymentId: payment.id,
      checkoutUrl: providerResponse.order_url,
      providerToken: providerResponse.zp_trans_token,
      returnCode: providerResponse.return_code,
      returnMessage: providerResponse.return_message,
    }));
  } catch (error) {
    if (error instanceof AppError) throw error;
    await releaseOrderReservation({
      orderId: order.id,
      paymentId: payment.id,
      paymentStatus: 'FAILED',
      returnMessage: 'Không kết nối được với ZaloPay.',
    });
    throw new AppError(502, 'PAYMENT_PROVIDER_UNAVAILABLE', 'Chưa thể kết nối ZaloPay. Tồn kho đã được hoàn lại.');
  }
}

export async function getOrder(user: AuthUser, orderNumber: string) {
  const order = await findOrderByNumber(orderNumber);
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.');
  assertOrderAccess(order, user);
  return serializeOrder(order);
}

export async function syncOrderPayment(user: AuthUser, orderNumber: string) {
  const config = requireZaloPayConfig();
  const order = await findOrderByNumber(orderNumber);
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.');
  assertOrderAccess(order, user);
  const payment = latestPayment(order);
  if (payment.status !== 'PENDING') return serializeOrder(order);

  let providerResponse;
  try {
    providerResponse = await queryZaloPayOrder(config, payment.merchantTransactionId);
  } catch {
    throw new AppError(502, 'PAYMENT_PROVIDER_UNAVAILABLE', 'Chưa thể đối chiếu trạng thái với ZaloPay.');
  }

  if (providerResponse.return_code === 1) {
    const expectedAmount = minorUnitsToWholeVnd(decimalToMinorUnits(payment.amount.toFixed(2)));
    if (providerResponse.amount !== expectedAmount) {
      return serializeOrder(await markPaymentForReview({
        paymentId: payment.id,
        providerTransactionId: providerResponse.zp_trans_id?.toString(),
        returnCode: providerResponse.return_code,
        returnMessage: 'Số tiền ZaloPay phản hồi không khớp với đơn hàng.',
      }));
    }
    return serializeOrder(await markPaymentSucceeded({
      paymentId: payment.id,
      providerTransactionId: providerResponse.zp_trans_id?.toString() ?? 'unknown',
      paidAt: providerResponse.server_time ? new Date(providerResponse.server_time) : new Date(),
      returnCode: providerResponse.return_code,
      returnMessage: providerResponse.return_message || 'Thanh toán thành công.',
    }));
  }

  if (providerResponse.return_code === 2) {
    await releaseOrderReservation({
      orderId: order.id,
      paymentId: payment.id,
      paymentStatus: 'FAILED',
      returnCode: providerResponse.return_code,
      returnMessage: providerResponse.return_message || 'Giao dịch không thành công.',
    });
    return getOrder(user, orderNumber);
  }

  return serializeOrder(await savePendingPaymentResponse(
    payment.id,
    providerResponse.return_code,
    providerResponse.return_message || 'Giao dịch đang được xử lý.',
  ));
}

export async function processZaloPayCallback(input: { data: string; mac: string }) {
  const config = env.zaloPay;
  if (!config) return { return_code: 0, return_message: 'ZaloPay chưa được cấu hình.' };
  if (!verifyCallbackMac(input.data, input.mac, config.key2)) {
    return { return_code: -1, return_message: 'mac not equal' };
  }

  let callbackData;
  try {
    callbackData = zaloPayCallbackDataSchema.parse(JSON.parse(input.data));
  } catch {
    return { return_code: -1, return_message: 'callback data invalid' };
  }

  if (callbackData.app_id.toString() !== config.appId) {
    return { return_code: -1, return_message: 'app_id not equal' };
  }

  const payment = await findPaymentByMerchantTransactionId(callbackData.app_trans_id);
  if (!payment) return { return_code: 0, return_message: 'transaction not found' };
  if (payment.status === 'SUCCEEDED') return { return_code: 1, return_message: 'success' };

  const expectedAmount = minorUnitsToWholeVnd(decimalToMinorUnits(payment.amount.toFixed(2)));
  if (callbackData.amount !== expectedAmount) {
    await markPaymentForReview({
      paymentId: payment.id,
      providerTransactionId: callbackData.zp_trans_id.toString(),
      returnCode: 1,
      returnMessage: 'Callback có số tiền không khớp với đơn hàng.',
    });
    return { return_code: 1, return_message: 'accepted for review' };
  }

  await markPaymentSucceeded({
    paymentId: payment.id,
    providerTransactionId: callbackData.zp_trans_id.toString(),
    paidAt: callbackData.server_time ? new Date(callbackData.server_time) : new Date(),
    returnCode: 1,
    returnMessage: 'Callback thanh toán thành công.',
  });
  return { return_code: 1, return_message: 'success' };
}

export async function reconcileExpiredPayments() {
  const config = env.zaloPay;
  if (!config) return;

  const expirationGrace = new Date(Date.now() - 5 * 60 * 1_000);
  const payments = await findExpiredPendingPayments(expirationGrace);
  for (const payment of payments) {
    try {
      const providerResponse = await queryZaloPayOrder(config, payment.merchantTransactionId);
      if (providerResponse.return_code === 1) {
        const expectedAmount = minorUnitsToWholeVnd(decimalToMinorUnits(payment.amount.toFixed(2)));
        if (providerResponse.amount !== expectedAmount) {
          await markPaymentForReview({
            paymentId: payment.id,
            providerTransactionId: providerResponse.zp_trans_id?.toString(),
            returnCode: providerResponse.return_code,
            returnMessage: 'Đối soát nền nhận số tiền không khớp.',
          });
        } else {
          await markPaymentSucceeded({
            paymentId: payment.id,
            providerTransactionId: providerResponse.zp_trans_id?.toString() ?? 'unknown',
            paidAt: providerResponse.server_time ? new Date(providerResponse.server_time) : new Date(),
            returnCode: providerResponse.return_code,
            returnMessage: providerResponse.return_message || 'Đối soát nền xác nhận thanh toán.',
          });
        }
        continue;
      }

      await releaseOrderReservation({
        orderId: payment.orderId,
        paymentId: payment.id,
        paymentStatus: 'EXPIRED',
        returnCode: providerResponse.return_code,
        returnMessage: providerResponse.return_message || 'Giao dịch đã quá thời hạn thanh toán.',
      });
    } catch (error) {
      console.error(`Chưa đối soát được giao dịch hết hạn ${payment.merchantTransactionId}.`, error);
    }
  }
}
