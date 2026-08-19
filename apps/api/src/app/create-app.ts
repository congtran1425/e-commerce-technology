import cors from 'cors';
import express from 'express';
import { env } from '../config/env.js';
import { errorHandler, notFoundHandler } from '../middleware/error-handler.js';
import { apiRouter } from './routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json());

  app.use('/api', apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
