ALTER TABLE "recipe_steps"
  ADD CONSTRAINT "recipe_steps_number_positive" CHECK ("step_number" > 0),
  ADD CONSTRAINT "recipe_steps_duration_positive" CHECK ("duration_minutes" IS NULL OR "duration_minutes" > 0),
  ADD CONSTRAINT "recipe_steps_temperature_positive" CHECK ("temperature_c" IS NULL OR "temperature_c" > 0);

