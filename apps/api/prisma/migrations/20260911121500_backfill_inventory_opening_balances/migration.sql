INSERT INTO "inventory_movements" (
  "product_variant_id",
  "quantity_delta",
  "stock_before",
  "stock_after",
  "reason",
  "note"
)
SELECT
  "id",
  "stock_quantity",
  0,
  "stock_quantity",
  'INITIAL_STOCK'::"InventoryMovementReason",
  'Số dư mở sổ khi bổ sung chức năng lịch sử tồn kho.'
FROM "product_variants"
WHERE "stock_quantity" > 0;
