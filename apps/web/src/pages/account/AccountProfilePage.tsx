import { AlertCircle, LoaderCircle, Save } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { fetchAccountOverview, updateAccountProfile } from '../../features/account/api';
import { accountDate } from '../../features/account/labels';
import type { AccountProfile } from '../../features/account/types';
import { useAuth } from '../../features/auth/AuthContext';

const PHONE_PATTERN = /^(?:\+84|0)\d{9,10}$/;

export function AccountProfilePage() {
  const { refresh } = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState({ displayName: false, phone: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetchAccountOverview(controller.signal)
      .then(({ profile: nextProfile }) => {
        setProfile(nextProfile);
        setDisplayName(nextProfile.displayName);
        setPhone(nextProfile.phone ?? '');
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Chưa thể đọc hồ sơ.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const fieldErrors = useMemo(() => {
    const normalizedPhone = phone.trim().replace(/[\s.-]/g, '');
    return {
      displayName: displayName.trim().length < 2 ? 'Tên hiển thị cần có ít nhất 2 ký tự.' : '',
      phone: normalizedPhone && !PHONE_PATTERN.test(normalizedPhone) ? 'Số điện thoại cần bắt đầu bằng 0 hoặc +84.' : '',
    };
  }, [displayName, phone]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ displayName: true, phone: true });
    if (fieldErrors.displayName || fieldErrors.phone) return;

    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const nextProfile = await updateAccountProfile({
        displayName: displayName.trim(),
        phone: phone.trim() || null,
      });
      setProfile(nextProfile);
      setDisplayName(nextProfile.displayName);
      setPhone(nextProfile.phone ?? '');
      await refresh();
      setSaved(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Chưa thể lưu hồ sơ.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="account-detail-loading" role="status"><LoaderCircle aria-hidden="true" /> Đang đọc hồ sơ…</div>;
  if (!profile) return <section className="account-state" role="alert"><AlertCircle aria-hidden="true" /><h2>Chưa mở được hồ sơ</h2><p>{error}</p></section>;

  return (
    <section className="account-profile" aria-labelledby="profile-heading">
      <header className="account-section-heading"><h2 id="profile-heading">Hồ sơ của bạn.</h2><p>Email dùng để đăng nhập; tên và số điện thoại giúp điền thông tin nhận hàng nhanh hơn.</p></header>
      <form className="account-form" onSubmit={handleSubmit} noValidate aria-busy={saving}>
        <label className="account-field">
          <span>Tên hiển thị</span>
          <input value={displayName} maxLength={100} autoComplete="name" aria-invalid={touched.displayName && Boolean(fieldErrors.displayName)} aria-describedby="profile-name-help" onBlur={() => setTouched((current) => ({ ...current, displayName: true }))} onChange={(event) => { setDisplayName(event.target.value); setSaved(false); }} />
          <small id="profile-name-help" data-error={touched.displayName && Boolean(fieldErrors.displayName)}>{touched.displayName && fieldErrors.displayName ? fieldErrors.displayName : 'Tên này xuất hiện trên thanh tài khoản.'}</small>
        </label>
        <label className="account-field">
          <span>Số điện thoại</span>
          <input value={phone} maxLength={20} inputMode="tel" autoComplete="tel" placeholder="090 123 4567" aria-invalid={touched.phone && Boolean(fieldErrors.phone)} aria-describedby="profile-phone-help" onBlur={() => setTouched((current) => ({ ...current, phone: true }))} onChange={(event) => { setPhone(event.target.value); setSaved(false); }} />
          <small id="profile-phone-help" data-error={touched.phone && Boolean(fieldErrors.phone)}>{touched.phone && fieldErrors.phone ? fieldErrors.phone : 'Có thể để trống và bổ sung sau.'}</small>
        </label>
        <label className="account-field">
          <span>Địa chỉ email</span>
          <input value={profile.email} type="email" disabled aria-disabled="true" />
          <small>Chưa hỗ trợ đổi email vì cần thêm bước xác minh địa chỉ mới.</small>
        </label>
        <p className="account-member-note">Tài khoản được tạo ngày {accountDate.format(new Date(profile.createdAt))}.</p>
        {error ? <p className="account-feedback account-feedback--error" role="alert"><AlertCircle aria-hidden="true" /> {error}</p> : null}
        {saved ? <p className="account-feedback account-feedback--success" role="status">Hồ sơ đã được cập nhật.</p> : null}
        <button className="account-button" type="submit" disabled={saving || Boolean(fieldErrors.displayName || fieldErrors.phone)}>
          {saving ? <><LoaderCircle aria-hidden="true" /> Đang lưu…</> : <><Save aria-hidden="true" /> Lưu hồ sơ</>}
        </button>
      </form>
    </section>
  );
}
