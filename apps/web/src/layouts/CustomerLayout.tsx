import { Menu, ShoppingBasket, X } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useCart } from '../features/cart/CartContext';

export function CustomerLayout() {
  const { itemCount } = useCart();
  const { status: authStatus, user } = useAuth();
  const [showNotice, setShowNotice] = useState(true);
  const accountLabel = user?.displayName.split(/\s+/)[0] || (authStatus === 'loading' ? 'Tài khoản' : 'Đăng nhập');

  return (
    <div className="app-shell">
      <header className="site-header">
        {showNotice ? (
          <div className="notice-bar">
            <p>Dữ liệu món bánh và giá bán đang ở giai đoạn minh họa.</p>
            <button type="button" onClick={() => setShowNotice(false)} aria-label="Ẩn thông báo">
              <X aria-hidden="true" size={16} />
            </button>
          </div>
        ) : null}
        <div className="masthead page-frame">
          <details className="mobile-menu">
            <summary aria-label="Mở điều hướng"><Menu aria-hidden="true" size={24} /></summary>
            <nav aria-label="Điều hướng trên điện thoại">
              <Link to="/">Công thức</Link>
              <Link to="/dang-nhap">{accountLabel}</Link>
              <Link to="/admin">Quản trị</Link>
            </nav>
          </details>
          <nav className="masthead__nav masthead__nav--left" aria-label="Điều hướng chính">
            <Link to="/">Công thức</Link>
            <span aria-disabled="true">Câu chuyện</span>
          </nav>
          <Link className="wordmark" to="/">
            <strong>E·COMMERCE</strong>
            <span>technology · sổ tay làm bánh</span>
          </Link>
          <Link className="mobile-cart-link cart-link" to="/gio-hang" aria-label={`Giỏ hàng có ${itemCount} sản phẩm`}>
            <ShoppingBasket aria-hidden="true" size={20} />
            <b>{itemCount}</b>
          </Link>
          <nav className="masthead__nav masthead__nav--right" aria-label="Tiện ích">
            <Link to="/admin">Quản trị</Link>
            <Link className="account-link" to="/dang-nhap" title={user?.displayName}>{accountLabel}</Link>
            <Link className="cart-link" to="/gio-hang" aria-label={`Giỏ hàng có ${itemCount} sản phẩm`}>
              <ShoppingBasket aria-hidden="true" size={20} />
              <b>{itemCount}</b>
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="page-frame">
          <p className="site-footer__masthead">Nướng một mẻ vừa đủ.</p>
          <div className="site-footer__line">
            <span>Dự án cá nhân đang phát triển</span>
            <Link to="/">Đọc công thức</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
