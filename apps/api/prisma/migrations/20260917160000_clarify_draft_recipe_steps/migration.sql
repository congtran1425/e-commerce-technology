-- Chỉ hiệu chỉnh bản nháp đã thêm; không ghi đè công thức do quản trị viên sửa.
UPDATE "recipe_steps" AS step
SET "instruction" = 'Trộn 70 g đường với một ít nước và nước cốt chanh trước khi đun. Đun trên lửa vừa, không khuấy khi đường đang chuyển màu. Khi caramel có màu hổ phách, nhấc khỏi bếp và chia ngay vào đáy cốc. Cẩn thận vì caramel rất nóng.'
FROM "recipes" AS recipe
WHERE step."recipe_id" = recipe."id"
  AND recipe."slug" = 'flan-caramel'
  AND step."step_number" = 2
  AND step."instruction" = 'Đun 70 g đường với một ít nước trên lửa vừa, không khuấy khi đường đang chuyển màu. Khi đường có màu hổ phách, nhấc khỏi bếp, thêm nước cốt chanh và chia ngay vào đáy cốc. Cẩn thận vì caramel rất nóng.';

UPDATE "recipes"
SET "temperature_c" = 160
WHERE "slug" IN ('flan-caramel', 'sponge-cake-3-trung', 'sponge-cake-4-trung')
  AND "temperature_c" IS NULL;
