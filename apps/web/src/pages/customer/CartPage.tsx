import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Minus,
  PackageX,
  Plus,
  ShoppingBasket,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { quoteCart } from '../../features/cart/api';
import { useCart } from '../../features/cart/CartContext';
import type { CartItem } from '../../features/cart/cart-storage';
import type { CartQuote } from '../../features/cart/types';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

type QuoteStatus = 'idle' | 'checking' | 'loading' | 'ready' | 'error';

function formatMoney(value: string | number | null) {
  return value === null ? '—' : money.format(Number(value));
}

export function CartPage() {
  const { user } = useAuth();
  const { addItems, items, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>('idle');
  const [removedItem, setRemovedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setQuote(null);
      setQuoteStatus('idle');
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setQuoteStatus('loading');
      quoteCart(items, controller.signal)
        .then((nextQuote) => {
          setQuote(nextQuote);
          setQuoteStatus('ready');
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setQuoteStatus('error');
        });
    }, 180);

    setQuote(null);
    setQuoteStatus('checking');

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [items]);

  useEffect(() => {
    if (!removedItem) return undefined;

    const timer = window.setTimeout(() => setRemovedItem(null), 8_000);
    return () => window.clearTimeout(timer);
  }, [removedItem]);

  const quoteItemsByVariantId = useMemo(
    () => new Map(quote?.items.map((item) => [item.variantId, item]) ?? []),
    [quote],
  );

  function handleRemove(item: CartItem) {
    removeItem(item.variantId);
    setRemovedItem(item);
  }

  function undoRemove() {
    if (!removedItem) return;
    addItems([removedItem]);
    setRemovedItem(null);
  }

  const hasItems = items.length > 0;
  const isChecking = quoteStatus === 'checking' || quoteStatus === 'loading';
  const hasInventoryIssue = quote ? !quote.canCheckout : false;
  const canContinue = quoteStatus === 'ready' && quote?.canCheckout === true;
  const checkoutNote = quoteStatus === 'error'
    ? 'Cần kiểm tra lại giá và tồn kho trước khi tiếp tục.'
    : hasInventoryIssue
      ? 'Hãy sửa các mặt hàng chưa đủ kho trước khi tiếp tục.'
      : user
        ? 'Bước tiếp theo: kiểm tra địa chỉ giao hàng.'
        : 'Bạn sẽ đăng nhập trước khi nhập địa chỉ giao hàng.';

  return (
    <section className="cart-page page-frame" aria-labelledby="cart-heading">
      <header className="cart-page__heading">
        <p className="kicker">Giỏ cho mẻ bánh sắp tới</p>
        <h1 id="cart-heading">Giỏ hàng</h1>
        <p>{hasItems ? 'Xem lại từng gói trước khi đặt mua.' : 'Chọn một công thức, rồi thêm đủ thứ cần có cho mẻ bánh của bạn.'}</p>
      </header>

      {hasItems ? (
        <div className="cart-workbench">
          <section className="cart-items" aria-label="Các mặt hàng trong giỏ">
            <div className="cart-quote-status" aria-live="polite">
              {isChecking ? <><LoaderCircle aria-hidden="true" size={16} /> Đang kiểm tra giá và tồn kho…</> : null}
              {quoteStatus === 'ready' && !hasInventoryIssue ? <><CheckCircle2 aria-hidden="true" size={16} /> Giá và tồn kho vừa được đối chiếu.</> : null}
              {quoteStatus === 'error' ? <><AlertTriangle aria-hidden="true" size={16} /> Chưa kiểm tra lại được giỏ hàng. Hãy thử tải lại trước khi thanh toán.</> : null}
            </div>

            <ul className="cart-lines">
              {items.map((item) => {
                const serverItem = quoteItemsByVariantId.get(item.variantId);
                const maxQuantity = serverItem?.availableQuantity ?? 99;
                const cannotIncrease = serverItem?.status === 'UNAVAILABLE' || item.quantity >= maxQuantity;
                const hasIssue = serverItem?.status === 'INSUFFICIENT_STOCK' || serverItem?.status === 'UNAVAILABLE';
                const currentPrice = serverItem ? serverItem.unitPrice : item.unitPrice;
                const lineTotal = serverItem ? serverItem.lineTotal : item.unitPrice * item.quantity;

                return (
                  <li className="cart-line" data-has-issue={hasIssue ? 'true' : undefined} key={item.variantId}>
                    <div className="cart-line__identity">
                      <p>{serverItem?.productName ?? item.name}</p>
                      <small>{serverItem?.label ?? item.label}</small>
                      {serverItem?.status === 'INSUFFICIENT_STOCK' ? (
                        <span className="cart-line__issue"><AlertTriangle aria-hidden="true" size={15} /> Chỉ còn {serverItem.availableQuantity} gói.</span>
                      ) : null}
                      {serverItem?.status === 'UNAVAILABLE' ? (
                        <span className="cart-line__issue"><PackageX aria-hidden="true" size={15} /> Quy cách này không còn được bán.</span>
                      ) : null}
                    </div>

                    <div className="cart-line__actions">
                      <div className="cart-quantity" role="group" aria-label={`Số lượng ${serverItem?.productName ?? item.name}`}>
                        <button
                          type="button"
                          aria-label={`Giảm số lượng ${serverItem?.productName ?? item.name}`}
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        ><Minus aria-hidden="true" size={18} /></button>
                        <output aria-live="polite">{item.quantity}</output>
                        <button
                          type="button"
                          aria-label={`Tăng số lượng ${serverItem?.productName ?? item.name}`}
                          disabled={cannotIncrease}
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        ><Plus aria-hidden="true" size={18} /></button>
                      </div>
                      <button className="cart-remove" type="button" onClick={() => handleRemove(item)}>
                        <Trash2 aria-hidden="true" size={16} /> <span>Bỏ khỏi giỏ</span>
                      </button>
                    </div>

                    <div className="cart-line__price">
                      <small>{formatMoney(currentPrice)} / gói</small>
                      <strong>{formatMoney(lineTotal)}</strong>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className="cart-summary-panel" aria-label="Tóm tắt đơn hàng">
            <p>Ước tính đơn hàng</p>
            <div>
              <span>Tạm tính</span>
              <output>{formatMoney(quote?.subtotal ?? items.reduce((total, item) => total + item.unitPrice * item.quantity, 0))}</output>
            </div>
            <small>Chưa gồm phí vận chuyển.</small>
            {hasInventoryIssue ? <p className="cart-summary-panel__issue">Sửa các mặt hàng chưa đủ kho trước khi thanh toán.</p> : null}
            <button
              className="primary-button"
              type="button"
              disabled={!canContinue}
              aria-describedby="checkout-note"
              onClick={() => navigate(user ? '/thanh-toan' : '/dang-nhap?next=%2Fthanh-toan')}
            >
              {isChecking ? <><LoaderCircle aria-hidden="true" size={18} /> Đang kiểm tra giỏ</> : <>Tiếp tục thanh toán <ArrowRight aria-hidden="true" size={18} /></>}
            </button>
            <p id="checkout-note">{checkoutNote}</p>
          </aside>
        </div>
      ) : (
        <div className="cart-empty">
          <ShoppingBasket aria-hidden="true" size={30} />
          <h2>Giỏ đang đợi mẻ bánh đầu tiên.</h2>
          <p>Chọn một công thức để hệ thống chuẩn bị nguyên liệu và dụng cụ vừa đủ.</p>
          <Link className="primary-button" to="/">Chọn công thức <ArrowRight aria-hidden="true" size={18} /></Link>
        </div>
      )}

      {removedItem ? (
        <div className="cart-undo" role="status">
          <span>Đã bỏ “{removedItem.name}” khỏi giỏ.</span>
          <button type="button" onClick={undoRemove}>Hoàn tác</button>
        </div>
      ) : null}
    </section>
  );
}
