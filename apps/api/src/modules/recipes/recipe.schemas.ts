import { z } from 'zod';

export const recipeSlugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(160),
});

export const recipeDetailQuerySchema = z.object({
  servings: z.coerce.number().int().min(1).max(50).optional(),
});
