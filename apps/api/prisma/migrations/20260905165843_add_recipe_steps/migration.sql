-- CreateTable
CREATE TABLE "recipe_steps" (
    "id" BIGSERIAL NOT NULL,
    "recipe_id" BIGINT NOT NULL,
    "step_number" SMALLINT NOT NULL,
    "title" VARCHAR(180),
    "instruction" TEXT NOT NULL,
    "duration_minutes" SMALLINT,
    "temperature_c" SMALLINT,

    CONSTRAINT "recipe_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recipe_steps_recipe_id_step_number_idx" ON "recipe_steps"("recipe_id", "step_number");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_steps_recipe_id_step_number_key" ON "recipe_steps"("recipe_id", "step_number");

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
