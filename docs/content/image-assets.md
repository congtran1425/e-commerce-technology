# Ảnh nội dung: nơi lưu và danh sách tiếp nhận

Trạng thái: Đã sắp xếp tệp, ánh xạ vào mã nguồn và cập nhật PostgreSQL cục bộ; **chưa commit, chưa triển khai và chưa xác minh điều khoản của công cụ đã tạo 12 ảnh đầu**  
Cập nhật: 2026-09-17

## Ảnh vừa tiếp nhận

Ngày 2026-09-17, 12 tệp PNG được chuyển nguyên vẹn từ thư mục gốc repository vào `apps/web/public/images/recipes/thumbnails/`. Tất cả đều 352 × 352 px, tổng 2.420.324 byte (khoảng 2,31 MiB). Mã băm SHA-256 đã được so sánh trước và sau khi chuyển; không có tệp nào bị đổi nội dung.

```text
chocolate-chip-cookies.png
chocolate-strawberry-mousse.png
cranberry-butter-cookies.png
croissant.png
flan-caramel.png
hokkaido-milk-bread.png
matcha-meltaways-cookies.png
no-bake-cheesecake.png
papparoti-coffee-bun.png
red-velvet-cake.png
sponge-cake.png
tiramisu.png
```

Chủ dự án xác nhận 12 ảnh do AI tạo, không lấy từ nguồn bên thứ ba. Đây là thông tin xuất xứ do chủ dự án cung cấp; điều khoản sử dụng của công cụ tạo 12 ảnh này chưa được kiểm tra độc lập. Giấy phép MIT của mã nguồn không tự động xác lập quyền đối với ảnh.

Ảnh thứ 13, `basque-cheesecake.png` (1254 × 1254 px, 2.182.624 byte), được tạo mới bằng công cụ tạo ảnh tích hợp ngày 2026-09-17. Chỉ dẫn tạo ảnh: một chiếc Basque cheesecake cháy cạnh, một miếng cắt đặt cạnh để thấy ruột bánh, chụp như ảnh món ăn tự nhiên trên đĩa gốm sáng trong ánh sáng ấm, toàn bộ bánh và đĩa nằm trong khung vuông, không chữ hoặc nhãn. Đây là ảnh minh họa, không phải ảnh chụp thành phẩm của công thức trên website.

12 ảnh đầu đã được ánh xạ theo `slug` của công thức trong `apps/api/prisma/recipe-seed-data.ts`; `seed.ts` dùng đường dẫn khi tạo công thức mới, còn migration `20260917120000_assign_recipe_thumbnails` chỉ điền đường dẫn cho công thức hiện có nếu `image_url` đang trống. Hai công thức bánh bông lan 3 trứng và 4 trứng dùng chung `sponge-cake.png`. Basque cheesecake dùng `basque-cheesecake.png` qua dữ liệu khởi tạo và migration `20260917130000_assign_basque_recipe_image`, cũng chỉ điền khi đường dẫn đang trống.

Đường dẫn ảnh có dạng `/images/recipes/thumbnails/flan-caramel.png` hoặc `/images/recipes/basque-cheesecake.png`, được trình duyệt lấy từ miền frontend. Cả hai migration ảnh đã được áp dụng vào PostgreSQL cục bộ ngày 2026-09-17: 14/14 công thức có ảnh. Database ở môi trường khác cũng cần các migration tương ứng; phải commit ảnh và triển khai lại frontend thì ảnh mới xuất hiện trên bản production.

### Giới hạn kích thước

Ba bối cảnh dùng cùng tài sản ảnh với kích thước trình bày khác nhau: trang chủ giữ ảnh công thức trong khung vuông rộng tối đa 448 px; trang danh sách dùng ảnh vuông theo độ rộng thẻ; trang chi tiết hiển thị trọn ảnh theo tỉ lệ tự nhiên, ảnh 352 px rộng tối đa 352 px và ảnh Basque rộng tối đa 480 px. Không dùng `object-fit: cover` để cắt mất đáy bánh. Những ảnh nguồn 352 × 352 px vẫn chỉ là ảnh nhỏ; khi cần ảnh bìa lớn, cung cấp ảnh gốc độ phân giải cao hơn, không phóng giả thành ảnh chất lượng cao. Câu chú thích AI trên giao diện đã được bỏ theo yêu cầu của chủ dự án; thông tin xuất xứ vẫn lưu trong tài liệu này.

## Nơi lưu được đề xuất hiện tại

**Ảnh công thức tĩnh do chủ dự án chọn:** tiếp tục lưu trong `apps/web/public/images/recipes/`, commit cùng mã nguồn sau khi xác minh quyền dùng. Vite sao chép `public` vào bản build; Vercel phục vụ tệp tĩnh từ miền frontend qua CDN. Khi chuyển frontend sang VPS, cùng thư mục ảnh sẽ nằm trong `dist` và có thể được web server phục vụ trực tiếp. 13 ảnh hiện tại chiếm khoảng 4,39 MiB nên chưa có lý do kỹ thuật để thêm một host riêng; riêng ảnh Basque PNG hơn 2 MiB cần được tối ưu định dạng trước khi lượng truy cập tăng.

**Ảnh tải lên khi website đang chạy:** không ghi vào source hoặc thư mục `dist`. Khi làm chức năng tải ảnh của quản trị viên, dùng dịch vụ lưu trữ đối tượng (object storage) hoặc một ổ đĩa bền vững ngoài bản triển khai, với sao lưu, kiểm tra loại/kích thước tệp, đổi tên an toàn và quyền truy cập rõ ràng. Database chỉ lưu đường dẫn/khóa tệp, không lưu ảnh nhị phân vào PostgreSQL.

Tài liệu Vite: [Static Asset Handling](https://vite.dev/guide/assets). Tài liệu Vercel: [CDN Cache](https://vercel.com/docs/caching/cdn-cache).

## Có nên dùng hosting miễn phí iNET để chứa ảnh?

**Chưa nên chuyển 12 ảnh này sang iNET.** Lợi ích lưu trữ nhỏ, nhưng sẽ phát sinh thêm một nơi phải quản lý URL, SSL, hạn sử dụng, sao lưu và bộ nhớ đệm. Đặc biệt, “free hosting” có thể là quà tặng hoặc gói dùng thử có thời hạn; không thể suy ra điều khoản gói của chủ dự án từ trang giới thiệu công khai. Hiện iNET công bố gói dùng thử Cloud Hosting 7 ngày, quà tặng website/hosting đi kèm tên miền có thể miễn phí 1 tháng, và Object Storage có bản thử 7 ngày; **đây không phải bằng chứng rằng gói cụ thể của chủ dự án hết hạn vào các mốc đó**.

Trước khi cân nhắc dùng iNET như nơi phục vụ ảnh lâu dài, kiểm tra trong portal/hợp đồng:

1. Tên gói chính xác, ngày hết hạn và phí sau ưu đãi.
2. Dung lượng, băng thông/lưu lượng, giới hạn số tệp và chính sách tự xóa/tạm ngưng.
3. Có hỗ trợ HTTPS và tên miền phụ riêng như `assets.<tên-miền>` không.
4. Có cho phép **hotlink** (website Vercel nhúng ảnh từ host iNET) hay chính sách chống dùng ảnh từ miền khác chặn yêu cầu.
5. Có thể đặt `Cache-Control`, kiểu nội dung đúng cho WebP/AVIF, và có sao lưu/khôi phục hay không.
6. Có FTP/SFTP hoặc API tải lên an toàn không; không đặt thông tin FTP trong frontend hay Git.

Nếu gói iNET thực sự lâu dài, có HTTPS và cho phép nhúng ảnh từ miền Vercel, có thể dùng thử một ảnh không nhạy cảm bằng URL công khai rồi đo tốc độ. Tuy nhiên, với ảnh cố định, Vercel vẫn là mặc định đơn giản hơn. Nếu sau này cần tải ảnh động, so sánh iNET Object Storage với R2/S3 theo chi phí và điều khoản thực tế; shared web hosting không đương nhiên tương đương object storage.

Nguồn iNET: [Cloud Hosting](https://inet.vn/hosting/web-hosting), [ưu đãi website/hosting đi kèm tên miền](https://inet.vn/tld/new-gtld), [Object Storage](https://inet.vn/object-storage), [hướng dẫn tải tệp lên hosting](https://helpdesk.inet.vn/knowledgebase/huong-dan-upload-file-len-tren-hosting-thong-qua-cpanel-va-filezilla).

## Việc còn lại trước khi hiển thị ảnh trên production

- Kiểm tra điều khoản của công cụ AI đã tạo ảnh nếu cần dùng ảnh công khai hoặc thương mại.
- Rà lại ánh xạ tên tệp với 13 công thức được nhập; hai công thức bánh bông lan chia sẻ một ảnh. Không gán ảnh bánh cho sản phẩm nguyên liệu/dụng cụ.
- API công thức cho phép đường dẫn bắt đầu bằng `/` theo hợp đồng `uri-reference`; biểu mẫu quản trị **sản phẩm** vẫn nhận URL tuyệt đối và chưa bị thay đổi.
- Cung cấp ảnh lớn thật cho các công thức còn dùng ảnh 352 px; ảnh Basque đã có ảnh lớn nhưng cần bản mã hóa nhẹ hơn cho thiết bị di động.
- Sau khi kiểm thử trên trình duyệt, commit ảnh và mã nguồn, áp dụng migration lên database production và triển khai lại frontend. Không cần chạy toàn bộ seed chỉ để cập nhật ảnh vì seed cũng thay đổi tài khoản mẫu và dữ liệu khác.
