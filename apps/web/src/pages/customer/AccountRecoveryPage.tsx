import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthApiError, forgotPassword, resendVerification, resetPassword, verifyEmail } from '../../features/auth/api';

type Mode = 'forgot' | 'resend' | 'verify' | 'reset';

const titles: Record<Mode, string> = {
  forgot: 'Quên mật khẩu',
  resend: 'Gửi lại thư xác minh',
  verify: 'Xác minh email',
  reset: 'Đặt lại mật khẩu',
};

export function AccountRecoveryPage({ mode }: { mode: Mode }) {
  const location = useLocation();
  const [token] = useState(() => new URLSearchParams(location.hash.slice(1)).get('token')
    ?? new URLSearchParams(location.search).get('token')
    ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (location.search || location.hash) window.history.replaceState(window.history.state, '', location.pathname);
  }, [location.hash, location.pathname, location.search]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if ((mode === 'verify' || mode === 'reset') && !token) {
      setError('Liên kết không có mã xác thực. Vui lòng mở lại từ email.');
      return;
    }
    if (mode === 'reset' && (password.length < 10 || password !== confirmation)) {
      setError('Mật khẩu cần ít nhất 10 ký tự và hai lần nhập phải khớp.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === 'forgot') await forgotPassword(email);
      if (mode === 'resend') await resendVerification(email);
      if (mode === 'verify') await verifyEmail(token);
      if (mode === 'reset') await resetPassword(token, password);
      setComplete(true);
      setPassword('');
      setConfirmation('');
    } catch (cause) {
      setError(cause instanceof AuthApiError ? cause.message : 'Chưa thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page page-frame" aria-labelledby="recovery-heading">
      <div className="auth-intro">
        <p className="kicker">Một Mẻ Bánh · Tài khoản</p>
        <h1 id="recovery-heading">{titles[mode]}</h1>
        <p>{mode === 'verify' ? 'Xác minh địa chỉ email trước khi đặt hàng.' : 'Thông tin tài khoản của bạn được giữ riêng tư.'}</p>
      </div>
      <div className="auth-form-panel">
        {complete ? (
          <div role="status">
            <h2>{mode === 'verify' ? 'Email đã được xác minh' : mode === 'reset' ? 'Mật khẩu đã được đổi' : 'Đã nhận yêu cầu'}</h2>
            <p>{mode === 'forgot' || mode === 'resend' ? 'Nếu email phù hợp, bạn sẽ nhận được thư hướng dẫn. Hãy kiểm tra cả thư rác.' : 'Bạn có thể đăng nhập để tiếp tục.'}</p>
            <Link to="/dang-nhap">Đến trang đăng nhập</Link>
          </div>
        ) : (
          <form className="auth-form" noValidate aria-busy={busy} onSubmit={(event) => void submit(event)}>
            {mode === 'forgot' || mode === 'resend' ? (
              <label className="auth-field"><span>Địa chỉ email</span><input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            ) : null}
            {mode === 'reset' ? <>
              <label className="auth-field"><span>Mật khẩu mới</span><input type="password" autoComplete="new-password" required minLength={10} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              <label className="auth-field"><span>Nhập lại mật khẩu</span><input type="password" autoComplete="new-password" required minLength={10} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
            </> : null}
            {error ? <p className="form-alert" role="alert">{error}</p> : null}
            <button className="primary-button auth-submit" type="submit" disabled={busy}>{busy ? 'Đang xử lý…' : mode === 'verify' ? 'Xác minh email' : mode === 'reset' ? 'Đổi mật khẩu' : 'Gửi yêu cầu'}</button>
            <Link to="/dang-nhap">Quay lại đăng nhập</Link>
          </form>
        )}
      </div>
    </section>
  );
}
