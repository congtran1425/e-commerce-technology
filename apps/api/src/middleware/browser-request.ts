import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

export const CLIENT_REQUEST_HEADER = 'X-BDB-Client-Request';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const SERVER_CALLBACK_PATH = '/api/payments/zalopay/callback';

export function isBrowserRequestAllowed(input: {
  method: string;
  path: string;
  clientHeader?: string;
  origin?: string;
  allowedOrigins: readonly string[];
}) {
  if (SAFE_METHODS.has(input.method.toUpperCase())) return true;
  if (input.path === SERVER_CALLBACK_PATH && input.method.toUpperCase() === 'POST') return true;
  if (input.clientHeader !== '1') return false;
  return !input.origin || input.allowedOrigins.includes(input.origin);
}

// Yêu cầu thay đổi trạng thái từ web phải qua preflight CORS; SameSite không đủ
// để chặn trang độc hại nằm ở một subdomain cùng site.
export const requireBrowserRequestHeader: RequestHandler = (request, response, next) => {
  if (isBrowserRequestAllowed({
    method: request.method,
    path: request.path,
    clientHeader: request.get(CLIENT_REQUEST_HEADER),
    origin: request.get('Origin'),
    allowedOrigins: env.corsOrigins,
  })) {
    next();
    return;
  }

  response.status(403).json({
    error: {
      code: 'FORBIDDEN_BROWSER_REQUEST',
      message: 'Yêu cầu này không được phép thực hiện từ nguồn hiện tại.',
    },
  });
};
