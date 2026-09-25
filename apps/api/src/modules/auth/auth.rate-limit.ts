import { createHash } from 'node:crypto';
import type { Request } from 'express';
import { rateLimit } from 'express-rate-limit';

const WINDOW_MS = 15 * 60 * 1_000;

// Không lưu email thô trong bộ nhớ của bộ giới hạn lượt thử.
export function loginLimitKey(request: Pick<Request, 'body'>) {
  const email = typeof request.body?.email === 'string'
    ? request.body.email.trim().toLowerCase()
    : '';
  return createHash('sha256').update(email || 'missing-email').digest('hex');
}

function tooManyRequests(_request: Request, response: import('express').Response) {
  response.set('Cache-Control', 'no-store');
  response.status(429).json({
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Bạn đã thử quá nhiều lần. Vui lòng đợi khoảng 15 phút rồi thử lại.',
    },
  });
}

export const loginRateLimit = rateLimit({
  windowMs: WINDOW_MS,
  limit: 10,
  keyGenerator: loginLimitKey,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: tooManyRequests,
});

// Lớp bảo vệ ban đầu cho API một tiến trình; nhiều tiến trình cần kho đếm dùng chung.
export const registerRateLimit = rateLimit({
  windowMs: WINDOW_MS,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: tooManyRequests,
});

export const emailActionRateLimit = rateLimit({
  windowMs: WINDOW_MS,
  limit: 5,
  keyGenerator: loginLimitKey,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: tooManyRequests,
});
