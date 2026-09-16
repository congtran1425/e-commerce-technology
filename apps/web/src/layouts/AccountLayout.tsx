import { ClipboardList, Home, LogOut, MapPin, UserRound } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { firstName } from '../features/account/labels';

const accountLinks = [
  { to: '/tai-khoan', end: true, label: 'Tổng quan', icon: Home },
  { to: '/tai-khoan/don-hang', label: 'Đơn hàng', icon: ClipboardList },
  { to: '/tai-khoan/dia-chi', label: 'Sổ địa chỉ', icon: MapPin },
  { to: '/tai-khoan/ho-so', label: 'Hồ sơ', icon: UserRound },
];

export function AccountLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError('');
    try {
      await logout();
      navigate('/', { replace: true });
    } catch {
      setLogoutError('Chưa thể đăng xuất thiết bị này. Hãy thử lại.');
      setLoggingOut(false);
    }
  }

  return (
    <section className="account-page page-frame" aria-labelledby="account-ledger-heading">
      <header className="account-page__mast">
        <div>
          <p>Sổ bếp cá nhân</p>
          <h1 id="account-ledger-heading">Chào {firstName(user?.displayName ?? 'bạn')}.</h1>
        </div>
        <p>Lưu nơi nhận, theo dõi từng đơn và giữ thông tin của bạn gọn trong một chỗ.</p>
      </header>

      <div className="account-workspace">
        <aside className="account-index">
          <nav aria-label="Các mục trong tài khoản">
            {accountLinks.map(({ to, end, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={end}>
                <Icon aria-hidden="true" size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <button type="button" disabled={loggingOut} onClick={() => void handleLogout()}>
            <LogOut aria-hidden="true" size={18} />
            <span>{loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}</span>
          </button>
          {logoutError ? <p role="alert">{logoutError}</p> : null}
        </aside>

        <div className="account-content">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
