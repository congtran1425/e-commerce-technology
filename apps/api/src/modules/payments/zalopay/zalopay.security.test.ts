import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  buildAppTransactionId,
  signCreateOrder,
  signQueryOrder,
  verifyCallbackMac,
  vietnamDatePrefix,
} from './zalopay.security.js';

describe('ZaloPay security helpers', () => {
  it('ghép đúng chuỗi ký yêu cầu tạo đơn', () => {
    const key1 = 'test-key-one';
    const expected = createHmac('sha256', key1)
      .update('2553|260906_EC260906A1B2C3D4|u1|50000|123|{}|[]')
      .digest('hex');

    expect(signCreateOrder({
      appId: '2553',
      appTransactionId: '260906_EC260906A1B2C3D4',
      appUser: 'u1',
      amount: 50_000,
      appTime: 123,
      embedData: '{}',
      item: '[]',
      key1,
    })).toBe(expected);
  });

  it('ký truy vấn và kiểm tra callback bằng khóa tương ứng', () => {
    const key1 = 'query-key';
    const key2 = 'callback-key';
    expect(signQueryOrder('2553', '260906_order', key1)).toBe(
      createHmac('sha256', key1).update('2553|260906_order|query-key').digest('hex'),
    );

    const data = '{"app_trans_id":"260906_order"}';
    const mac = createHmac('sha256', key2).update(data).digest('hex');
    expect(verifyCallbackMac(data, mac, key2)).toBe(true);
    expect(verifyCallbackMac(data, '0'.repeat(64), key2)).toBe(false);
  });

  it('dùng ngày Việt Nam cho app_trans_id', () => {
    const nearMidnightUtc = new Date('2026-09-05T18:30:00.000Z');
    expect(vietnamDatePrefix(nearMidnightUtc)).toBe('260906');
    expect(buildAppTransactionId('EC260906A1B2C3D4', nearMidnightUtc))
      .toBe('260906_EC260906A1B2C3D4');
  });
});
