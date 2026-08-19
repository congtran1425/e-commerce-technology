import { Link, Outlet } from 'react-router-dom';

export function CustomerLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/">E-commerce Technology</Link>
        <nav aria-label="Điều hướng chính">
          <Link to="/admin">Quản trị</Link>
        </nav>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
