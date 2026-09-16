import { AlertCircle, ArrowRight, LoaderCircle, PackageOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAccountOrders } from '../../features/account/api';
import {
  accountDate,
  accountMoney,
  accountOrderStatusLabels,
} from '../../features/account/labels';
import type { AccountOrderSummary } from '../../features/account/types';
import type { OrderStatus } from '../../features/checkout/types';

type StatusFilter = '' | OrderStatus;

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'AWAITING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PREPARING', label: 'Đang chuẩn bị' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'PAYMENT_REVIEW', label: 'Cần đối chiếu' },
];

export function AccountOrdersPage() {
  const [filter, setFilter] = useState<StatusFilter>('');
  const [orders, setOrders] = useState<AccountOrderSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    void fetchAccountOrders({ status: filter || undefined, signal: controller.signal })
      .then((page) => {
        setOrders(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Chưa thể đọc lịch sử đơn hàng.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filter]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    setError('');
    try {
      const page = await fetchAccountOrders({ cursor: nextCursor, status: filter || undefined });
      setOrders((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Chưa thể tải thêm đơn hàng.');
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className="account-orders" aria-labelledby="account-orders-heading">
      <header className="account-section-heading account-section-heading--with-control">
        <div><h2 id="account-orders-heading">Đơn hàng của bạn.</h2><p>Mỗi dòng giữ nguyên giá và nơi nhận tại thời điểm đặt.</p></div>
        <label>
          <span>Lọc theo trạng thái</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value as StatusFilter)}>
            {statusOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </header>

      {loading ? <div className="account-list-skeleton" role="status" aria-label="Đang tải đơn hàng"><span /><span /><span /></div> : null}
      {error ? <p className="account-feedback account-feedback--error" role="alert"><AlertCircle aria-hidden="true" /> {error}</p> : null}
      {!loading && orders.length === 0 ? (
        <div className="account-state">
          <PackageOpen aria-hidden="true" />
          <h3>{filter ? 'Không có đơn ở trạng thái này' : 'Chưa có đơn hàng'}</h3>
          <p>{filter ? 'Chọn trạng thái khác để xem những đơn còn lại.' : 'Bắt đầu từ một công thức để hệ thống tính danh sách nguyên liệu vừa đủ.'}</p>
          <Link className="account-button" to="/cong-thuc">Xem công thức</Link>
        </div>
      ) : null}

      {orders.length > 0 ? (
        <div className="account-order-list account-order-list--full">
          {orders.map((order) => (
            <Link key={order.orderNumber} to={`/tai-khoan/don-hang/${order.orderNumber}`}>
              <span><strong>{order.orderNumber}</strong><small>{accountDate.format(new Date(order.createdAt))} · Người nhận: {order.recipientName}</small></span>
              <span className={`account-state-label account-state-label--${order.status.toLowerCase()}`}>{accountOrderStatusLabels[order.status]}</span>
              <b>{accountMoney.format(Number(order.total))}</b>
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          ))}
        </div>
      ) : null}

      {nextCursor ? (
        <button className="account-load-more" type="button" disabled={loadingMore} onClick={() => void loadMore()}>
          {loadingMore ? <><LoaderCircle aria-hidden="true" /> Đang tải…</> : 'Xem thêm đơn hàng'}
        </button>
      ) : null}
    </section>
  );
}
