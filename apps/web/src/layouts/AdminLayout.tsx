import { Link, Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <strong>Khu vực quản trị</strong>
        <nav aria-label="Điều hướng quản trị">
          <Link to="/">Về cửa hàng</Link>
        </nav>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
