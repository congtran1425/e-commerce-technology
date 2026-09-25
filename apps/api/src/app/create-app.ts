import cors from 'cors';
import express from 'express';
import { env } from '../config/env.js';
import { errorHandler, notFoundHandler } from '../middleware/error-handler.js';
import { requireBrowserRequestHeader } from '../middleware/browser-request.js';
import { apiRouter } from './routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  // Chỉ bật 1 hop khi API thật sự chỉ nhận lưu lượng qua một reverse proxy tin cậy.
  app.set('trust proxy', env.trustProxyHops);
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json());
  app.use(requireBrowserRequestHeader);

  app.use('/api', apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
