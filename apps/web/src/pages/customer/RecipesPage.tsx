import { Search } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { RecipeCard } from '../../features/recipes/RecipeCard';
import { fetchRecipes } from '../../features/recipes/api';
import type { RecipeSummary } from '../../features/recipes/types';

type CategoryFilter = 'ALL' | RecipeSummary['category'];

const filters: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'COOKIE', label: 'Bánh quy' },
  { value: 'CAKE', label: 'Bánh ngọt' },
  { value: 'DESSERT', label: 'Tráng miệng' },
  { value: 'BREAD', label: 'Bánh mì' },
];

export function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase('vi'));

  useEffect(() => {
    const controller = new AbortController();
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

  const beginnerRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.difficulty === 'EASY').slice(0, 3),
    [recipes],
  );
  const visibleRecipes = useMemo(
    () => recipes.filter((recipe) => {
      const matchesCategory = category === 'ALL' || recipe.category === category;
      const matchesQuery = !deferredQuery
        || `${recipe.title} ${recipe.summary} ${recipe.categoryLabel}`.toLocaleLowerCase('vi').includes(deferredQuery);
      return matchesCategory && matchesQuery;
    }),
    [category, deferredQuery, recipes],
  );

  return (
    <div className="recipes-index page-frame">
      <header className="recipes-index__heading">
        <p className="kicker">Sổ công thức · {status === 'ready' ? `${recipes.length} món` : 'đang mở sổ'}</p>
        <h1>Chọn món theo nhịp của bạn.</h1>
        <p>Tìm một món để làm hôm nay, sau đó đổi số phần hoặc số bánh ngay trên trang công thức.</p>
      </header>

      {status === 'loading' ? (
        <div className="recipe-index-grid" aria-label="Đang tải công thức" aria-busy="true">
          {Array.from({ length: 6 }, (_, index) => <div className="recipe-skeleton" key={index} />)}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="message-block" role="alert">
          <h2>Chưa mở được sổ công thức.</h2>
          <p>API cục bộ chưa phản hồi. Hãy bật Docker và máy chủ API rồi tải lại trang.</p>
        </div>
      ) : null}

      {status === 'ready' && recipes.length === 0 ? (
        <div className="message-block">
          <h2>Sổ công thức đang trống.</h2>
          <p>Chạy dữ liệu mẫu để nhập bộ công thức đầu tiên.</p>
        </div>
      ) : null}

      {status === 'ready' && beginnerRecipes.length > 0 ? (
        <section className="recipe-rail" aria-labelledby="beginner-heading">
          <div className="recipe-rail__heading"><h2 id="beginner-heading">Dễ bắt đầu</h2><span>{beginnerRecipes.length} món</span></div>
          <div className="recipe-index-grid">
            {beginnerRecipes.map((recipe, index) => <RecipeCard key={recipe.slug} recipe={recipe} index={index} variant="index" />)}
          </div>
        </section>
      ) : null}

      {status === 'ready' && recipes.length > 0 ? (
        <section className="recipe-rail" aria-labelledby="all-recipes-heading">
          <div className="recipe-rail__heading"><h2 id="all-recipes-heading">Toàn bộ công thức</h2><span>{visibleRecipes.length} kết quả</span></div>
          <div className="recipe-filters">
            <label className="recipe-search">
              <span className="sr-only">Tìm công thức</span>
              <Search aria-hidden="true" size={18} />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên món hoặc loại bánh" />
            </label>
            <div className="recipe-filter-list" aria-label="Lọc theo loại bánh">
              {filters.map((filter) => (
                <button key={filter.value} type="button" aria-pressed={category === filter.value} onClick={() => setCategory(filter.value)}>{filter.label}</button>
              ))}
            </div>
          </div>

          {visibleRecipes.length > 0 ? (
            <div className="recipe-index-grid">
              {visibleRecipes.map((recipe, index) => <RecipeCard key={recipe.slug} recipe={recipe} index={index} variant="index" />)}
            </div>
          ) : (
            <div className="recipe-filter-empty" role="status">
              <h3>Không có món nào khớp.</h3>
              <p>Thử bỏ bớt từ khóa hoặc chọn “Tất cả”.</p>
              <button type="button" onClick={() => { setQuery(''); setCategory('ALL'); }}>Xóa bộ lọc</button>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
