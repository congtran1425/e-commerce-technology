import { AdminOrderWorkspace } from '../../features/admin/AdminOrderWorkspace';

export function AdminOrdersPage() {
  return <section className="admin-operations-page" aria-labelledby="admin-orders-heading"><header className="admin-page-heading"><div><span className="admin-context">Đơn hàng</span><h1 id="admin-orders-heading">Từ xác nhận đến giao hàng.</h1><p>Tìm và đối chiếu từng đơn, xem sản phẩm, người nhận, thanh toán rồi chuyển trạng thái theo đúng thứ tự vận hành.</p></div></header><AdminOrderWorkspace mode="orders" /></section>;
}
