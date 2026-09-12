import { BarChart3, Banknote, Boxes, LayoutDashboard, LogOut, Menu, PackageCheck, PackageSearch, ReceiptText } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export function AdminLayout() {
  const { logout, user } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  function closeMobileMenu() {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  const navigation = (
    <>
      <span className="admin-nav-label">Điều hành</span>
      <NavLink end to="/admin" onClick={closeMobileMenu}><LayoutDashboard aria-hidden="true" size={18} /> Tổng quan</NavLink>
      <NavLink to="/admin/don-hang" onClick={closeMobileMenu}><ReceiptText aria-hidden="true" size={18} /> Đơn hàng</NavLink>
      <NavLink to="/admin/van-chuyen" onClick={closeMobileMenu}><PackageCheck aria-hidden="true" size={18} /> Vận chuyển</NavLink>
      <NavLink to="/admin/giao-dich" onClick={closeMobileMenu}><Banknote aria-hidden="true" size={18} /> Giao dịch</NavLink>
      <span className="admin-nav-label">Hàng hóa</span>
      <NavLink to="/admin/san-pham" onClick={closeMobileMenu}><PackageSearch aria-hidden="true" size={18} /> Sản phẩm</NavLink>
      <NavLink to="/admin/kho" onClick={closeMobileMenu}><Boxes aria-hidden="true" size={18} /> Kho vận</NavLink>
      <span className="admin-nav-label">Phân tích</span>
      <NavLink to="/admin/bao-cao" onClick={closeMobileMenu}><BarChart3 aria-hidden="true" size={18} /> Báo cáo</NavLink>
    </>
  );

  return (
    <div className="admin-shell" data-admin-shell>
      <aside className="admin-rail">
        <Link className="admin-wordmark" to="/admin"><strong>E·COM</strong><span>Bàn quản trị</span></Link>
        <nav aria-label="Điều hướng quản trị">{navigation}</nav>
        <Link className="admin-store-link" to="/">Mở cửa hàng ↗</Link>
      </aside>
      <header className="admin-mobile-header">
        <Link className="admin-wordmark" to="/admin"><strong>E·COM</strong><span>Bàn quản trị</span></Link>
        <details ref={mobileMenuRef} className="admin-mobile-menu">
          <summary aria-label="Mở điều hướng quản trị"><Menu aria-hidden="true" size={22} /></summary>
          <nav aria-label="Điều hướng quản trị trên điện thoại">{navigation}<Link to="/" onClick={closeMobileMenu}>Mở cửa hàng ↗</Link></nav>
        </details>
      </header>
      <div className="admin-main-column">
        <header className="admin-account-bar">
          <div><span>Đang làm việc với quyền quản trị</span><strong>{user?.displayName}</strong></div>
          <button className="admin-button admin-button--quiet" type="button" disabled={loggingOut} onClick={() => void handleLogout()}><LogOut aria-hidden="true" size={17} /> {loggingOut ? 'Đang thoát…' : 'Đăng xuất'}</button>
        </header>
        <main className="admin-main"><Outlet /></main>
        <footer className="admin-footer"><span>Dữ liệu được lưu qua API, không ghi trực tiếp từ trình duyệt.</span><Link to="/">Cửa hàng</Link></footer>
      </div>
    </div>
  );
}
