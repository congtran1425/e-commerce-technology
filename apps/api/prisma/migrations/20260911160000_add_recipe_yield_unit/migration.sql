CREATE TYPE "RecipeYieldUnit" AS ENUM ('PERSON', 'PORTION', 'PIECE', 'LOAF');
CREATE TYPE "RecipeCategory" AS ENUM ('COOKIE', 'CAKE', 'DESSERT', 'BREAD');

ALTER TABLE "recipes"
  ADD COLUMN "yield_unit" "RecipeYieldUnit" NOT NULL DEFAULT 'PERSON',
  ADD COLUMN "category" "RecipeCategory" NOT NULL DEFAULT 'CAKE';
