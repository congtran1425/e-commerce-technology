-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('GRAM', 'MILLILITER', 'PIECE');

-- CreateEnum
CREATE TYPE "ProductKind" AS ENUM ('INGREDIENT', 'TOOL');

-- CreateTable
CREATE TABLE "recipes" (
    "id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "summary" VARCHAR(500) NOT NULL,
    "story" TEXT NOT NULL,
    "image_url" VARCHAR(500),
    "base_servings" SMALLINT NOT NULL,
    "prep_minutes" SMALLINT NOT NULL,
    "bake_minutes" SMALLINT NOT NULL,
    "temperature_c" SMALLINT,
    "difficulty" "Difficulty" NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "recipe_id" BIGINT NOT NULL,
    "ingredient_id" BIGINT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "note" VARCHAR(300),
    "sort_order" SMALLINT NOT NULL,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("recipe_id","ingredient_id")
);

-- CreateTable
CREATE TABLE "tools" (
    "id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "name" VARCHAR(180) NOT NULL,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_tools" (
    "recipe_id" BIGINT NOT NULL,
    "tool_id" BIGINT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" SMALLINT NOT NULL,

    CONSTRAINT "recipe_tools_pkey" PRIMARY KEY ("recipe_id","tool_id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "kind" "ProductKind" NOT NULL,
    "image_url" VARCHAR(500),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "sku" VARCHAR(80) NOT NULL,
    "label" VARCHAR(180) NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "package_quantity" DECIMAL(12,3) NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'VND',
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_variants" (
    "ingredient_id" BIGINT NOT NULL,
    "product_variant_id" BIGINT NOT NULL,
    "priority" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "ingredient_variants_pkey" PRIMARY KEY ("ingredient_id","product_variant_id")
);

-- CreateTable
CREATE TABLE "tool_variants" (
    "tool_id" BIGINT NOT NULL,
    "product_variant_id" BIGINT NOT NULL,
    "priority" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "tool_variants_pkey" PRIMARY KEY ("tool_id","product_variant_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipes_slug_key" ON "recipes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_slug_key" ON "ingredients"("slug");

-- CreateIndex
CREATE INDEX "recipe_ingredients_recipe_id_sort_order_idx" ON "recipe_ingredients"("recipe_id", "sort_order");

-- CreateIndex
CREATE INDEX "recipe_ingredients_ingredient_id_idx" ON "recipe_ingredients"("ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "tools_slug_key" ON "tools"("slug");

-- CreateIndex
CREATE INDEX "recipe_tools_recipe_id_sort_order_idx" ON "recipe_tools"("recipe_id", "sort_order");

-- CreateIndex
CREATE INDEX "recipe_tools_tool_id_idx" ON "recipe_tools"("tool_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_active_idx" ON "product_variants"("product_id", "active");

-- CreateIndex
CREATE INDEX "ingredient_variants_product_variant_id_idx" ON "ingredient_variants"("product_variant_id");

-- CreateIndex
CREATE INDEX "tool_variants_product_variant_id_idx" ON "tool_variants"("product_variant_id");

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_tools" ADD CONSTRAINT "recipe_tools_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_tools" ADD CONSTRAINT "recipe_tools_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_variants" ADD CONSTRAINT "ingredient_variants_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_variants" ADD CONSTRAINT "ingredient_variants_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_variants" ADD CONSTRAINT "tool_variants_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_variants" ADD CONSTRAINT "tool_variants_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
