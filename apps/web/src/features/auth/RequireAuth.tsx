import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { AuthRole } from './types';

type RequireAuthProps = {
  children: ReactNode;
  allowedRoles?: AuthRole[];
};

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { refresh, status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <div className="auth-route-status page-frame" role="status">Đang kiểm tra phiên đăng nhập…</div>;
  }

  if (status === 'error') {
    return (
      <section className="auth-route-status page-frame" role="alert">
        <p>Chưa thể kiểm tra phiên đăng nhập.</p>
        <button className="text-button" type="button" onClick={() => void refresh()}>Kiểm tra lại</button>
      </section>
    );
  }

  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/dang-nhap?next=${encodeURIComponent(next)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const destination = user.role === 'ADMIN' ? '/admin' : '/tai-khoan';
    return (
      <section className="auth-route-status page-frame" aria-labelledby="forbidden-heading">
        <h1 id="forbidden-heading">Bạn không có quyền mở trang này.</h1>
        <p>Tài khoản đang đăng nhập không được cấp quyền cho khu vực này. Hãy dùng đúng tài khoản hoặc quay về khu vực của bạn.</p>
        <Link className="text-link" to={destination}>Mở khu vực của tôi</Link>
        <Link className="text-link" to="/dang-nhap">Đổi tài khoản</Link>
      </section>
    );
  }

  return children;
}
