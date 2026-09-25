-- Chỉ thay lời giữ chỗ do seed cũ tạo; không ghi đè câu chuyện do quản trị viên biên tập.
WITH editorial (slug, story) AS (
  VALUES
    ('cookie-socola', $$Cuối thập niên 1930, Ruth Wakefield đưa bánh quy có mảnh sô-cô-la vào thực đơn Toll House; từ một món ăn kèm trà, chocolate chip cookie trở thành kiểu bánh quen thuộc trong nhiều căn bếp. Với mẻ bột nhiều bơ này, thời gian làm lạnh quan trọng hơn vẻ ngoài của từng viên bột: bánh cần đủ lạnh để không chảy tràn trên khay.$$),
    ('banh-quy-bo-tra-xanh', $$Vị trà xanh giúp chiếc bánh quy bơ bớt ngọt gắt, còn màu xanh thay đổi theo loại bột và nhiệt lò. Đây là bánh quy bắt bông hiện đại, không phải một loại bánh truyền thống Nhật Bản; hãy nhìn màu đáy và độ se mặt bánh thay vì chỉ chờ hết giờ.$$),
    ('banh-quy-bo-cranberry', $$Vị bơ và chút chua của nam việt quất khô tạo nên một chiếc bánh quy hợp với trà nóng. Tuy nhiên, danh sách mua hiện chưa có định lượng nam việt quất: đây mới là nền bánh bơ, chưa phải bộ nguyên liệu hoàn chỉnh cho món có quả khô.$$),
    ('cheesecake-khong-nuong', $$Cheesecake lạnh không cần lò; phần đế bánh quy giữ lớp kem phô mai mềm bên trên. Bản nguyên liệu này dùng gelatin để giữ dáng, nhưng “ba lá” chưa cho biết khối lượng và độ nở của từng lá, vì vậy kết cấu thực tế vẫn cần thử với đúng sản phẩm sẽ bán.$$),
    ('red-velvet-cake', $$Red velvet hấp dẫn ở sự đối lập: cốt bánh đỏ nâu, vị cacao nhẹ và lớp kem phô mai mát. Sắc đỏ đậm thường đến từ màu thực phẩm; tên “velvet” nhắc nhiều hơn đến cảm giác mềm mịn của cốt bánh. Làm cốt và kem thành hai chặng riêng sẽ dễ theo dõi hơn khi bắt đầu.$$),
    ('sponge-cake-3-trung', $$Bản ba trứng là cỡ nhỏ của bánh bông lan tách trứng: bọt khí trong lòng trắng giúp cốt nở nhẹ, dầu và sữa giúp ruột bánh đỡ khô. Khuôn nhỏ và thao tác gấp bột nhẹ tay quan trọng không kém định lượng.$$),
    ('sponge-cake-4-trung', $$Cùng kỹ thuật tách trứng với bản ba trứng, bản bốn trứng phù hợp khuôn rộng hơn. Tăng lượng nguyên liệu không có nghĩa tăng thời gian nướng theo cùng tỷ lệ; nên kiểm tra độ đàn hồi và que thử ở tâm bánh.$$),
    ('tiramisu', $$Tiramesù gắn với nhà hàng Le Beccherie ở Treviso, nơi công bố một công thức dùng lòng đỏ, đường, mascarpone, bánh savoiardi, cà phê và cacao. Danh sách nguyên liệu đang hiển thị ở đây là một biến thể khác, có kem tươi, cream cheese và rum; chưa thể gọi là bản gốc. Các bước làm sẽ được cập nhật cùng lúc với định lượng mới và phương án dùng trứng an toàn.$$),
    ('flan-caramel', $$Một cốc flan ngon thường có mặt mịn, tâm mềm và lớp caramel chảy xuống khi úp khuôn. Khác với crème brûlée có mặt đường giòn, caramel của flan nằm dưới đáy cốc lúc nướng rồi trở thành nước xốt khi dọn lên đĩa.$$),
    ('mousse-socola-dau-tay', $$Hai lớp sô-cô-la và dâu tây dựa vào cùng một nguyên lý: giữ không khí trong kem đánh bông để món tráng miệng nhẹ hơn ganache. Bản định lượng hiện còn trứng chưa được giải thích vai trò và loại gelatin chưa rõ, nên chưa thể viết một quy trình an toàn, nhất quán cho cả hai lớp.$$),
    ('banh-mi-sua-hokkaido', $$Mẻ bánh mì sữa này dùng cả sữa tươi, sữa bột và kem tươi để tạo vị sữa rõ và ruột mềm. Công thức hiện không nấu bột tangzhong, vì vậy đây là bánh mì sữa mềm chứ không phải lời hứa về kỹ thuật bánh mì sữa Hokkaido.$$),
    ('croissant', $$Croissant nhiều lớp chỉ hình thành khi khối bột và bơ cán được gấp, nghỉ lạnh rồi cán lại có kiểm soát. Danh sách hiện chỉ có bơ trộn trong bột, chưa có phần bơ cán; viết một quy trình croissant hoàn chỉnh lúc này sẽ khiến người làm không có đủ nguyên liệu.$$),
    ('papparoti', $$Bánh mì cà phê nhân bơ hấp dẫn bởi hai kết cấu đi cùng nhau: vỏ bánh mì mềm và lớp phủ cà phê nứt giòn khi vừa ra lò. “PappaRoti” là tên thương hiệu khác; công thức này sẽ cần đổi sang tên mô tả trước khi dùng như một bài công thức riêng của Bếp Đủ Bánh.$$)
)
UPDATE "recipes" AS recipe
SET "story" = editorial.story
FROM editorial
WHERE recipe.slug = editorial.slug
  AND recipe.story LIKE 'Dữ liệu thành phần và dụng cụ được nhập từ tài liệu “Nguyên liệu.docx”%';

-- Bước mới chỉ chèn nếu món hiện chưa có bước nào, để giữ nguyên mọi chỉnh sửa cũ.
WITH step_data (slug, step_number, title, instruction, duration_minutes, temperature_c) AS (
  VALUES
    ('banh-quy-bo-tra-xanh', 1, 'Chuẩn bị bột khô và lò', $$Làm nóng lò ở 155°C. Rây chung 140 g bột mì, 30 g bột ngô và 15 g bột trà xanh để bột không còn vón.$$, NULL, 155),
    ('banh-quy-bo-tra-xanh', 2, 'Đánh bơ', $$Đánh 160 g bơ mềm với 100 g đường đến khi mịn và nhạt màu. Cho 1 quả trứng và 3 ml vani vào, trộn vừa hòa quyện.$$, 8, NULL),
    ('banh-quy-bo-tra-xanh', 3, 'Bắt hình và làm lạnh', $$Trộn bột khô vào hỗn hợp bơ đến khi hết vệt bột. Cho vào túi gắn đui 1M, bắt khoảng 30–32 chiếc lên khay lót giấy nến. Nếu bột mềm, làm lạnh khay 10–15 phút trước khi nướng.$$, 15, NULL),
    ('banh-quy-bo-tra-xanh', 4, 'Nướng và làm nguội', $$Nướng từng khay ở 155°C; bắt đầu kiểm tra sau 15 phút. Lấy ra khi mặt bánh khô, đáy vàng rất nhẹ; thời gian thực tế có thể tới 20 phút tùy kích thước bánh và lò. Để bánh nguội trên khay rồi chuyển ra giá.$$, 20, 155),
    ('red-velvet-cake', 1, 'Chuẩn bị hai khuôn và sữa chua', $$Làm nóng lò ở 170°C. Lót giấy nến cho hai khuôn tròn 20–22 cm. Khuấy 15 ml giấm hoặc nước cốt chanh vào 240 ml sữa, để khoảng 10 phút; giữ 5 ml acid còn lại cho muối nở.$$, 10, 170),
    ('red-velvet-cake', 2, 'Trộn phần cốt', $$Rây 240 g bột mì, 5 g bột nở và 20 g cacao. Đánh 120 g bơ mềm với 170 g đường, thêm lần lượt 2 quả trứng, 5 ml vani và 30 ml màu đỏ. Cho hỗn hợp bột vào xen kẽ với phần sữa chua, trộn vừa hết vệt bột.$$, NULL, NULL),
    ('red-velvet-cake', 3, 'Nướng cốt bánh', $$Trộn 5 g muối nở với 5 ml acid còn lại, cho ngay vào bột rồi chia đều hai khuôn. Nướng ở 170°C và kiểm tra từ phút 25; tăm cắm giữa cốt rút ra không còn bột ướt. Để cốt nguội hoàn toàn trước khi phủ kem.$$, 30, 170),
    ('red-velvet-cake', 4, 'Đánh kem phô mai', $$Đánh mịn 250 g cream cheese với 150 g mascarpone, 70 g đường hạt mịn và 5 ml vani. Đánh riêng 200 ml kem tươi lạnh đến chóp mềm, sau đó nhẹ tay trộn vào phần phô mai. Giữ lạnh nếu chưa dùng ngay.$$, NULL, NULL),
    ('red-velvet-cake', 5, 'Ghép lớp', $$Khi cốt đã nguội, phết kem giữa hai lớp và phủ mặt bánh. Làm lạnh để kem ổn định trước khi cắt; nếu đổi số khẩu phần hoặc cỡ khuôn, cần kiểm tra lại độ dày cốt và thời gian nướng.$$, NULL, NULL),
    ('banh-mi-sua-hokkaido', 1, 'Trộn và nhồi bột', $$Trộn 540 g bột bánh mì, 60 g bột bánh ngọt, 10 g men, 30 g sữa bột và 80 g đường. Thêm 60 g trứng, 250 g sữa và 150 g kem tươi; nhồi đến khi bột kết dính, rồi thêm 8 g muối và nhồi tiếp đến khi bột mịn, đàn hồi. Không cần nấu tangzhong.$$, 25, NULL),
    ('banh-mi-sua-hokkaido', 2, 'Ủ lần một', $$Đậy kín khối bột, ủ nơi ấm vừa khoảng 60–90 phút đến khi nở rõ, gần gấp đôi. Thời gian phụ thuộc nhiệt độ phòng và hoạt tính men; tránh đặt bột ở nơi quá nóng.$$, 90, NULL),
    ('banh-mi-sua-hokkaido', 3, 'Tạo hình và ủ lần hai', $$Ấn nhẹ để xả bớt khí, tạo hình một ổ lớn hoặc chia bánh nhỏ và đặt vào khuôn/khay phù hợp. Đậy lại, ủ thêm khoảng 45–60 phút đến khi bột nở đầy đặn; không ép thời gian nếu bột còn đặc.$$, 60, NULL),
    ('banh-mi-sua-hokkaido', 4, 'Nướng và làm nguội', $$Làm nóng lò ở 170°C. Nướng đến khi mặt vàng và ruột chín; với ổ lớn bắt đầu kiểm tra sau khoảng 25–30 phút, bánh nhỏ cần kiểm tra sớm hơn. Để bánh trên giá đến khi nguội bớt rồi mới cắt. Sữa hoặc trứng quét mặt chỉ là tùy chọn nếu còn dư từ mẻ bột.$$, 30, 170)
)
INSERT INTO "recipe_steps" ("recipe_id", "step_number", "title", "instruction", "duration_minutes", "temperature_c")
SELECT recipe.id, step_data.step_number, step_data.title, step_data.instruction, step_data.duration_minutes, step_data.temperature_c
FROM step_data
JOIN "recipes" AS recipe ON recipe.slug = step_data.slug
WHERE NOT EXISTS (SELECT 1 FROM "recipe_steps" existing WHERE existing.recipe_id = recipe.id)
ON CONFLICT ("recipe_id", "step_number") DO NOTHING;

-- Chỉ hiệu chỉnh bản hướng dẫn cookie-socola mặc định cũ, không sửa bước quản trị viên đã viết lại.
WITH revised (step_number, old_instruction, title, instruction, duration_minutes, temperature_c) AS (
  VALUES
    (1, $$Đánh bơ mềm với đường đến khi hỗn hợp hòa đều, sau đó thêm trứng và trộn vừa đủ.$$, 'Chuẩn bị lò và bơ đường', $$Làm nóng lò ở 175°C, lót giấy nến cho khay. Đánh 165 g bơ mềm với 80 g đường trắng và 80 g đường nâu đến khi hỗn hợp hòa đều.$$, NULL, 175),
    (2, $$Trộn bột mì vào hỗn hợp bơ, cuối cùng gấp sô-cô-la đen vào. Không trộn quá lâu.$$, 'Trộn bột bánh', $$Cho lần lượt 2 quả trứng và 10 ml vani vào phần bơ. Rây 150 g bột mì với 3 g muối nở và 2 g muối, trộn vừa hết vệt bột; cuối cùng gấp 130 g sô-cô-la chip vào.$$, NULL, NULL),
    (3, $$Chia bột thành sáu phần, đặt cách nhau trên khay. Làm lạnh bột trong lúc làm nóng lò.$$, 'Làm lạnh và chia bánh', $$Làm lạnh bột ít nhất 20–30 phút vì tỷ lệ bơ trong mẻ này khá cao. Chia thành khoảng 25–30 viên nhỏ, đặt cách xa nhau trên khay; thử nướng một viên trước nếu bột có dấu hiệu chảy rộng.$$, 30, NULL),
    (4, $$Nướng đến khi rìa bánh vàng nhưng giữa còn mềm. Để bánh trên khay 10 phút trước khi chuyển ra giá.$$, 'Nướng và để ổn định', $$Nướng ở 175°C, bắt đầu kiểm tra sau 12 phút; lấy ra khi rìa vàng nhẹ còn giữa bánh mềm. Để trên khay 5–10 phút rồi chuyển lên giá. Số bánh thực tế phụ thuộc khối lượng mỗi viên và cần thử bếp để xác nhận.$$, 15, 175)
)
UPDATE "recipe_steps" AS step
SET "title" = revised.title,
    "instruction" = revised.instruction,
    "duration_minutes" = revised.duration_minutes,
    "temperature_c" = revised.temperature_c
FROM revised, "recipes" AS recipe
WHERE recipe.slug = 'cookie-socola'
  AND step.recipe_id = recipe.id
  AND step.step_number = revised.step_number
  AND step.instruction = revised.old_instruction;

UPDATE "recipes"
SET "temperature_c" = CASE slug
  WHEN 'banh-quy-bo-tra-xanh' THEN 155
  WHEN 'red-velvet-cake' THEN 170
  WHEN 'banh-mi-sua-hokkaido' THEN 170
  ELSE "temperature_c" END
WHERE slug IN ('banh-quy-bo-tra-xanh', 'red-velvet-cake', 'banh-mi-sua-hokkaido')
  AND "temperature_c" IS NULL;

UPDATE "recipes" SET "bake_minutes" = 20
WHERE slug = 'banh-quy-bo-tra-xanh' AND "bake_minutes" = 30;

UPDATE "recipes" SET "prep_minutes" = 180, "bake_minutes" = 30
WHERE slug = 'banh-mi-sua-hokkaido' AND "prep_minutes" = 210 AND "bake_minutes" = 0;
