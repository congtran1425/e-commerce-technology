import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function StoryPage() {
  return (
    <article className="story-page page-frame">
      <header className="story-letter">
        <p className="story-letter__date">Một lời chào từ Bếp Đủ Bánh</p>
        <h1>Chào bạn,</h1>
        <p>Có những lúc ta chỉ muốn làm một chiếc bánh cho vài người, nhưng trước khi bật lò đã phải tự đổi đơn vị, dò từng nguyên liệu và đoán xem nên mua gói nào.</p>
      </header>

      <section className="story-prose" aria-labelledby="story-problem-heading">
        <h2 id="story-problem-heading">Bếp Đủ Bánh bắt đầu từ món bạn muốn làm.</h2>
        <p>Thay vì đưa bạn đến trước một kệ hàng thật dài, chúng tôi bắt đầu bằng một câu hỏi gần gũi hơn: hôm nay bạn muốn làm món bánh nào? Từ món bánh và số người cùng ăn, Bếp Đủ Bánh giúp tính lại định lượng, chỉ ra dụng cụ cần có và ghép chúng với những quy cách đang bán.</p>
        <p>Bạn vẫn là người quyết định. Một chiếc phới đã có sẵn có thể được bỏ khỏi danh sách; một nguyên liệu chưa muốn mua có thể được xem lại. Giỏ hàng là lời gợi ý có giải thích, không phải một chiếc hộp đóng sẵn buộc mọi căn bếp phải giống nhau.</p>
      </section>

      <div className="story-break" aria-hidden="true">* * *</div>

      <section className="story-prose" aria-labelledby="story-enough-heading">
        <h2 id="story-enough-heading">“Đủ” không có nghĩa là thật nhiều.</h2>
        <p>Đủ là biết một mẻ bánh cần bao nhiêu, gói hàng nào phù hợp và sau khi làm có thể còn dư gì. Đủ cũng là nhận ra dụng cụ nào bắt buộc, dụng cụ nào chỉ giúp thao tác thuận tiện hơn. Chúng tôi muốn những con số ấy được trình bày rõ ràng để người mới không bị ngợp và người đã quen làm bánh không phải mất công tính lại.</p>
        <p>Một công thức tốt không kết thúc ở danh sách nguyên liệu. Nó cần nói bánh sẽ trông ra sao khi đạt, vì sao phải làm lạnh bột, lúc nào nên dừng đánh kem và điều gì có thể cứu một mẻ bánh chưa như ý.</p>
      </section>

      <div className="story-break" aria-hidden="true">* * *</div>

      <section className="story-prose" aria-labelledby="story-honesty-heading">
        <h2 id="story-honesty-heading">Căn bếp cần sự chân thật.</h2>
        <p>Bếp Đủ Bánh không hứa rằng mọi mẻ bánh sẽ hoàn hảo ngay lần đầu. Nhiệt của mỗi chiếc lò, độ ẩm của bột và kinh nghiệm của mỗi người đều khác nhau. Vì vậy, công thức phải có dấu hiệu nhận biết bên cạnh thời gian và nhiệt độ; phần nào chưa được kiểm chứng sẽ được ghi rõ thay vì lấp đầy bằng một con số có vẻ thuyết phục.</p>
        <p>Website này vừa là cửa hàng, vừa là một cuốn sổ có thể đọc chậm. Câu chuyện khơi mở sự tò mò, công thức giúp bạn tự tin bắt đầu, còn danh sách mua hàng thu ngắn quãng đường từ “muốn làm” đến lúc thật sự bước vào bếp.</p>
      </section>

      <footer className="story-signoff">
        <p>Chọn một món bánh. Phần chuẩn bị, để Bếp Đủ Bánh cùng bạn làm cho rõ ràng.</p>
        <Link className="text-link" to="/cong-thuc">Chọn món bánh đầu tiên <ArrowRight aria-hidden="true" size={16} /></Link>
      </footer>
    </article>
  );
}
