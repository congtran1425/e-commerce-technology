import { Router } from 'express';
import { quoteCartHandler } from './cart.controller.js';

export const cartRouter = Router();

cartRouter.post('/quote', quoteCartHandler);
