-- Chỉ đổi tên trong câu chuyện mẫu đúng nguyên văn; không ghi đè nội dung đã biên tập.
UPDATE "recipes"
SET "story" = $$Bánh mì cà phê nhân bơ hấp dẫn bởi hai kết cấu đi cùng nhau: vỏ bánh mì mềm và lớp phủ cà phê nứt giòn khi vừa ra lò. “PappaRoti” là tên thương hiệu khác; công thức này sẽ cần đổi sang tên mô tả trước khi dùng như một bài công thức riêng của Một Mẻ Bánh.$$
WHERE "slug" = 'papparoti'
  AND "story" = $$Bánh mì cà phê nhân bơ hấp dẫn bởi hai kết cấu đi cùng nhau: vỏ bánh mì mềm và lớp phủ cà phê nứt giòn khi vừa ra lò. “PappaRoti” là tên thương hiệu khác; công thức này sẽ cần đổi sang tên mô tả trước khi dùng như một bài công thức riêng của Bếp Đủ Bánh.$$;
