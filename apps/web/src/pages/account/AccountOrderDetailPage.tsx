import { AlertCircle, ArrowLeft, ExternalLink, LoaderCircle, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  accountDate,
  accountMoney,
  accountOrderStatusLabels,
  accountPaymentStatusLabels,
} from '../../features/account/labels';
import { getOrder } from '../../features/checkout/api';
import type { CheckoutOrder } from '../../features/checkout/types';

export function AccountOrderDetailPage() {
  const { orderNumber = '' } = useParams();
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    void getOrder(orderNumber, controller.signal)
      .then(setOrder)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Chưa thể đọc đơn hàng.');
      });
    return () => controller.abort();
  }, [orderNumber]);

  if (!order && !error) {
    return <div className="account-detail-loading" role="status"><LoaderCircle aria-hidden="true" /> Đang mở đơn hàng…</div>;
  }

  if (!order) {
    return <section className="account-state" role="alert"><AlertCircle aria-hidden="true" /><h2>Chưa mở được đơn</h2><p>{error}</p><Link className="account-button" to="/tai-khoan/don-hang">Về danh sách đơn</Link></section>;
  }

  const address = [order.recipient.addressLine, order.recipient.ward, order.recipient.district, order.recipient.province]
    .filter(Boolean)
    .join(', ');

  return (
    <article className="account-order-detail" aria-labelledby="order-detail-heading">
      <Link className="account-back-link" to="/tai-khoan/don-hang"><ArrowLeft aria-hidden="true" /> Danh sách đơn</Link>
      <header>
        <div><h2 id="order-detail-heading">{order.orderNumber}</h2><p>Đặt ngày {accountDate.format(new Date(order.createdAt))}</p></div>
        <span className={`account-state-label account-state-label--${order.status.toLowerCase()}`}>{accountOrderStatusLabels[order.status]}</span>
      </header>

      <section className="account-order-block" aria-labelledby="order-lines-heading">
        <h3 id="order-lines-heading">Những món đã đặt</h3>
        <div className="account-order-lines">
          {order.items.map((item) => (
            <div key={item.id}>
              <span><strong>{item.productName}</strong><small>{item.variantLabel} · {item.quantity} gói</small></span>
              <b>{accountMoney.format(Number(item.lineTotal))}</b>
            </div>
          ))}
        </div>
        <dl className="account-order-totals">
          <div><dt>Tạm tính</dt><dd>{accountMoney.format(Number(order.subtotal))}</dd></div>
          <div><dt>Phí vận chuyển</dt><dd>{accountMoney.format(Number(order.shippingFee))}</dd></div>
          <div><dt>Tổng cộng</dt><dd>{accountMoney.format(Number(order.total))}</dd></div>
        </dl>
      </section>

      <section className="account-order-block account-order-recipient" aria-labelledby="recipient-detail-heading">
        <MapPin aria-hidden="true" />
        <div><h3 id="recipient-detail-heading">Nơi nhận của đơn</h3><strong>{order.recipient.name} · {order.recipient.phone}</strong><p>{address}</p>{order.note ? <small>Ghi chú: {order.note}</small> : null}</div>
      </section>

      <section className="account-order-block" aria-labelledby="payment-detail-heading">
        <h3 id="payment-detail-heading">Thanh toán</h3>
        <dl className="account-payment-facts">
          <div><dt>Cổng thanh toán</dt><dd>{order.payment?.provider ?? 'Chưa có'}</dd></div>
          <div><dt>Trạng thái</dt><dd>{order.payment ? accountPaymentStatusLabels[order.payment.status] : 'Chưa có'}</dd></div>
          <div><dt>Thời điểm thu tiền</dt><dd>{order.payment?.paidAt ? accountDate.format(new Date(order.payment.paidAt)) : 'Chưa ghi nhận'}</dd></div>
        </dl>
        {order.status === 'AWAITING_PAYMENT' && order.payment?.checkoutUrl ? (
          <a className="account-button" href={order.payment.checkoutUrl}>Tiếp tục thanh toán <ExternalLink aria-hidden="true" /></a>
        ) : null}
      </section>
    </article>
  );
}
