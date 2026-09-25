-- Bổ sung bản nháp thao tác cho ba công thức đã có đủ nhóm nguyên liệu.
-- Không ghi đè bước do người quản trị đã biên tập.
WITH step_data (slug, step_number, title, instruction, duration_minutes, temperature_c) AS (
  VALUES
    ('flan-caramel', 1, 'Chuẩn bị cốc và lò', 'Làm nóng lò ở 160°C. Xếp 8–10 cốc sứ chịu nhiệt, mỗi cốc khoảng 100–120 ml, vào một khay sâu lòng.', NULL, 160),
    ('flan-caramel', 2, 'Làm caramel', 'Đun 70 g đường với một ít nước trên lửa vừa, không khuấy khi đường đang chuyển màu. Khi đường có màu hổ phách, nhấc khỏi bếp, thêm nước cốt chanh và chia ngay vào đáy cốc. Cẩn thận vì caramel rất nóng.', NULL, NULL),
    ('flan-caramel', 3, 'Pha phần sữa trứng', 'Làm ấm sữa và kem tươi, không đun sôi. Khuấy nhẹ 5 quả trứng với 70 g đường còn lại và vani; rót sữa ấm từ từ vào, vừa rót vừa khuấy. Lọc hỗn hợp qua rây và hớt bọt.', 10, NULL),
    ('flan-caramel', 4, 'Nướng cách thủy', 'Rót phần sữa trứng vào cốc. Đổ nước nóng vào khay đến khoảng nửa chiều cao cốc, tránh để nước rơi vào flan. Nướng và bắt đầu kiểm tra từ phút 25; phần rìa se lại nhưng giữa cốc còn rung nhẹ.', 35, 160),
    ('flan-caramel', 5, 'Làm lạnh trước khi dùng', 'Nhấc cốc ra khỏi khay nước, để nguội rồi đậy kín và làm lạnh ít nhất 4 giờ. Dùng dao mảnh đi quanh mép cốc trước khi úp ra đĩa.', 240, NULL),
    ('sponge-cake-3-trung', 1, 'Chuẩn bị khuôn nhỏ', 'Làm nóng lò ở 160°C. Chuẩn bị khuôn tròn 15–18 cm; lót giấy ở đáy nhưng không phết dầu lên thành khuôn để bột có chỗ bám khi nở.', NULL, 160),
    ('sponge-cake-3-trung', 2, 'Trộn lòng đỏ', 'Tách 3 quả trứng. Khuấy lòng đỏ với dầu ăn và sữa cho đều, sau đó rây bột mì và bột ngô vào; trộn đến khi không còn bột khô.', NULL, NULL),
    ('sponge-cake-3-trung', 3, 'Đánh lòng trắng', 'Đánh lòng trắng với cream of tartar và muối đến khi nổi bọt mịn. Thêm đường làm 3 lần, tiếp tục đánh đến chóp gần cứng, bóng và không tách nước.', NULL, NULL),
    ('sponge-cake-3-trung', 4, 'Trộn và nướng', 'Trộn một phần lòng trắng vào hỗn hợp lòng đỏ cho nhẹ bột, rồi nhẹ tay gấp phần còn lại. Rót vào khuôn, gõ nhẹ một lần để vỡ bọt khí lớn và nướng đến khi mặt đàn hồi, que thử rút ra khô; bắt đầu kiểm tra từ phút 25.', 35, 160),
    ('sponge-cake-3-trung', 5, 'Làm nguội', 'Lấy bánh ra và úp ngược khuôn trên giá thoáng cho đến khi nguội hẳn rồi mới gỡ bánh. Không tự tăng thời gian nướng theo số khẩu phần; nếu tăng mẻ, cần khuôn phù hợp.', NULL, NULL),
    ('sponge-cake-4-trung', 1, 'Chuẩn bị khuôn', 'Làm nóng lò ở 160°C. Chuẩn bị khuôn tròn 18–21 cm; lót giấy ở đáy nhưng không phết dầu lên thành khuôn.', NULL, 160),
    ('sponge-cake-4-trung', 2, 'Trộn lòng đỏ', 'Tách 4 quả trứng. Khuấy lòng đỏ với dầu ăn và sữa cho đều, sau đó rây bột mì và bột ngô vào; trộn đến khi không còn bột khô.', NULL, NULL),
    ('sponge-cake-4-trung', 3, 'Đánh lòng trắng', 'Đánh lòng trắng với cream of tartar và muối đến khi nổi bọt mịn. Thêm đường làm 3 lần, tiếp tục đánh đến chóp gần cứng, bóng và không tách nước.', NULL, NULL),
    ('sponge-cake-4-trung', 4, 'Trộn và nướng', 'Trộn một phần lòng trắng vào hỗn hợp lòng đỏ cho nhẹ bột, rồi nhẹ tay gấp phần còn lại. Rót vào khuôn, gõ nhẹ một lần để vỡ bọt khí lớn và nướng đến khi mặt đàn hồi, que thử rút ra khô; bắt đầu kiểm tra từ phút 25.', 35, 160),
    ('sponge-cake-4-trung', 5, 'Làm nguội', 'Úp ngược khuôn trên giá thoáng ngay khi lấy khỏi lò, chờ bánh nguội hoàn toàn rồi mới gỡ. Khuôn khác kích thước gợi ý có thể làm thay đổi thời gian nướng.', NULL, NULL)
)
INSERT INTO "recipe_steps" ("recipe_id", "step_number", "title", "instruction", "duration_minutes", "temperature_c")
SELECT recipe.id, step_data.step_number, step_data.title, step_data.instruction, step_data.duration_minutes, step_data.temperature_c
FROM step_data
JOIN "recipes" AS recipe ON recipe.slug = step_data.slug
ON CONFLICT ("recipe_id", "step_number") DO NOTHING;

-- Chỉ sửa lời ghi chú mặc định cũ; giữ nguyên chuyện món bánh do quản trị viên tự viết.
UPDATE "recipes"
SET "story" = replace(
  "story",
  'Phần hướng dẫn từng bước và câu chuyện món bánh chưa được cung cấp nên chưa được tự viết thêm.',
  'Các bước làm là bản biên soạn để tham khảo; chưa có mẻ thử bếp để xác nhận kết quả và thời gian thực tế.'
)
WHERE "slug" IN ('flan-caramel', 'sponge-cake-3-trung', 'sponge-cake-4-trung')
  AND "story" LIKE '%Phần hướng dẫn từng bước và câu chuyện món bánh chưa được cung cấp nên chưa được tự viết thêm.%';
