import { database } from '../../config/database.js';

export function findPublishedRecipes() {
  return database.recipe.findMany({
    where: { published: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      slug: true,
      title: true,
      summary: true,
      imageUrl: true,
      baseServings: true,
      yieldUnit: true,
      category: true,
      prepMinutes: true,
      bakeMinutes: true,
      difficulty: true,
    },
  });
}

export function findPublishedRecipeBySlug(slug: string) {
  return database.recipe.findFirst({
    where: { slug, published: true },
    include: {
      steps: { orderBy: { stepNumber: 'asc' } },
      ingredients: {
        orderBy: { sortOrder: 'asc' },
        include: {
          ingredient: {
            include: {
              variants: {
                orderBy: [{ priority: 'desc' }, { productVariant: { price: 'asc' } }],
                include: { productVariant: { include: { product: true } } },
              },
            },
          },
        },
      },
      tools: {
        orderBy: { sortOrder: 'asc' },
        include: {
          tool: {
            include: {
              variants: {
                orderBy: [{ priority: 'desc' }, { productVariant: { price: 'asc' } }],
                include: { productVariant: { include: { product: true } } },
              },
            },
          },
        },
      },
    },
  });
}
