import { Router } from 'express';
import {
  currentUserHandler,
  loginHandler,
  logoutHandler,
  registerHandler,
} from './auth.controller.js';
import { requireAuthentication } from './auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.get('/me', requireAuthentication, currentUserHandler);
authRouter.post('/logout', logoutHandler);
