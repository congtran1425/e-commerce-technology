import type { CookieOptions, RequestHandler } from 'express';
import { env } from '../../config/env.js';
import { accountTokenRequestSchema, emailOnlyRequestSchema, loginRequestSchema, registerRequestSchema, resetPasswordRequestSchema } from './auth.schemas.js';
import { readSessionToken, SESSION_COOKIE_NAME } from './auth.middleware.js';
import {
  login,
  logout,
  register,
  resendVerification,
  forgotPassword,
  verifyEmail,
  resetPassword,
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
    await register(registerRequestSchema.parse(request.body));
    disableCaching(response);
    response.status(202).json({ data: { message: 'Kiểm tra email để hoàn tất đăng ký.' } });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationHandler: RequestHandler = async (request, response, next) => {
  try {
    await resendVerification(emailOnlyRequestSchema.parse(request.body).email);
    disableCaching(response);
    response.status(202).json({ data: { message: 'Nếu tài khoản cần xác minh, thư sẽ được gửi.' } });
  } catch (error) { next(error); }
};

export const forgotPasswordHandler: RequestHandler = async (request, response, next) => {
  try {
    await forgotPassword(emailOnlyRequestSchema.parse(request.body).email);
    disableCaching(response);
    response.status(202).json({ data: { message: 'Nếu email đã đăng ký, thư đặt lại mật khẩu sẽ được gửi.' } });
  } catch (error) { next(error); }
};

export const verifyEmailHandler: RequestHandler = async (request, response, next) => {
  try {
    await verifyEmail(accountTokenRequestSchema.parse(request.body).token);
    disableCaching(response);
    response.status(204).send();
  } catch (error) { next(error); }
};

export const resetPasswordHandler: RequestHandler = async (request, response, next) => {
  try {
    const input = resetPasswordRequestSchema.parse(request.body);
    await resetPassword(input.token, input.password);
    disableCaching(response);
    response.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
    response.status(204).send();
  } catch (error) { next(error); }
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
