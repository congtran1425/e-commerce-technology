import type { RequestHandler } from 'express';
import { getRecipePlan, listRecipes } from './recipe.service.js';
import { recipeDetailQuerySchema, recipeSlugParamsSchema } from './recipe.schemas.js';

export const listRecipesHandler: RequestHandler = async (_request, response, next) => {
  try {
    response.json({ data: await listRecipes() });
  } catch (error) {
    next(error);
  }
};

export const getRecipeHandler: RequestHandler = async (request, response, next) => {
  try {
    const { slug } = recipeSlugParamsSchema.parse(request.params);
    const { servings } = recipeDetailQuerySchema.parse(request.query);
    response.json({ data: await getRecipePlan(slug, servings) });
  } catch (error) {
    next(error);
  }
};

