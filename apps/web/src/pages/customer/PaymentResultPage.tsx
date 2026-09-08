import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getOrder, syncOrderPayment } from '../../features/checkout/api';
import type { CheckoutOrder } from '../../features/checkout/types';
import { useCart } from '../../features/cart/CartContext';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

type ResultStatus = 'loading' | 'ready' | 'error';

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') ?? '';
  const { clearCart } = useCart();
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [status, setStatus] = useState<ResultStatus>('loading');
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const loadOrder = useCallback(async (signal?: AbortSignal) => {
    if (!/^EC\d{6}[A-Z0-9]{8}$/.test(orderNumber)) {
      setError('Đường dẫn kết quả không có mã đơn hàng hợp lệ.');
      setStatus('error');
      return;
    }

    try {
      const current = await getOrder(orderNumber, signal);
      const next = current.payment?.status === 'PENDING'
        ? await syncOrderPayment(orderNumber, signal)
        : current;
      setOrder(next);
      if (next.status === 'CONFIRMED') clearCart();
      setStatus('ready');
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
      setError(requestError instanceof Error ? requestError.message : 'Chưa thể đọc trạng thái đơn hàng.');
      setStatus('error');
    }
  }, [clearCart, orderNumber]);

  useEffect(() => {
    const controller = new AbortController();
    void loadOrder(controller.signal);
    return () => controller.abort();
  }, [loadOrder]);

  async function refreshStatus() {
    setSyncing(true);
    setError('');
    try {
      const next = await syncOrderPayment(orderNumber);
      setOrder(next);
      if (next.status === 'CONFIRMED') clearCart();
      setStatus('ready');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Chưa thể đối chiếu trạng thái.');
    } finally {
      setSyncing(false);
    }
  }

  if (status === 'loading') {
    return <section className="payment-result page-frame" aria-live="polite"><LoaderCircle className="payment-result__spinner" aria-hidden="true" /><h1>Đang đối chiếu thanh toán</h1><p>Máy chủ đang hỏi lại ZaloPay trước khi xác nhận đơn.</p></section>;
  }

  if (status === 'error' || !order) {
    return <section className="payment-result page-frame"><AlertTriangle aria-hidden="true" /><h1>Chưa đọc được kết quả</h1><p role="alert">{error}</p><Link className="primary-button" to="/gio-hang">Về giỏ hàng</Link></section>;
  }

  const confirmed = ['CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED'].includes(order.status);
  const review = order.status === 'PAYMENT_REVIEW';
  const cancelled = order.status === 'CANCELLED';

  return (
    <section className="payment-result page-frame" aria-labelledby="payment-result-heading">
      {confirmed ? <CheckCircle2 aria-hidden="true" /> : review || cancelled ? <AlertTriangle aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
      <p className="kicker">Đơn {order.orderNumber}</p>
      <h1 id="payment-result-heading">
        {confirmed ? 'Đã nhận thanh toán' : review ? 'Cần đối chiếu thủ công' : cancelled ? 'Giao dịch chưa thành công' : 'ZaloPay đang xử lý'}
      </h1>
      <p>
        {confirmed
          ? 'Đơn đã được xác nhận. Giỏ hàng trên thiết bị này cũng đã được làm trống.'
          : review
            ? 'ZaloPay đã báo thu tiền nhưng dữ liệu chưa khớp hoàn toàn. Không thanh toán lại đơn này.'
            : cancelled
              ? 'Tồn kho đã được hoàn lại. Bạn có thể quay về giỏ để thử một lần thanh toán mới.'
              : 'Chúng tôi chưa nhận được kết quả cuối cùng. Bạn có thể đối chiếu lại sau ít phút.'}
      </p>
      <dl className="payment-result__facts">
        <div><dt>Người nhận</dt><dd>{order.recipient.name}</dd></div>
        <div><dt>Tổng tiền</dt><dd>{money.format(Number(order.total))}</dd></div>
        <div><dt>Trạng thái cổng</dt><dd>{order.payment?.status ?? 'Không xác định'}</dd></div>
      </dl>
      {error ? <p className="form-alert" role="alert"><AlertTriangle aria-hidden="true" /> {error}</p> : null}
      <div className="payment-result__actions">
        {!confirmed && !review && !cancelled ? (
          <button className="primary-button" type="button" onClick={refreshStatus} disabled={syncing} aria-busy={syncing}>
            {syncing ? <><LoaderCircle aria-hidden="true" /> Đang đối chiếu…</> : <><RefreshCw aria-hidden="true" /> Kiểm tra lại</>}
          </button>
        ) : null}
        <Link className="text-link" to={cancelled ? '/gio-hang' : '/'}>{cancelled ? 'Về giỏ hàng' : 'Về trang chủ'}</Link>
      </div>
    </section>
  );
}
