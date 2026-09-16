-- Gắn ảnh minh họa món bánh cho công thức hiện có, không thay ảnh do quản trị viên đã chọn.
UPDATE "recipes" AS recipe
SET "image_url" = image."url"
FROM (VALUES
  ('cookie-socola', '/images/recipes/thumbnails/chocolate-chip-cookies.png'),
  ('banh-quy-bo-tra-xanh', '/images/recipes/thumbnails/matcha-meltaways-cookies.png'),
  ('banh-quy-bo-cranberry', '/images/recipes/thumbnails/cranberry-butter-cookies.png'),
  ('cheesecake-khong-nuong', '/images/recipes/thumbnails/no-bake-cheesecake.png'),
  ('red-velvet-cake', '/images/recipes/thumbnails/red-velvet-cake.png'),
  ('sponge-cake-3-trung', '/images/recipes/thumbnails/sponge-cake.png'),
  ('sponge-cake-4-trung', '/images/recipes/thumbnails/sponge-cake.png'),
  ('tiramisu', '/images/recipes/thumbnails/tiramisu.png'),
  ('flan-caramel', '/images/recipes/thumbnails/flan-caramel.png'),
  ('mousse-socola-dau-tay', '/images/recipes/thumbnails/chocolate-strawberry-mousse.png'),
  ('banh-mi-sua-hokkaido', '/images/recipes/thumbnails/hokkaido-milk-bread.png'),
  ('croissant', '/images/recipes/thumbnails/croissant.png'),
  ('papparoti', '/images/recipes/thumbnails/papparoti-coffee-bun.png')
) AS image("slug", "url")
WHERE recipe."slug" = image."slug" AND recipe."image_url" IS NULL;
