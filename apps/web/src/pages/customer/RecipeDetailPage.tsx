import { Check, ChefHat, Clock3, Minus, Plus, ShoppingBasket, Thermometer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../../features/cart/CartContext';
import { fetchRecipe } from '../../features/recipes/api';
import type { RecipeDetail } from '../../features/recipes/types';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

function trimQuantity(value: string) {
  return Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 3 });
}

export function RecipeDetailPage() {
  const { slug = '' } = useParams();
  const { addItems } = useCart();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [servings, setServings] = useState<number | null>(null);
  const [ownedTools, setOwnedTools] = useState<Set<string>>(() => new Set());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    fetchRecipe(slug, servings ?? undefined, controller.signal)
      .then((data) => {
        setRecipe(data);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, [servings, slug]);

  const selectedServings = servings ?? recipe?.servings ?? 1;
  const estimatedTotal = useMemo(() => {
    if (!recipe) return 0;
    const ingredientTotal = recipe.ingredients.reduce(
      (total, item) => total + Number(item.recommendation?.totalPrice ?? 0),
      0,
    );
    const toolTotal = recipe.tools.reduce(
      (total, tool) => total + (ownedTools.has(tool.id) ? 0 : Number(tool.product?.price ?? 0)),
      0,
    );
    return ingredientTotal + toolTotal;
  }, [ownedTools, recipe]);

  function toggleOwnedTool(toolId: string) {
    setOwnedTools((current) => {
      const next = new Set(current);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
    setCartMessage('');
  }

  function addPlanToCart() {
    if (!recipe) return;

    const ingredientItems = recipe.ingredients.flatMap((ingredient) =>
      ingredient.recommendation?.packages.map((item) => ({
        variantId: item.id,
        name: ingredient.name,
        label: item.label,
        quantity: item.count,
        unitPrice: Number(item.price),
        currency: 'VND',
      })) ?? [],
    );
    const toolItems = recipe.tools.flatMap((tool) =>
      !ownedTools.has(tool.id) && tool.product
        ? [{
            variantId: tool.product.variantId,
            name: tool.product.name,
            label: tool.product.label,
            quantity: 1,
            unitPrice: Number(tool.product.price),
            currency: tool.product.currency,
          }]
        : [],
    );

    addItems([...ingredientItems, ...toolItems]);
    setCartMessage(`Đã thêm nguyên liệu và dụng cụ cho ${selectedServings} người vào giỏ.`);
  }

  if (status === 'loading' && !recipe) {
    return <div className="detail-loading page-frame" aria-busy="true">Đang chuẩn bị công thức…</div>;
  }

  if (status === 'error' || !recipe) {
    return (
      <div className="message-block page-frame" role="alert">
        <h1>Chưa mở được công thức.</h1>
        <p>API chưa phản hồi hoặc công thức không tồn tại.</p>
        <Link className="text-link" to="/">Trở về danh sách</Link>
      </div>
    );
  }

  return (
    <article className="recipe-detail">
      <header className="recipe-hero page-frame">
        <div className="recipe-hero__copy">
          <Link className="back-link" to="/">Danh sách công thức</Link>
          <h1>{recipe.title}</h1>
          <p className="recipe-deck">{recipe.summary}</p>
          <dl className="recipe-facts">
            <div><dt><Clock3 aria-hidden="true" size={18} /> Thời gian</dt><dd>{recipe.totalMinutes} phút</dd></div>
            <div><dt><Thermometer aria-hidden="true" size={18} /> Nhiệt độ</dt><dd>{recipe.temperatureC ? `${recipe.temperatureC}°C` : 'Không dùng lò'}</dd></div>
            <div><dt><ChefHat aria-hidden="true" size={18} /> Độ khó</dt><dd>{recipe.difficultyLabel}</dd></div>
          </dl>
        </div>
        <div className="recipe-hero__media">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.title} width="900" height="1080" fetchPriority="high" />
          ) : (
            <div className="image-placeholder image-placeholder--portrait" aria-hidden="true">
              <span>Ảnh thành phẩm</span><small>Tỉ lệ 4:5 · sẽ bổ sung</small>
            </div>
          )}
        </div>
      </header>

      <section className="recipe-story page-frame">
        <p className="kicker">Chuyện của món bánh</p>
        <p>{recipe.story}</p>
      </section>

      <section className="method page-frame" aria-labelledby="method-heading">
        <div className="method__heading">
          <p className="kicker">Cách làm</p>
          <h2 id="method-heading">Từng bước, không vội.</h2>
        </div>
        <ol className="method__steps">
          {recipe.steps.map((step) => (
            <li key={step.id}>
              <span>{String(step.stepNumber).padStart(2, '0')}</span>
              <div>
                {step.title ? <h3>{step.title}</h3> : null}
                <p>{step.instruction}</p>
                {step.durationMinutes || step.temperatureC ? (
                  <small>
                    {step.durationMinutes ? `${step.durationMinutes} phút` : ''}
                    {step.durationMinutes && step.temperatureC ? ' · ' : ''}
                    {step.temperatureC ? `${step.temperatureC}°C` : ''}
                  </small>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="planner page-frame" aria-labelledby="planner-heading">
        <div className="planner__intro">
          <p className="kicker">Tính vừa đủ cho căn bếp</p>
          <h2 id="planner-heading">Bạn làm cho bao nhiêu người?</h2>
          <p>Định lượng và số gói bên dưới thay đổi cùng khẩu phần.</p>
          <div className="serving-stepper" aria-label="Chọn số người">
            <button
              type="button"
              onClick={() => setServings(Math.max(1, selectedServings - 1))}
              disabled={selectedServings <= 1 || status === 'loading'}
              aria-label="Giảm một người"
            ><Minus aria-hidden="true" size={20} /></button>
            <output aria-live="polite"><strong>{selectedServings}</strong><span>người</span></output>
            <button
              type="button"
              onClick={() => setServings(Math.min(50, selectedServings + 1))}
              disabled={selectedServings >= 50 || status === 'loading'}
              aria-label="Tăng một người"
            ><Plus aria-hidden="true" size={20} /></button>
          </div>
        </div>

        <div className="planner__content" aria-busy={status === 'loading'}>
          <section className="plan-section">
            <h3>Nguyên liệu</h3>
            <div className="plan-list">
              {recipe.ingredients.map((ingredient) => (
                <div className="ingredient-row" key={ingredient.id}>
                  <div>
                    <h4>{ingredient.name}</h4>
                    <p>Cần {trimQuantity(ingredient.requiredQuantity)} {ingredient.unit}</p>
                  </div>
                  {ingredient.recommendation ? (
                    <div className="package-choice">
                      {ingredient.recommendation.packages.map((item) => (
                        <p key={item.id}><strong>{item.count} × {item.label}</strong><span>{money.format(Number(item.price) * item.count)}</span></p>
                      ))}
                      <small>Dư {trimQuantity(ingredient.recommendation.surplusQuantity)} {ingredient.unit}</small>
                    </div>
                  ) : (
                    <p className="stock-note">Chưa đủ hàng cho định lượng này.</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="plan-section">
            <h3>Dụng cụ</h3>
            <div className="tool-list">
              {recipe.tools.map((tool) => {
                const isOwned = ownedTools.has(tool.id);
                return (
                  <label className="tool-row" key={tool.id}>
                    <input type="checkbox" checked={isOwned} onChange={() => toggleOwnedTool(tool.id)} />
                    <span className="tool-row__check"><Check aria-hidden="true" size={16} /></span>
                    <span><strong>{tool.name}</strong><small>{isOwned ? 'Sẽ không thêm vào giỏ' : tool.product ? `${tool.product.label} · ${money.format(Number(tool.product.price))}` : 'Chưa có hàng'}</small></span>
                    <em>Tôi đã có</em>
                  </label>
                );
              })}
            </div>
          </section>

          <aside className="cart-summary">
            <div><span>Tạm tính theo gợi ý</span><strong>{money.format(estimatedTotal)}</strong></div>
            <p>Giá và dữ liệu sản phẩm hiện dùng để minh họa luồng.</p>
            <button className="primary-button" type="button" onClick={addPlanToCart} disabled={status === 'loading'}>
              <ShoppingBasket aria-hidden="true" size={20} /> Thêm cả bộ vào giỏ
            </button>
            <p className="cart-feedback" aria-live="polite">{cartMessage}</p>
          </aside>
        </div>
      </section>
    </article>
  );
}
