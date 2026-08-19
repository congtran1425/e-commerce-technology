import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="app-content">
      <p className="eyebrow">404</p>
      <h1>Không tìm thấy trang</h1>
      <Link to="/">Quay về trang chủ</Link>
    </main>
  );
}
