ALTER TABLE "recipes"
  ADD CONSTRAINT "recipes_base_servings_positive" CHECK ("base_servings" > 0),
  ADD CONSTRAINT "recipes_prep_minutes_nonnegative" CHECK ("prep_minutes" >= 0),
  ADD CONSTRAINT "recipes_bake_minutes_nonnegative" CHECK ("bake_minutes" >= 0),
  ADD CONSTRAINT "recipes_temperature_positive" CHECK ("temperature_c" IS NULL OR "temperature_c" > 0);

ALTER TABLE "recipe_ingredients"
  ADD CONSTRAINT "recipe_ingredients_quantity_positive" CHECK ("quantity" > 0),
  ADD CONSTRAINT "recipe_ingredients_sort_order_nonnegative" CHECK ("sort_order" >= 0);

ALTER TABLE "recipe_tools"
  ADD CONSTRAINT "recipe_tools_sort_order_nonnegative" CHECK ("sort_order" >= 0);

ALTER TABLE "product_variants"
  ADD CONSTRAINT "product_variants_package_quantity_positive" CHECK ("package_quantity" > 0),
  ADD CONSTRAINT "product_variants_price_nonnegative" CHECK ("price" >= 0),
  ADD CONSTRAINT "product_variants_stock_nonnegative" CHECK ("stock_quantity" >= 0);

ALTER TABLE "ingredient_variants"
  ADD CONSTRAINT "ingredient_variants_priority_nonnegative" CHECK ("priority" >= 0);

ALTER TABLE "tool_variants"
  ADD CONSTRAINT "tool_variants_priority_nonnegative" CHECK ("priority" >= 0);

