import { AlertCircle, ArrowRight, LoaderCircle, PackageCheck, Search } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { fetchAdminOrder, fetchAdminOrders, updateAdminOrderStatus } from './api';
import { formatAdminDate, formatAdminMoney, nextOrderStatus, orderStatusLabels, paymentStatusLabels } from './labels';
import type { AdminOrderDetail, AdminOrderSummary, OrderStatus } from './types';

const allStatuses: Array<OrderStatus | 'ALL'> = ['ALL', 'AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
const fulfillmentStatuses: Array<OrderStatus | 'ALL'> = ['CONFIRMED', 'PREPARING', 'SHIPPING'];

type Props = {
  mode: 'orders' | 'fulfillment';
};

export function AdminOrderWorkspace({ mode }: Props) {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [draftQuery, setDraftQuery] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'ALL'>(mode === 'fulfillment' ? 'PREPARING' : 'ALL');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permittedStatuses = mode === 'fulfillment' ? fulfillmentStatuses : allStatuses;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetchAdminOrders({ q: query, status, signal: controller.signal })
      .then((result) => {
        const visible = result.items;
        setOrders(visible);
        setNextCursor(result.nextCursor);
        setSelectedNumber((current) => visible.some((order) => order.orderNumber === current) ? current : visible[0]?.orderNumber ?? null);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Không thể tải danh sách đơn hàng.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [mode, query, status]);

  useEffect(() => {
    if (!selectedNumber) {
      setDetail(null);
      return;
    }
    const controller = new AbortController();
    setLoadingDetail(true);
    setError(null);
    void fetchAdminOrder(selectedNumber, controller.signal)
      .then(setDetail)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Không thể tải chi tiết đơn hàng.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoadingDetail(false); });
    return () => controller.abort();
  }, [selectedNumber]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setQuery(draftQuery.trim());
  }

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const result = await fetchAdminOrders({ q: query, status, cursor: nextCursor });
      const visible = result.items;
      setOrders((current) => [...current, ...visible]);
      setNextCursor(result.nextCursor);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể tải thêm đơn hàng.');
    } finally {
      setLoading(false);
    }
  }

  async function advanceOrder() {
    if (!detail) return;
    const next = nextOrderStatus[detail.status];
    if (!next) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAdminOrderStatus(detail.orderNumber, next.status);
      if (status !== 'ALL' && updated.status !== status) {
        const remaining = orders.filter((order) => order.orderNumber !== updated.orderNumber);
        setOrders(remaining);
        setDetail(null);
        setSelectedNumber(remaining[0]?.orderNumber ?? null);
      } else {
        setOrders((current) => current.map((order) => order.orderNumber === updated.orderNumber ? updated : order));
        setDetail(await fetchAdminOrder(detail.orderNumber));
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-order-workspace">
      <section className="admin-order-index" aria-label="Danh sách đơn hàng">
        <form className="admin-toolbar" onSubmit={submitSearch}>
          <label className="admin-toolbar__search">
            <span>Tìm đơn hàng</span>
            <div><Search aria-hidden="true" size={18} /><input value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="Mã đơn, người nhận, số điện thoại" /><button type="submit">Tìm</button></div>
          </label>
          <label className="admin-toolbar__select"><span>Trạng thái</span><select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | 'ALL')}>
            {permittedStatuses.map((value) => <option key={value} value={value}>{value === 'ALL' ? 'Tất cả' : orderStatusLabels[value]}</option>)}
          </select></label>
        </form>

        {error && <p className="admin-feedback admin-feedback--error" role="alert"><AlertCircle aria-hidden="true" size={18} />{error}</p>}
        {loading && orders.length === 0 ? <div className="admin-skeleton-list" aria-label="Đang tải đơn hàng"><span /><span /><span /></div> : null}
        {!loading && orders.length === 0 ? <div className="admin-empty-state"><PackageCheck aria-hidden="true" size={28} /><strong>Không có đơn phù hợp.</strong><p>Thử đổi từ khóa hoặc trạng thái. Danh sách chỉ hiển thị dữ liệu đã được máy chủ ghi nhận.</p></div> : null}
        <div className="admin-order-list">
          {orders.map((order) => (
            <button key={order.id} type="button" className="admin-order-row" data-selected={selectedNumber === order.orderNumber} onClick={() => setSelectedNumber(order.orderNumber)}>
              <span className="admin-order-row__identity"><strong>{order.orderNumber}</strong><small>{order.recipientName} · {formatAdminDate(order.createdAt)}</small></span>
              <span className={`admin-state admin-state--${order.status.toLowerCase()}`}>{orderStatusLabels[order.status]}</span>
              <span className="admin-order-row__total">{formatAdminMoney(order.total, order.currency)}</span>
              <ArrowRight aria-hidden="true" size={17} />
            </button>
          ))}
        </div>
        {nextCursor ? <button className="admin-button admin-load-more" type="button" disabled={loading} onClick={() => void loadMore()}>{loading ? 'Đang tải…' : 'Tải thêm'}</button> : null}
      </section>

      <section className="admin-order-detail" aria-live="polite">
        {loadingDetail ? <div className="admin-detail-placeholder"><LoaderCircle className="spin" aria-hidden="true" /><strong>Đang tải chi tiết…</strong></div> : null}
        {!loadingDetail && !detail ? <div className="admin-detail-placeholder"><PackageCheck aria-hidden="true" size={28} /><strong>Chọn một đơn hàng.</strong><p>Chi tiết người nhận, sản phẩm và giao dịch sẽ xuất hiện tại đây.</p></div> : null}
        {!loadingDetail && detail ? (
          <div className="admin-order-sheet">
            <header><div><span className={`admin-state admin-state--${detail.status.toLowerCase()}`}>{orderStatusLabels[detail.status]}</span><h2>{detail.orderNumber}</h2><p>{detail.customer.displayName} · {detail.customer.email}</p></div>
              {nextOrderStatus[detail.status] ? <button className="admin-button admin-button--primary" type="button" disabled={saving} onClick={() => void advanceOrder()}>{saving ? 'Đang cập nhật…' : nextOrderStatus[detail.status]?.label}</button> : null}
            </header>
            <dl className="admin-order-facts">
              <div><dt>Người nhận</dt><dd>{detail.recipientName}<br />{detail.recipientPhone}</dd></div>
              <div><dt>Địa chỉ</dt><dd>{[detail.address.addressLine, detail.address.ward, detail.address.district, detail.address.province].filter(Boolean).join(', ')}</dd></div>
              <div><dt>Sản phẩm</dt><dd>{detail.itemCount} dòng hàng</dd></div>
              <div><dt>Thanh toán</dt><dd>{detail.latestPayment ? paymentStatusLabels[detail.latestPayment.status] : 'Chưa có giao dịch'}</dd></div>
            </dl>
            <section className="admin-order-lines"><h3>Hàng trong đơn</h3>{detail.items.map((item) => <div key={item.id}><span><strong>{item.productName}</strong><small>{item.sku} · {item.variantLabel}</small></span><span>{item.quantity} × {formatAdminMoney(item.unitPrice, detail.currency)}</span><b>{formatAdminMoney(item.lineTotal, detail.currency)}</b></div>)}</section>
            <dl className="admin-order-totals"><div><dt>Tạm tính</dt><dd>{formatAdminMoney(detail.subtotal, detail.currency)}</dd></div><div><dt>Vận chuyển</dt><dd>{formatAdminMoney(detail.shippingFee, detail.currency)}</dd></div><div><dt>Tổng cộng</dt><dd>{formatAdminMoney(detail.total, detail.currency)}</dd></div></dl>
            {detail.note ? <p className="admin-order-note"><strong>Ghi chú:</strong> {detail.note}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
