export type RecipeSummary = {
  slug: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  baseServings: number;
  yieldUnit: 'PERSON' | 'PORTION' | 'PIECE' | 'LOAF';
  yieldUnitLabel: string;
  category: 'COOKIE' | 'CAKE' | 'DESSERT' | 'BREAD';
  categoryLabel: string;
  prepMinutes: number;
  bakeMinutes: number;
  totalMinutes: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  difficultyLabel: string;
};

export type SelectedPackage = {
  id: string;
  label: string;
  packageQuantity: string;
  price: string;
  stockQuantity: number;
  count: number;
};

export type IngredientPlan = {
  id: string;
  name: string;
  unit: string;
  requiredQuantity: string;
  note: string | null;
  recommendation: {
    packages: SelectedPackage[];
    suppliedQuantity: string;
    surplusQuantity: string;
    totalPrice: string;
    totalPacks: number;
  } | null;
};

export type ToolPlan = {
  id: string;
  name: string;
  required: boolean;
  product: {
    variantId: string;
    name: string;
    label: string;
    price: string;
    currency: string;
  } | null;
};

export type RecipeDetail = RecipeSummary & {
  story: string;
  servings: number;
  temperatureC: number | null;
  steps: Array<{
    id: string;
    stepNumber: number;
    title: string | null;
    instruction: string;
    durationMinutes: number | null;
    temperatureC: number | null;
  }>;
  ingredients: IngredientPlan[];
  tools: ToolPlan[];
};
