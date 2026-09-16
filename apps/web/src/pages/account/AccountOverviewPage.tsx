import { AlertCircle, ArrowRight, MapPin, PackageOpen, UserRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAccountOverview } from '../../features/account/api';
import {
  accountDate,
  accountMoney,
  accountOrderStatusLabels,
} from '../../features/account/labels';
import type { AccountOverview } from '../../features/account/types';

export function AccountOverviewPage() {
  const [overview, setOverview] = useState<AccountOverview | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async (signal?: AbortSignal) => {
    setError('');
    try {
      setOverview(await fetchAccountOverview(signal));
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
      setError(requestError instanceof Error ? requestError.message : 'Chưa thể mở tổng quan tài khoản.');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (!overview && !error) {
    return (
      <div className="account-skeleton" role="status" aria-label="Đang tải tổng quan tài khoản">
        <span /><span /><span /><span />
      </div>
    );
  }

  if (!overview) {
    return (
      <section className="account-state" role="alert">
        <AlertCircle aria-hidden="true" />
        <h2>Chưa mở được sổ bếp</h2>
        <p>{error}</p>
        <button className="account-button" type="button" onClick={() => void load()}>Thử lại</button>
      </section>
    );
  }

  return (
    <div className="account-overview">
      <header className="account-section-heading">
        <h2>Một lượt nhìn là đủ.</h2>
        <p>Tài khoản được tạo ngày {accountDate.format(new Date(overview.profile.createdAt))}. Email đăng nhập: {overview.profile.email}.</p>
      </header>

      <dl className="account-fact-strip">
        <div><dt>Đơn đã đặt</dt><dd>{overview.orderCount}</dd></div>
        <div><dt>Nơi nhận đã lưu</dt><dd>{overview.addressCount}</dd></div>
        <div>
          <dt>Số điện thoại</dt>
          <dd data-textual="true">{overview.profile.phone ?? 'Chưa bổ sung'}</dd>
        </div>
      </dl>

      <section className="account-ledger-section" aria-labelledby="recent-orders-heading">
        <header>
          <h3 id="recent-orders-heading">Đơn gần đây</h3>
          <Link to="/tai-khoan/don-hang">Xem tất cả <ArrowRight aria-hidden="true" size={16} /></Link>
        </header>
        {overview.recentOrders.length > 0 ? (
          <div className="account-order-list">
            {overview.recentOrders.map((order) => (
              <Link key={order.orderNumber} to={`/tai-khoan/don-hang/${order.orderNumber}`}>
                <span>
                  <strong>{order.orderNumber}</strong>
                  <small>{accountDate.format(new Date(order.createdAt))} · {order.itemCount} món</small>
                </span>
                <span className={`account-state-label account-state-label--${order.status.toLowerCase()}`}>
                  {accountOrderStatusLabels[order.status]}
                </span>
                <b>{accountMoney.format(Number(order.total))}</b>
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="account-empty-inline">
            <PackageOpen aria-hidden="true" />
            <div><strong>Chưa có đơn hàng.</strong><p>Chọn một công thức, tính đúng khẩu phần rồi tạo giỏ đầu tiên.</p></div>
            <Link to="/cong-thuc">Xem công thức</Link>
          </div>
        )}
      </section>

      <section className="account-next-actions" aria-label="Thông tin tài khoản cần hoàn thiện">
        <Link to="/tai-khoan/dia-chi">
          <MapPin aria-hidden="true" />
          <span><strong>{overview.addressCount > 0 ? 'Quản lý nơi nhận' : 'Lưu nơi nhận đầu tiên'}</strong><small>Điền nhanh hơn ở bước thanh toán.</small></span>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link to="/tai-khoan/ho-so">
          <UserRound aria-hidden="true" />
          <span><strong>Kiểm tra hồ sơ</strong><small>Tên hiển thị và số điện thoại liên hệ.</small></span>
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
