import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RecipeCard } from '../../features/recipes/RecipeCard';
import { fetchRecipes } from '../../features/recipes/api';
import type { RecipeSummary } from '../../features/recipes/types';

export function HomePage() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    fetchRecipes(controller.signal)
      .then((data) => {
        setRecipes(data);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      <section className="home-intro page-frame">
        <div className="home-intro__copy">
          <p className="kicker">Công thức để làm · Nguyên liệu để bắt đầu</p>
          <h1>Chọn chiếc bánh trước. Căn bếp sẽ đầy lên sau.</h1>
        </div>
        <p className="home-intro__note">
          Mỗi công thức được tính lại theo số người bạn muốn làm, rồi ghép với quy cách nguyên liệu vừa đủ.
          <Link className="text-link" to="/cong-thuc">Mở sổ công thức <ArrowRight aria-hidden="true" size={16} /></Link>
        </p>
      </section>

      <section className="home-path page-frame" aria-labelledby="home-path-heading">
        <div>
          <p className="kicker">Từ ý định đến căn bếp</p>
          <h2 id="home-path-heading">Không bắt đầu bằng một kệ hàng.</h2>
        </div>
        <ol>
          <li><span>01</span><p>Chọn món bánh phù hợp với thời gian và mức độ quen tay.</p></li>
          <li><span>02</span><p>Đổi số phần hoặc số bánh; định lượng được tính lại theo tỉ lệ.</p></li>
          <li><span>03</span><p>Giữ món cần mua, bỏ dụng cụ đã có rồi mới đưa vào giỏ.</p></li>
        </ol>
      </section>

      <section className="recipe-catalogue page-frame" aria-labelledby="recipe-heading">
        <div className="section-heading">
          <h2 id="recipe-heading">Hai món để bắt đầu</h2>
          <div><p>Trang chủ chỉ giữ một lựa chọn ngắn. Toàn bộ bộ sưu tập nằm trong sổ công thức riêng.</p><Link className="text-link" to="/cong-thuc">Xem tất cả công thức <ArrowRight aria-hidden="true" size={16} /></Link></div>
        </div>

        {status === 'loading' ? (
          <div className="recipe-list" aria-label="Đang tải công thức" aria-busy="true">
            <div className="recipe-skeleton" />
            <div className="recipe-skeleton" />
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="message-block" role="alert">
            <h2>Chưa tải được công thức.</h2>
            <p>Hãy kiểm tra API cục bộ rồi tải lại trang.</p>
          </div>
        ) : null}

        {status === 'ready' && recipes.length === 0 ? (
          <div className="message-block">
            <h2>Chưa có công thức được xuất bản.</h2>
            <p>Chạy dữ liệu mẫu để bắt đầu kiểm tra danh mục.</p>
          </div>
        ) : null}

        {status === 'ready' && recipes.length > 0 ? (
          <div className="recipe-list">
            {recipes.slice(0, 2).map((recipe, index) => (
              <RecipeCard key={recipe.slug} recipe={recipe} index={index} />
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
