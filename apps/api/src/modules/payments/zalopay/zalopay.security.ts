import { createHmac, timingSafeEqual } from 'node:crypto';

function hmacSha256(data: string, key: string) {
  return createHmac('sha256', key).update(data, 'utf8').digest('hex');
}

function safeHexEqual(left: string, right: string) {
  if (!/^[a-fA-F0-9]+$/.test(left) || !/^[a-fA-F0-9]+$/.test(right)) return false;
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function signCreateOrder(input: {
  appId: string;
  appTransactionId: string;
  appUser: string;
  amount: number;
  appTime: number;
  embedData: string;
  item: string;
  key1: string;
}) {
  const data = [
    input.appId,
    input.appTransactionId,
    input.appUser,
    input.amount,
    input.appTime,
    input.embedData,
    input.item,
  ].join('|');
  return hmacSha256(data, input.key1);
}

export function signQueryOrder(appId: string, appTransactionId: string, key1: string) {
  return hmacSha256(`${appId}|${appTransactionId}|${key1}`, key1);
}

export function verifyCallbackMac(data: string, requestMac: string, key2: string) {
  return safeHexEqual(hmacSha256(data, key2), requestMac);
}

export function vietnamDatePrefix(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => (
    parts.find((part) => part.type === type)?.value ?? ''
  );
  return `${value('year')}${value('month')}${value('day')}`;
}

export function buildAppTransactionId(orderNumber: string, date = new Date()) {
  const result = `${vietnamDatePrefix(date)}_${orderNumber}`;
  if (result.length > 40) throw new Error('Mã giao dịch ZaloPay vượt quá 40 ký tự.');
  return result;
}
