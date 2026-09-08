import { ArrowRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RecipeSummary } from './types';

export function RecipeCard({ recipe, index }: { recipe: RecipeSummary; index: number }) {
  return (
    <article className="recipe-card">
      <Link className="recipe-card__media" to={`/cong-thuc/${recipe.slug}`} aria-label={`Xem ${recipe.title}`}>
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} width="720" height="540" loading="lazy" />
        ) : (
          <div className="image-placeholder" aria-hidden="true">
            <span>Ảnh món bánh</span>
            <small>Sẽ bổ sung</small>
          </div>
        )}
      </Link>
      <div className="recipe-card__body">
        <p className="recipe-card__number">Công thức {String(index + 1).padStart(2, '0')}</p>
        <h2><Link to={`/cong-thuc/${recipe.slug}`}>{recipe.title}</Link></h2>
        <p>{recipe.summary}</p>
        <div className="recipe-card__meta">
          <span><Clock3 aria-hidden="true" size={16} /> {recipe.totalMinutes} phút</span>
          <span>{recipe.difficultyLabel}</span>
          <span>{recipe.baseServings} người</span>
        </div>
        <Link className="text-link" to={`/cong-thuc/${recipe.slug}`}>
          Chọn khẩu phần <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </article>
  );
}

