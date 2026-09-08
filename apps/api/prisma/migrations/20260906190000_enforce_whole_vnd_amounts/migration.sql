ALTER TABLE "product_variants"
  ADD CONSTRAINT "product_variants_vnd_price_whole_check"
  CHECK ("currency" <> 'VND' OR "price" = trunc("price"));

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_vnd_amounts_whole_check"
  CHECK (
    "currency" <> 'VND'
    OR (
      "subtotal" = trunc("subtotal")
      AND "shipping_fee" = trunc("shipping_fee")
      AND "total" = trunc("total")
    )
  );

ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_amounts_whole_check"
  CHECK ("unit_price" = trunc("unit_price") AND "line_total" = trunc("line_total"));

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_amount_whole_check"
  CHECK ("amount" = trunc("amount"));
