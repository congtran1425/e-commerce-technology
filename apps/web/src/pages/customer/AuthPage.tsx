import { AlertTriangle, ArrowRight, CheckCircle2, LoaderCircle, LogOut } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthApiError } from '../../features/auth/api';
import { useAuth } from '../../features/auth/AuthContext';

type Mode = 'login' | 'register';
type FieldName = 'displayName' | 'email' | 'password' | 'confirmPassword';

type FormValues = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const INITIAL_VALUES: FormValues = { displayName: '', email: '', password: '', confirmPassword: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value)) return null;
  return value.startsWith('/dang-nhap') ? null : value;
}

function validateField(name: FieldName, value: string, mode: Mode) {
  const trimmedValue = value.trim();

  if (name === 'displayName' && mode === 'register' && trimmedValue.length < 2) {
    return 'Tên hiển thị cần có ít nhất 2 ký tự.';
  }
  if (name === 'email' && !EMAIL_PATTERN.test(trimmedValue)) {
    return 'Email chưa đúng định dạng. Hãy kiểm tra lại phần trước và sau dấu @.';
  }
  if (name === 'password' && value.length < 10) {
    return 'Mật khẩu cần có ít nhất 10 ký tự.';
  }
  return null;
}

export function AuthPage() {
  const { login, logout, register, status, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requestedNextPath = safeNextPath(searchParams.get('next'));
  const fieldErrors = useMemo(() => ({
    displayName: validateField('displayName', values.displayName, mode),
    email: validateField('email', values.email, mode),
    password: validateField('password', values.password, mode),
    confirmPassword: mode === 'register' && values.confirmPassword !== values.password
      ? 'Hai mật khẩu chưa khớp.'
      : null,
  }), [mode, values]);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setTouched({});
    setFormError(null);
    setNotice(null);
    setValues((current) => ({ ...current, displayName: '', password: '', confirmPassword: '' }));
  }

  function updateValue(name: FieldName, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    if (formError) setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requiredFields: FieldName[] = mode === 'register'
      ? ['displayName', 'email', 'password', 'confirmPassword']
      : ['email', 'password'];

    setTouched(Object.fromEntries(requiredFields.map((name) => [name, true])));
    if (requiredFields.some((name) => fieldErrors[name])) {
      setFormError('Một vài thông tin chưa hợp lệ. Hãy sửa các mục được đánh dấu.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (mode === 'register') {
        await register({
          displayName: values.displayName.trim(),
          email: values.email.trim(),
          password: values.password,
        });
        setNotice('Đã nhận đăng ký. Kiểm tra hộp thư để xác minh email rồi đăng nhập.');
        setMode('login');
        setValues((current) => ({ ...current, password: '', confirmPassword: '' }));
        return;
      }
      const nextUser = await login({ email: values.email.trim(), password: values.password });
      navigate(requestedNextPath ?? (nextUser.role === 'ADMIN' ? '/admin' : '/tai-khoan'), { replace: true });
    } catch (error) {
      setFormError(error instanceof AuthApiError ? error.message : 'Chưa thể kết nối đến máy chủ tài khoản. Hãy thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await logout();
    } catch (error) {
      setFormError(error instanceof AuthApiError ? error.message : 'Chưa thể đăng xuất. Hãy thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'loading') {
    return <div className="auth-route-status page-frame" role="status">Đang đọc phiên đăng nhập…</div>;
  }

  if (user) {
    const signedInDestination = requestedNextPath ?? (user.role === 'ADMIN' ? '/admin' : '/tai-khoan');
    return (
      <section className="auth-page auth-page--signed-in page-frame" aria-labelledby="account-heading">
        <div className="auth-intro">
          <p className="kicker">Phiên hiện tại</p>
          <h1 id="account-heading">Chào {user.displayName}.</h1>
          <p>Phiên này vẫn đang hoạt động. Bạn có thể mở khu vực của mình hoặc kết thúc phiên trên thiết bị hiện tại.</p>
        </div>
        <div className="auth-session">
          <CheckCircle2 aria-hidden="true" size={22} />
          <div>
            <strong>Đã đăng nhập</strong>
            <span>{user.email}</span>
          </div>
          <Link className="primary-button" to={signedInDestination}>{requestedNextPath ? 'Tiếp tục công việc' : user.role === 'ADMIN' ? 'Mở bàn quản trị' : 'Mở sổ bếp'} <ArrowRight aria-hidden="true" size={18} /></Link>
          <button className="text-button" type="button" disabled={isSubmitting} onClick={() => void handleLogout()}>
            <LogOut aria-hidden="true" size={17} /> {isSubmitting ? 'Đang đăng xuất…' : 'Đăng xuất thiết bị này'}
          </button>
          {formError ? <p className="form-alert" role="alert"><AlertTriangle aria-hidden="true" size={17} /> {formError}</p> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="auth-page page-frame" aria-labelledby="auth-heading">
      <div className="auth-intro">
        <p className="kicker">Giỏ bánh của bạn vẫn ở đây</p>
        <h1 id="auth-heading">Giữ giỏ, rồi làm tiếp.</h1>
        <p>Bạn vẫn được đọc công thức và sửa giỏ khi chưa có tài khoản. Đăng nhập chỉ bắt đầu khi bạn chuyển sang đặt hàng.</p>
      </div>

      <div className="auth-form-panel">
        <div className="auth-mode-switch" role="group" aria-label="Chọn cách tiếp tục">
          <button type="button" data-active={mode === 'login'} aria-pressed={mode === 'login'} onClick={() => changeMode('login')}>Đăng nhập</button>
          <button type="button" data-active={mode === 'register'} aria-pressed={mode === 'register'} onClick={() => changeMode('register')}>Tạo tài khoản</button>
        </div>

        <h2>{mode === 'login' ? 'Mở lại phiên của bạn' : 'Tạo tài khoản để đặt hàng'}</h2>
        <p className="auth-form-panel__note">
          {mode === 'login' ? 'Nhập email và mật khẩu đã đăng ký.' : 'Tên này sẽ dùng khi hiển thị tài khoản và đơn hàng.'}
        </p>

        <form className="auth-form" aria-busy={isSubmitting} noValidate onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label className="auth-field">
              <span>Tên hiển thị</span>
              <input
                name="displayName"
                type="text"
                autoComplete="name"
                maxLength={100}
                required
                value={values.displayName}
                aria-invalid={touched.displayName && Boolean(fieldErrors.displayName)}
                aria-describedby="display-name-help"
                onBlur={() => setTouched((current) => ({ ...current, displayName: true }))}
                onChange={(event) => updateValue('displayName', event.target.value)}
              />
              <small id="display-name-help" data-error={touched.displayName && Boolean(fieldErrors.displayName)}>
                {touched.displayName && fieldErrors.displayName ? fieldErrors.displayName : 'Ví dụ: Minh Anh'}
              </small>
            </label>
          ) : null}

          <label className="auth-field">
            <span>Địa chỉ email</span>
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              required
              value={values.email}
              aria-invalid={touched.email && Boolean(fieldErrors.email)}
              aria-describedby="email-help"
              onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              onChange={(event) => updateValue('email', event.target.value)}
            />
            <small id="email-help" data-error={touched.email && Boolean(fieldErrors.email)}>
              {touched.email && fieldErrors.email ? fieldErrors.email : 'Ví dụ: ban@example.com'}
            </small>
          </label>

          <label className="auth-field">
            <span>Mật khẩu</span>
            <input
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={10}
              maxLength={128}
              required
              value={values.password}
              aria-invalid={touched.password && Boolean(fieldErrors.password)}
              aria-describedby="password-help"
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              onChange={(event) => updateValue('password', event.target.value)}
            />
            <small id="password-help" data-error={touched.password && Boolean(fieldErrors.password)}>
              {touched.password && fieldErrors.password ? fieldErrors.password : 'Dùng ít nhất 10 ký tự.'}
            </small>
          </label>

          {mode === 'register' ? (
            <label className="auth-field">
              <span>Nhập lại mật khẩu</span>
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={10}
                maxLength={128}
                required
                value={values.confirmPassword}
                aria-invalid={touched.confirmPassword && Boolean(fieldErrors.confirmPassword)}
                aria-describedby="confirm-password-help"
                onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                onChange={(event) => updateValue('confirmPassword', event.target.value)}
              />
              <small id="confirm-password-help" data-error={touched.confirmPassword && Boolean(fieldErrors.confirmPassword)}>
                {touched.confirmPassword && fieldErrors.confirmPassword ? fieldErrors.confirmPassword : 'Nhập lại đúng mật khẩu ở trên.'}
              </small>
            </label>
          ) : null}

          {formError ? <p className="form-alert" role="alert"><AlertTriangle aria-hidden="true" size={17} /> {formError}</p> : null}
          {notice ? <p role="status">{notice}</p> : null}

          <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><LoaderCircle aria-hidden="true" size={18} /> Đang xử lý…</> : <>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'} <ArrowRight aria-hidden="true" size={18} /></>}
          </button>
        </form>
        <p><Link to="/quen-mat-khau">Quên mật khẩu?</Link> · <Link to="/gui-lai-xac-minh">Gửi lại thư xác minh</Link></p>
      </div>
    </section>
  );
}
