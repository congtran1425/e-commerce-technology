import { useEffect, useState } from 'react';
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
        </p>
      </section>

      <section className="recipe-catalogue page-frame" aria-labelledby="recipe-heading">
        <div className="section-heading">
          <h2 id="recipe-heading">Mẻ bánh đầu tiên</h2>
          <p>Hai công thức minh họa để kiểm tra trọn vẹn luồng chọn món đến giỏ hàng.</p>
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
            {recipes.map((recipe, index) => (
              <RecipeCard key={recipe.slug} recipe={recipe} index={index} />
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
