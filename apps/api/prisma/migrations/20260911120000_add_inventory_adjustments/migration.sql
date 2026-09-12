CREATE TYPE "InventoryMovementReason" AS ENUM (
  'INITIAL_STOCK',
  'RESTOCK',
  'CORRECTION',
  'DAMAGED',
  'RETURNED',
  'ORDER_RESERVED',
  'ORDER_RELEASED'
);

CREATE TABLE "inventory_movements" (
  "id" BIGSERIAL NOT NULL,
  "product_variant_id" BIGINT NOT NULL,
  "actor_user_id" BIGINT,
  "order_id" BIGINT,
  "quantity_delta" INTEGER NOT NULL,
  "stock_before" INTEGER NOT NULL,
  "stock_after" INTEGER NOT NULL,
  "reason" "InventoryMovementReason" NOT NULL,
  "note" VARCHAR(300),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inventory_movements_quantity_delta_nonzero" CHECK ("quantity_delta" <> 0),
  CONSTRAINT "inventory_movements_stock_before_nonnegative" CHECK ("stock_before" >= 0),
  CONSTRAINT "inventory_movements_stock_after_nonnegative" CHECK ("stock_after" >= 0),
  CONSTRAINT "inventory_movements_stock_balance" CHECK ("stock_after" = "stock_before" + "quantity_delta")
);

CREATE INDEX "inventory_movements_product_variant_id_created_at_idx"
  ON "inventory_movements"("product_variant_id", "created_at");

CREATE INDEX "inventory_movements_actor_user_id_idx"
  ON "inventory_movements"("actor_user_id");

CREATE INDEX "inventory_movements_order_id_idx"
  ON "inventory_movements"("order_id");

ALTER TABLE "inventory_movements"
  ADD CONSTRAINT "inventory_movements_product_variant_id_fkey"
  FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_movements"
  ADD CONSTRAINT "inventory_movements_actor_user_id_fkey"
  FOREIGN KEY ("actor_user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_movements"
  ADD CONSTRAINT "inventory_movements_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
