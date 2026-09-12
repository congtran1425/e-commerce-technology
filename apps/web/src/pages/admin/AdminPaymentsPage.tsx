import { AlertCircle, Banknote, Search } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { fetchAdminPayments } from '../../features/admin/api';
import { formatAdminDate, formatAdminMoney, paymentStatusLabels } from '../../features/admin/labels';
import type { AdminPayment, PaymentStatus } from '../../features/admin/types';

const statuses: Array<PaymentStatus | 'ALL'> = ['ALL', 'PENDING', 'SUCCEEDED', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED'];

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [draftQuery, setDraftQuery] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetchAdminPayments({ q: query, status, signal: controller.signal })
      .then((result) => { setPayments(result.items); setCursor(result.nextCursor); })
      .catch((requestError: unknown) => { if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Không thể tải giao dịch.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, status]);

  function submitSearch(event: FormEvent) { event.preventDefault(); setQuery(draftQuery.trim()); }

  async function loadMore() {
    if (!cursor) return;
    setLoading(true);
    try {
      const result = await fetchAdminPayments({ q: query, status, cursor });
      setPayments((current) => [...current, ...result.items]);
      setCursor(result.nextCursor);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể tải thêm giao dịch.');
    } finally { setLoading(false); }
  }

  return <section className="admin-operations-page" aria-labelledby="admin-payments-heading">
    <header className="admin-page-heading"><div><span className="admin-context">Giao dịch</span><h1 id="admin-payments-heading">Sổ đối soát thanh toán.</h1><p>Mỗi dòng là một lần tạo thanh toán ZaloPay. Dữ liệu nhạy cảm như token và địa chỉ thanh toán không được gửi ra màn hình này.</p></div></header>
    <form className="admin-toolbar" onSubmit={submitSearch}><label className="admin-toolbar__search"><span>Tìm giao dịch</span><div><Search aria-hidden="true" size={18} /><input value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="Mã đơn hoặc mã giao dịch" /><button type="submit">Tìm</button></div></label><label className="admin-toolbar__select"><span>Trạng thái</span><select value={status} onChange={(event) => setStatus(event.target.value as PaymentStatus | 'ALL')}>{statuses.map((value) => <option key={value} value={value}>{value === 'ALL' ? 'Tất cả' : paymentStatusLabels[value]}</option>)}</select></label></form>
    {error ? <p className="admin-feedback admin-feedback--error" role="alert"><AlertCircle aria-hidden="true" size={18} />{error}</p> : null}
    {loading && payments.length === 0 ? <div className="admin-skeleton-list"><span /><span /><span /></div> : null}
    {!loading && payments.length === 0 ? <div className="admin-empty-state"><Banknote aria-hidden="true" size={28} /><strong>Chưa có giao dịch phù hợp.</strong><p>Thử đổi từ khóa hoặc bộ lọc trạng thái.</p></div> : null}
    <div className="admin-payment-ledger">{payments.map((payment) => <article key={payment.id}><header><span><strong>{payment.order.orderNumber}</strong><small>{payment.order.recipientName}</small></span><span className={`admin-state admin-state--${payment.status.toLowerCase()}`}>{paymentStatusLabels[payment.status]}</span><b>{formatAdminMoney(payment.amount)}</b></header><dl><div><dt>Mã cửa hàng</dt><dd>{payment.merchantTransactionId}</dd></div><div><dt>Mã ZaloPay</dt><dd>{payment.providerTransactionId ?? '—'}</dd></div><div><dt>Tạo lúc</dt><dd>{formatAdminDate(payment.createdAt)}</dd></div><div><dt>Thanh toán lúc</dt><dd>{formatAdminDate(payment.paidAt)}</dd></div></dl>{payment.returnMessage ? <p>{payment.returnMessage}</p> : null}</article>)}</div>
    {cursor ? <button className="admin-button admin-load-more" type="button" disabled={loading} onClick={() => void loadMore()}>{loading ? 'Đang tải…' : 'Tải thêm'}</button> : null}
  </section>;
}
