import { AlertCircle, ArrowRight, Banknote, Boxes, PackageCheck, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminOverview } from '../../features/admin/api';
import { formatAdminDate, formatAdminMoney, orderStatusLabels } from '../../features/admin/labels';
import type { AdminOverview } from '../../features/admin/types';

export function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchAdminOverview(controller.signal)
      .then(setOverview)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Không thể tải bàn điều hành.');
      });
    return () => controller.abort();
  }, []);

  const actionCount = overview
    ? (overview.ordersByStatus.PAYMENT_REVIEW ?? 0) + (overview.ordersByStatus.CONFIRMED ?? 0) + (overview.ordersByStatus.PREPARING ?? 0)
    : 0;

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-heading">
      <header className="admin-page-heading"><div><span className="admin-context">Bàn điều hành</span><h1 id="admin-dashboard-heading">Việc cần xử lý hôm nay.</h1><p>Con số bên dưới được đọc trực tiếp từ đơn hàng, giao dịch và sổ kho. Doanh thu là tiền đã thu, chưa phải lợi nhuận.</p></div><Link className="admin-button admin-button--primary" to="/admin/don-hang">Mở đơn hàng <ArrowRight aria-hidden="true" size={17} /></Link></header>
      {error ? <p className="admin-feedback admin-feedback--error" role="alert"><AlertCircle aria-hidden="true" size={18} />{error}</p> : null}
      {!overview && !error ? <div className="admin-metric-strip" aria-label="Đang tải số liệu"><span /><span /><span /><span /></div> : null}
      {overview ? <>
        <div className="admin-metric-strip">
          <Link to="/admin/don-hang"><ShoppingBag aria-hidden="true" size={20} /><span><small>Đơn cần xử lý</small><strong>{actionCount}</strong></span></Link>
          <Link to="/admin/van-chuyen"><PackageCheck aria-hidden="true" size={20} /><span><small>Đang giao</small><strong>{overview.ordersByStatus.SHIPPING ?? 0}</strong></span></Link>
          <Link to="/admin/kho"><Boxes aria-hidden="true" size={20} /><span><small>Hết / sắp hết</small><strong>{overview.inventory.outOfStockCount} / {overview.inventory.lowStockCount}</strong></span></Link>
          <Link to="/admin/bao-cao"><Banknote aria-hidden="true" size={20} /><span><small>Đã thu trong 7 ngày</small><strong>{formatAdminMoney(overview.collectedRevenue.lastSevenDays)}</strong></span></Link>
        </div>
        <section className="admin-section-block"><header><h2>Đơn mới nhất</h2><Link to="/admin/don-hang">Xem tất cả <ArrowRight aria-hidden="true" size={15} /></Link></header>
          {overview.recentOrders.length === 0 ? <p className="admin-empty-inline">Chưa có đơn hàng nào được ghi nhận.</p> : <div className="admin-compact-list">{overview.recentOrders.map((order) => <Link key={order.id} to="/admin/don-hang"><span><strong>{order.orderNumber}</strong><small>{order.recipientName} · {formatAdminDate(order.createdAt)}</small></span><span className={`admin-state admin-state--${order.status.toLowerCase()}`}>{orderStatusLabels[order.status]}</span><b>{formatAdminMoney(order.total, order.currency)}</b></Link>)}</div>}
        </section>
        <aside className="admin-boundary-note"><strong>Ranh giới số liệu hiện tại</strong><p>Chưa thể tính lợi nhuận, chiết khấu, thuế hay giá trị nhập hàng vì cơ sở dữ liệu chưa có giá vốn, chương trình giảm giá, quy tắc thuế và phiếu nhập. Khu báo cáo sẽ nêu rõ thay vì suy đoán.</p></aside>
      </> : null}
    </section>
  );
}
