import { AlertTriangle, ArrowLeft, LoaderCircle, MapPin, ShieldCheck, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { CheckoutApiError, createOrder } from '../../features/checkout/api';
import { useCart } from '../../features/cart/CartContext';
import { quoteCart } from '../../features/cart/api';
import type { CartQuote } from '../../features/cart/types';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

type Recipient = {
  name: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
  note: string;
};

type RecipientField = keyof Recipient;
type QuoteStatus = 'loading' | 'ready' | 'error';

function validateRecipient(value: Recipient) {
  const errors: Partial<Record<RecipientField, string>> = {};
  if (value.name.trim().length < 2) errors.name = 'Nhập đầy đủ họ tên người nhận.';
  const normalizedPhone = value.phone.trim().replace(/[\s.-]/g, '');
  if (!/^(?:\+84|0)\d{9,10}$/.test(normalizedPhone)) {
    errors.phone = 'Nhập số điện thoại bắt đầu bằng 0 hoặc +84.';
  }
  if (!value.addressLine.trim()) errors.addressLine = 'Nhập số nhà và tên đường.';
  if (!value.district.trim()) errors.district = 'Nhập quận hoặc huyện.';
  if (!value.province.trim()) errors.province = 'Nhập tỉnh hoặc thành phố.';
  if (value.note.length > 500) errors.note = 'Ghi chú không được dài quá 500 ký tự.';
  return errors;
}

export function CheckoutPage() {
  const { user } = useAuth();
  const { items } = useCart();
  const [recipient, setRecipient] = useState<Recipient>({
    name: user?.displayName ?? '',
    phone: '',
    addressLine: '',
    ward: '',
    district: '',
    province: '',
    note: '',
  });
  const [touched, setTouched] = useState<Partial<Record<RecipientField, boolean>>>({});
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const errors = useMemo(() => validateRecipient(recipient), [recipient]);

  useEffect(() => {
    if (items.length === 0) {
      setQuote(null);
      setQuoteStatus('ready');
      return undefined;
    }
    const controller = new AbortController();
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
    return () => controller.abort();
  }, [items]);

  function updateField(field: RecipientField, value: string) {
    setRecipient((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const allTouched = Object.fromEntries(
      (Object.keys(recipient) as RecipientField[]).map((field) => [field, true]),
    );
    setTouched(allTouched);
    if (Object.keys(errors).length > 0 || !quote?.canCheckout || items.length === 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const order = await createOrder({
        idempotencyKey,
        recipient: {
          name: recipient.name,
          phone: recipient.phone,
          addressLine: recipient.addressLine,
          ward: recipient.ward || undefined,
          district: recipient.district,
          province: recipient.province,
        },
        note: recipient.note || undefined,
        items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
      });
      if (!order.payment?.checkoutUrl) throw new Error('ZaloPay chưa trả về địa chỉ thanh toán.');
      window.location.assign(order.payment.checkoutUrl);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Chưa thể tạo thanh toán.');
      if (error instanceof CheckoutApiError && [
        'PAYMENT_CREATE_FAILED',
        'PAYMENT_PROVIDER_UNAVAILABLE',
        'ORDER_ATTEMPT_ALREADY_USED',
      ].includes(error.code)) {
        setIdempotencyKey(crypto.randomUUID());
      }
      setSubmitting(false);
    }
  }

  function field(
    name: RecipientField,
    label: string,
    options: { autoComplete?: string; placeholder?: string; full?: boolean } = {},
  ) {
    const error = touched[name] ? errors[name] : undefined;
    return (
      <label className={`checkout-field${options.full ? ' checkout-field--full' : ''}`}>
        <span>{label}</span>
        <input
          name={name}
          value={recipient[name]}
          autoComplete={options.autoComplete}
          placeholder={options.placeholder}
          disabled={submitting}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={`${name}-message`}
          onBlur={() => setTouched((current) => ({ ...current, [name]: true }))}
          onChange={(event) => updateField(name, event.target.value)}
        />
        <small id={`${name}-message`} data-error={error ? 'true' : undefined}>{error ?? ' '}</small>
      </label>
    );
  }

  if (items.length === 0) {
    return (
      <section className="checkout-empty page-frame" aria-labelledby="checkout-empty-heading">
        <p className="kicker">Chưa có nguyên liệu để đặt</p>
        <h1 id="checkout-empty-heading">Giỏ đang trống</h1>
        <p>Quay lại công thức để chọn khẩu phần và thêm những món cần mua.</p>
        <Link className="primary-button" to="/">Xem công thức</Link>
      </section>
    );
  }

  return (
    <form className="checkout-flow page-frame" onSubmit={handleSubmit} noValidate aria-labelledby="checkout-heading">
      <header className="checkout-flow__heading">
        <p className="kicker">Thanh toán cho mẻ bánh</p>
        <h1 id="checkout-heading">Gửi bánh về đúng bếp</h1>
        <p>{user?.displayName}, hãy đối chiếu nơi nhận và giỏ hàng trước khi sang cổng ZaloPay.</p>
      </header>

      <section className="checkout-stage checkout-stage--recipient" aria-labelledby="recipient-heading">
        <div className="checkout-stage__title">
          <span>01</span>
          <div>
            <h2 id="recipient-heading">Nơi nhận hàng</h2>
            <p>Địa chỉ này được lưu cùng đơn để việc giao nhận không thay đổi theo hồ sơ sau này.</p>
          </div>
        </div>
        <div className="checkout-fields">
          {field('name', 'Họ tên người nhận', { autoComplete: 'name' })}
          {field('phone', 'Số điện thoại', { autoComplete: 'tel', placeholder: '090 123 4567' })}
          {field('addressLine', 'Số nhà và tên đường', { autoComplete: 'address-line1', full: true })}
          {field('ward', 'Phường hoặc xã', { autoComplete: 'address-level3' })}
          {field('district', 'Quận hoặc huyện', { autoComplete: 'address-level2' })}
          {field('province', 'Tỉnh hoặc thành phố', { autoComplete: 'address-level1', full: true })}
          <label className="checkout-field checkout-field--full">
            <span>Ghi chú giao hàng <small>(không bắt buộc)</small></span>
            <textarea
              name="note"
              value={recipient.note}
              maxLength={500}
              disabled={submitting}
              aria-invalid={touched.note && errors.note ? 'true' : undefined}
              aria-describedby="note-message"
              onBlur={() => setTouched((current) => ({ ...current, note: true }))}
              onChange={(event) => updateField('note', event.target.value)}
            />
            <small id="note-message" data-error={touched.note && errors.note ? 'true' : undefined}>
              {touched.note && errors.note ? errors.note : `${recipient.note.length}/500 ký tự`}
            </small>
          </label>
        </div>
      </section>

      <section className="checkout-stage checkout-stage--order" aria-labelledby="order-heading">
        <div className="checkout-stage__title">
          <span>02</span>
          <div>
            <h2 id="order-heading">Đối chiếu giỏ</h2>
            <p>Giá và tồn kho được hỏi lại từ máy chủ trước khi tạo đơn.</p>
          </div>
        </div>

        {quoteStatus === 'loading' ? (
          <p className="checkout-status" aria-live="polite"><LoaderCircle aria-hidden="true" /> Đang đối chiếu giỏ hàng…</p>
        ) : null}
        {quoteStatus === 'error' ? (
          <p className="form-alert" role="alert"><AlertTriangle aria-hidden="true" /> Chưa thể kiểm tra giỏ. Hãy quay lại giỏ hàng và thử lại.</p>
        ) : null}
        {quoteStatus === 'ready' && quote && !quote.canCheckout ? (
          <p className="form-alert" role="alert"><AlertTriangle aria-hidden="true" /> Có sản phẩm đã hết hoặc không đủ tồn kho.</p>
        ) : null}

        <ul className="checkout-order-lines">
          {quote?.items.map((item) => (
            <li key={item.variantId}>
              <div>
                <strong>{item.productName ?? 'Sản phẩm không còn bán'}</strong>
                <span>{item.label ?? 'Không xác định'} · {item.requestedQuantity} gói</span>
              </div>
              <span>{item.lineTotal ? money.format(Number(item.lineTotal)) : '—'}</span>
            </li>
          ))}
        </ul>
        <Link className="text-link" to="/gio-hang"><ArrowLeft aria-hidden="true" size={17} /> Sửa giỏ hàng</Link>
      </section>

      <aside className="checkout-payment" aria-labelledby="payment-heading">
        <div className="checkout-stage__title checkout-stage__title--dark">
          <span>03</span>
          <div>
            <h2 id="payment-heading">Sang ZaloPay</h2>
            <p>Khóa thanh toán chỉ nằm ở backend; trình duyệt không nhận được khóa bí mật.</p>
          </div>
        </div>
        <dl>
          <div><dt>Tạm tính</dt><dd>{quote ? money.format(Number(quote.subtotal)) : '—'}</dd></div>
          <div><dt>Phí vận chuyển</dt><dd>Chưa áp dụng ở bản thử nghiệm</dd></div>
          <div><dt>Tổng thanh toán</dt><dd>{quote ? money.format(Number(quote.subtotal)) : '—'}</dd></div>
        </dl>
        <div className="checkout-payment__assurance"><ShieldCheck aria-hidden="true" /><span>Giá được chụp lại trong đơn; tồn kho được giữ trước khi mở ZaloPay.</span></div>
        {submitError ? <p className="form-alert form-alert--on-dark" role="alert"><AlertTriangle aria-hidden="true" /> {submitError}</p> : null}
        <button
          className="primary-button checkout-submit"
          type="submit"
          disabled={submitting || quoteStatus !== 'ready' || !quote?.canCheckout || Object.keys(errors).length > 0}
          aria-busy={submitting}
        >
          {submitting ? <><LoaderCircle aria-hidden="true" /> Đang tạo thanh toán…</> : <><WalletCards aria-hidden="true" /> Thanh toán qua ZaloPay</>}
        </button>
        <small>Nút sẽ mở cổng ZaloPay Sandbox. Không đóng trang trong lúc đang tạo giao dịch.</small>
      </aside>
    </form>
  );
}
