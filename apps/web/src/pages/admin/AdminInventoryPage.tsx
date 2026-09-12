import { AlertCircle, ArrowRight, Boxes } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminInventoryOverview } from '../../features/admin/api';
import { formatAdminDate, inventoryReasonLabels } from '../../features/admin/labels';
import type { AdminInventoryOverview } from '../../features/admin/types';

export function AdminInventoryPage() {
  const [inventory, setInventory] = useState<AdminInventoryOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchAdminInventoryOverview(controller.signal)
      .then(setInventory)
      .catch((requestError: unknown) => { if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Không thể tải dữ liệu kho.'); });
    return () => controller.abort();
  }, []);

  return <section className="admin-operations-page" aria-labelledby="admin-inventory-heading">
    <header className="admin-page-heading"><div><span className="admin-context">Kho vận</span><h1 id="admin-inventory-heading">Biết thứ gì sắp cạn.</h1><p>Ngưỡng cảnh báo hiện tại là 5 gói/cái cho mỗi quy cách. Điều chỉnh tồn kho vẫn được thực hiện trong hồ sơ sản phẩm để giữ đầy đủ sổ biến động.</p></div><Link className="admin-button admin-button--primary" to="/admin/san-pham">Điều chỉnh kho <ArrowRight aria-hidden="true" size={17} /></Link></header>
    {error ? <p className="admin-feedback admin-feedback--error" role="alert"><AlertCircle aria-hidden="true" size={18} />{error}</p> : null}
    {!inventory && !error ? <div className="admin-skeleton-list"><span /><span /><span /></div> : null}
    {inventory ? <div className="admin-inventory-workspace"><section className="admin-section-block"><header><h2>Cần chú ý</h2><span>≤ {inventory.lowStockThreshold}</span></header>{inventory.attentionVariants.length === 0 ? <div className="admin-empty-state"><Boxes aria-hidden="true" size={28} /><strong>Chưa có quy cách sắp hết.</strong><p>Tất cả quy cách đang bán đều cao hơn ngưỡng cảnh báo.</p></div> : <div className="admin-stock-watch">{inventory.attentionVariants.map((variant) => <Link key={variant.id} to="/admin/san-pham"><span><strong>{variant.product.name}</strong><small>{variant.sku} · {variant.label}</small></span><b data-empty={variant.stockQuantity === 0}>{variant.stockQuantity}</b><ArrowRight aria-hidden="true" size={17} /></Link>)}</div>}</section>
      <section className="admin-section-block"><header><h2>Biến động gần đây</h2><span>{inventory.recentMovements.length} dòng</span></header>{inventory.recentMovements.length === 0 ? <p className="admin-empty-inline">Sổ kho chưa có biến động.</p> : <div className="admin-movement-stream">{inventory.recentMovements.map((movement) => <article key={movement.id}><span><strong>{movement.variant.product.name}</strong><small>{movement.variant.sku} · {inventoryReasonLabels[movement.reason]}</small></span><b data-negative={movement.quantityDelta < 0}>{movement.quantityDelta > 0 ? '+' : ''}{movement.quantityDelta}</b><small>{movement.stockBefore} → {movement.stockAfter} · {formatAdminDate(movement.createdAt)}</small>{movement.note ? <p>{movement.note}</p> : null}</article>)}</div>}</section></div> : null}
    <aside className="admin-boundary-note"><strong>Chưa phải hệ thống nhập hàng</strong><p>Sổ hiện tại ghi tăng/giảm tồn kho, nhưng chưa quản lý nhà cung cấp, đơn mua, lô hàng, hạn sử dụng hay giá vốn. Các phần này cần mô hình dữ liệu riêng trước khi gọi là “xuất nhập hàng”.</p></aside>
  </section>;
}
