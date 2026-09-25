import { Router } from 'express';
import {
  currentUserHandler,
  loginHandler,
  logoutHandler,
  registerHandler,
  resendVerificationHandler,
  forgotPasswordHandler,
  verifyEmailHandler,
  resetPasswordHandler,
} from './auth.controller.js';
import { requireAuthentication } from './auth.middleware.js';
import { emailActionRateLimit, loginRateLimit, registerRateLimit } from './auth.rate-limit.js';

export const authRouter = Router();

authRouter.post('/register', registerRateLimit, registerHandler);
authRouter.post('/resend-verification', registerRateLimit, emailActionRateLimit, resendVerificationHandler);
authRouter.post('/verify-email', registerRateLimit, verifyEmailHandler);
authRouter.post('/forgot-password', registerRateLimit, emailActionRateLimit, forgotPasswordHandler);
authRouter.post('/reset-password', registerRateLimit, resetPasswordHandler);
authRouter.post('/login', loginRateLimit, loginHandler);
authRouter.get('/me', requireAuthentication, currentUserHandler);
authRouter.post('/logout', logoutHandler);
