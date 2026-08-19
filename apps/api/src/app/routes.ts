import { Router } from 'express';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'e-commerce-api',
    timestamp: new Date().toISOString(),
  });
});
