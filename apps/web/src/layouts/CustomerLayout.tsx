import { Menu, ShoppingBasket, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
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
              <NavLink to="/" end>Trang chủ</NavLink>
              <NavLink to="/cong-thuc">Công thức</NavLink>
              <NavLink to="/cau-chuyen">Câu chuyện</NavLink>
              <Link to="/dang-nhap">{accountLabel}</Link>
              {user?.role === 'ADMIN' ? <Link to="/admin">Quản trị</Link> : null}
            </nav>
          </details>
          <nav className="masthead__nav masthead__nav--left" aria-label="Điều hướng chính">
            <NavLink to="/cong-thuc">Công thức</NavLink>
            <NavLink to="/cau-chuyen">Câu chuyện</NavLink>
          </nav>
          <Link className="wordmark" to="/">
            <strong>Bếp Đủ Bánh</strong>
            <span>công thức · nguyên liệu · dụng cụ</span>
          </Link>
          <Link className="mobile-cart-link cart-link" to="/gio-hang" aria-label={`Giỏ hàng có ${itemCount} sản phẩm`}>
            <ShoppingBasket aria-hidden="true" size={20} />
            <b>{itemCount}</b>
          </Link>
          <nav className="masthead__nav masthead__nav--right" aria-label="Tiện ích">
            {user?.role === 'ADMIN' ? <Link to="/admin">Quản trị</Link> : null}
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
          <nav className="site-footer__nav" aria-label="Điều hướng cuối trang">
            <Link to="/">Trang chủ</Link>
            <Link to="/cong-thuc">Công thức</Link>
            <Link to="/cau-chuyen">Câu chuyện</Link>
          </nav>
          <p className="site-footer__colophon">
            © <time dateTime="2026">2026</time> Bếp Đủ Bánh · Mã nguồn phát hành theo giấy phép MIT.
          </p>
        </div>
      </footer>
    </div>
  );
}
