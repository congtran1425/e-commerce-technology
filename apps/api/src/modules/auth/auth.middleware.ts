import type { RequestHandler } from 'express';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/app-error.js';
import { getUserFromSessionToken, type AuthUser } from './auth.service.js';

export const SESSION_COOKIE_NAME = env.nodeEnv === 'production'
  ? '__Host-ecomtech_session'
  : 'ecomtech_session';

export function readSessionToken(cookieHeader: string | undefined) {
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(';')) {
    const separatorIndex = cookie.indexOf('=');
    if (separatorIndex < 0) continue;
    const name = cookie.slice(0, separatorIndex).trim();
    if (name !== SESSION_COOKIE_NAME) continue;

    try {
      return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
    } catch {
      return null;
    }
  }

  return null;
}

export const requireAuthentication: RequestHandler = async (request, response, next) => {
  try {
    const sessionToken = readSessionToken(request.headers.cookie);
    const user = sessionToken ? await getUserFromSessionToken(sessionToken) : null;

    if (!user) {
      next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Bạn cần đăng nhập để tiếp tục.'));
      return;
    }

    response.locals.authUser = user satisfies AuthUser;
    next();
  } catch (error) {
    next(error);
  }
};
