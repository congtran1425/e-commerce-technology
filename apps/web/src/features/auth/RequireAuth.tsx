import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
    return <Navigate to="/" replace />;
  }

  return children;
}
