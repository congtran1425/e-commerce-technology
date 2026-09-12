import { AppError } from '../../shared/app-error.js';
import { selectPackages } from './package-selector.js';
import { findPublishedRecipeBySlug, findPublishedRecipes } from './recipe.repository.js';

const difficultyLabels = {
  EASY: 'Dễ',
  MEDIUM: 'Vừa',
  HARD: 'Khó',
} as const;

const categoryLabels = {
  COOKIE: 'Bánh quy',
  CAKE: 'Bánh ngọt',
  DESSERT: 'Tráng miệng',
  BREAD: 'Bánh mì',
} as const;

const yieldUnitLabels = {
  PERSON: 'người',
  PORTION: 'phần',
  PIECE: 'cái',
  LOAF: 'ổ bánh',
} as const;

const unitLabels = {
  GRAM: 'g',
  MILLILITER: 'ml',
  PIECE: 'cái',
} as const;

export async function listRecipes() {
  const recipes = await findPublishedRecipes();

  return recipes.map((recipe) => ({
    ...recipe,
    categoryLabel: categoryLabels[recipe.category],
    yieldUnitLabel: yieldUnitLabels[recipe.yieldUnit],
    difficultyLabel: difficultyLabels[recipe.difficulty],
    totalMinutes: recipe.prepMinutes + recipe.bakeMinutes,
  }));
}

export async function getRecipePlan(slug: string, requestedServings?: number) {
  const recipe = await findPublishedRecipeBySlug(slug);

  if (!recipe) {
    throw new AppError(404, 'RECIPE_NOT_FOUND', 'Không tìm thấy công thức này.');
  }

  const servings = requestedServings ?? recipe.baseServings;
  const ratio = servings / recipe.baseServings;
  const ingredients = recipe.ingredients.map((entry) => {
    const requiredQuantity = (Number(entry.quantity) * ratio).toFixed(3);
    const recommendation = selectPackages(
      requiredQuantity,
      entry.ingredient.variants
        .filter(({ productVariant }) => productVariant.active && productVariant.product.active)
        .map(({ productVariant }) => ({
          id: productVariant.id.toString(),
          label: productVariant.label,
          packageQuantity: productVariant.packageQuantity.toString(),
          price: productVariant.price.toString(),
          stockQuantity: productVariant.stockQuantity,
        })),
    );

    return {
      id: entry.ingredient.id.toString(),
      name: entry.ingredient.name,
      unit: unitLabels[entry.ingredient.unit],
      requiredQuantity,
      note: entry.note,
      recommendation,
    };
  });

  const tools = recipe.tools.map((entry) => {
    const mapping = entry.tool.variants.find(
      ({ productVariant }) =>
        productVariant.active && productVariant.product.active && productVariant.stockQuantity > 0,
    );

    return {
      id: entry.tool.id.toString(),
      name: entry.tool.name,
      required: entry.required,
      product: mapping
        ? {
            variantId: mapping.productVariant.id.toString(),
            name: mapping.productVariant.product.name,
            label: mapping.productVariant.label,
            price: mapping.productVariant.price.toString(),
            currency: mapping.productVariant.currency.trim(),
          }
        : null,
    };
  });

  return {
    slug: recipe.slug,
    title: recipe.title,
    summary: recipe.summary,
    story: recipe.story,
    imageUrl: recipe.imageUrl,
    baseServings: recipe.baseServings,
    yieldUnit: recipe.yieldUnit,
    yieldUnitLabel: yieldUnitLabels[recipe.yieldUnit],
    category: recipe.category,
    categoryLabel: categoryLabels[recipe.category],
    servings,
    prepMinutes: recipe.prepMinutes,
    bakeMinutes: recipe.bakeMinutes,
    totalMinutes: recipe.prepMinutes + recipe.bakeMinutes,
    temperatureC: recipe.temperatureC,
    difficulty: recipe.difficulty,
    difficultyLabel: difficultyLabels[recipe.difficulty],
    steps: recipe.steps.map((step) => ({
      id: step.id.toString(),
      stepNumber: step.stepNumber,
      title: step.title,
      instruction: step.instruction,
      durationMinutes: step.durationMinutes,
      temperatureC: step.temperatureC,
    })),
    ingredients,
    tools,
  };
}
