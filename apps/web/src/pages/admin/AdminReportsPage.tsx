import { AlertCircle, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchAdminOverview } from '../../features/admin/api';
import { formatAdminMoney, orderStatusLabels } from '../../features/admin/labels';
import type { AdminOverview, OrderStatus } from '../../features/admin/types';

const reportedStatuses: OrderStatus[] = ['AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

export function AdminReportsPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchAdminOverview(controller.signal).then(setOverview).catch((requestError: unknown) => {
      if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Không thể tải báo cáo.');
    });
    return () => controller.abort();
  }, []);

  return <section className="admin-operations-page" aria-labelledby="admin-reports-heading">
    <header className="admin-page-heading"><div><span className="admin-context">Báo cáo</span><h1 id="admin-reports-heading">Chỉ báo cáo điều có thể chứng minh.</h1><p>Tiền đã thu được tính từ giao dịch ZaloPay thành công. Đây không phải doanh thu kế toán đã điều chỉnh và càng không phải lợi nhuận.</p></div></header>
    {error ? <p className="admin-feedback admin-feedback--error" role="alert"><AlertCircle aria-hidden="true" size={18} />{error}</p> : null}
    {!overview && !error ? <div className="admin-skeleton-list"><span /><span /></div> : null}
    {overview ? <>
      <section className="admin-report-ledger"><div><span>Tiền đã thu — toàn thời gian</span><strong>{formatAdminMoney(overview.collectedRevenue.allTime)}</strong><small>{overview.collectedRevenue.allTimePaymentCount} giao dịch thành công</small></div><div><span>Tiền đã thu — 7 ngày gần nhất</span><strong>{formatAdminMoney(overview.collectedRevenue.lastSevenDays)}</strong><small>{overview.collectedRevenue.lastSevenDaysPaymentCount} giao dịch thành công</small></div><div><span>Đơn đã giao</span><strong>{overview.ordersByStatus.DELIVERED ?? 0}</strong><small>Tính theo trạng thái đơn hàng</small></div></section>
      <section className="admin-section-block"><header><h2>Cơ cấu đơn hiện tại</h2><span>{reportedStatuses.reduce((sum, status) => sum + (overview.ordersByStatus[status] ?? 0), 0)} đơn</span></header><div className="admin-status-ledger">{reportedStatuses.map((status) => <div key={status}><span className={`admin-state admin-state--${status.toLowerCase()}`}>{orderStatusLabels[status]}</span><strong>{overview.ordersByStatus[status] ?? 0}</strong></div>)}</div></section>
      <section className="admin-unavailable-metrics" aria-labelledby="unavailable-metrics-heading"><header><BarChart3 aria-hidden="true" size={22} /><div><h2 id="unavailable-metrics-heading">Các chỉ số chưa đủ dữ liệu</h2><p>Không điền số 0 vì số 0 sẽ bị hiểu sai thành kết quả kinh doanh thật.</p></div></header><dl><div><dt>Lợi nhuận</dt><dd>Thiếu giá vốn và phương pháp tính giá xuất kho.</dd></div><div><dt>Chiết khấu</dt><dd>Thiếu chương trình khuyến mãi và khoản giảm trên đơn.</dd></div><div><dt>Thuế</dt><dd>Thiếu quy tắc giá đã gồm thuế và dữ liệu hóa đơn.</dd></div><div><dt>Giá trị nhập hàng</dt><dd>Thiếu nhà cung cấp, đơn mua và phiếu nhập.</dd></div></dl></section>
    </> : null}
  </section>;
}
