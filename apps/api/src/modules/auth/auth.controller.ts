import type { CookieOptions, RequestHandler } from 'express';
import { env } from '../../config/env.js';
import { loginRequestSchema, registerRequestSchema } from './auth.schemas.js';
import { readSessionToken, SESSION_COOKIE_NAME } from './auth.middleware.js';
import {
  login,
  logout,
  register,
  type AuthUser,
} from './auth.service.js';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1_000;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.nodeEnv === 'production',
  path: '/',
};

function setSessionCookie(response: Parameters<RequestHandler>[1], sessionToken: string) {
  response.cookie(SESSION_COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: env.sessionTtlDays * DAY_IN_MILLISECONDS,
  });
}

function disableCaching(response: Parameters<RequestHandler>[1]) {
  response.set('Cache-Control', 'no-store');
}

export const registerHandler: RequestHandler = async (request, response, next) => {
  try {
    const result = await register(registerRequestSchema.parse(request.body));
    disableCaching(response);
    setSessionCookie(response, result.sessionToken);
    response.status(201).json({ data: { user: result.user } });
  } catch (error) {
    next(error);
  }
};

export const loginHandler: RequestHandler = async (request, response, next) => {
  try {
    const result = await login(loginRequestSchema.parse(request.body));
    disableCaching(response);
    setSessionCookie(response, result.sessionToken);
    response.json({ data: { user: result.user } });
  } catch (error) {
    next(error);
  }
};

export const currentUserHandler: RequestHandler = (_request, response) => {
  disableCaching(response);
  response.json({ data: { user: response.locals.authUser as AuthUser } });
};

export const logoutHandler: RequestHandler = async (request, response, next) => {
  try {
    await logout(readSessionToken(request.headers.cookie));
    disableCaching(response);
    response.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};
