-- Chỉ điền ảnh cho Basque cheesecake nếu chưa có ảnh do quản trị viên chọn.
UPDATE "recipes"
SET "image_url" = '/images/recipes/basque-cheesecake.png'
WHERE "slug" = 'basque-cheesecake' AND "image_url" IS NULL;
