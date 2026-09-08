import { Router } from 'express';
import { getRecipeHandler, listRecipesHandler } from './recipe.controller.js';

export const recipeRouter = Router();

recipeRouter.get('/', listRecipesHandler);
recipeRouter.get('/:slug', getRecipeHandler);

