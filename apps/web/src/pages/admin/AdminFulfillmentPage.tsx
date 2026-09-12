import { AdminOrderWorkspace } from '../../features/admin/AdminOrderWorkspace';

export function AdminFulfillmentPage() {
  return <section className="admin-operations-page" aria-labelledby="admin-fulfillment-heading"><header className="admin-page-heading"><div><span className="admin-context">Vận chuyển</span><h1 id="admin-fulfillment-heading">Hàng đang rời khỏi bếp.</h1><p>Theo dõi ba hàng đợi: đã xác nhận, đang chuẩn bị và đang giao. Mã vận đơn và hãng vận chuyển chưa được ghi vì mô hình dữ liệu chưa hỗ trợ.</p></div></header><AdminOrderWorkspace mode="fulfillment" /></section>;
}
