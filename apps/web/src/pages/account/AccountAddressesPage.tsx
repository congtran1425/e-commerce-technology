import { AlertCircle, Check, LoaderCircle, MapPin, Pencil, Plus, Trash2, Undo2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  createAccountAddress,
  deleteAccountAddress,
  fetchAccountAddresses,
  updateAccountAddress,
} from '../../features/account/api';
import type { AccountAddress, AccountAddressInput } from '../../features/account/types';
import { useAuth } from '../../features/auth/AuthContext';

type AddressFormValues = Required<AccountAddressInput>;
type AddressFieldName = Exclude<keyof AddressFormValues, 'isDefault'>;

const EMPTY_ADDRESS: AddressFormValues = {
  label: '',
  recipientName: '',
  phone: '',
  addressLine: '',
  ward: '',
  district: '',
  province: '',
  isDefault: false,
};

const addressFields: Array<{
  name: AddressFieldName;
  label: string;
  autoComplete?: string;
  placeholder?: string;
  full?: boolean;
}> = [
  { name: 'label', label: 'Tên gợi nhớ', placeholder: 'Nhà, Công ty…' },
  { name: 'recipientName', label: 'Họ tên người nhận', autoComplete: 'name' },
  { name: 'phone', label: 'Số điện thoại', autoComplete: 'tel', placeholder: '090 123 4567' },
  { name: 'addressLine', label: 'Số nhà và tên đường', autoComplete: 'address-line1', full: true },
  { name: 'ward', label: 'Phường hoặc xã', autoComplete: 'address-level3' },
  { name: 'district', label: 'Quận hoặc huyện', autoComplete: 'address-level2' },
  { name: 'province', label: 'Tỉnh hoặc thành phố', autoComplete: 'address-level1', full: true },
];

function valuesFromAddress(address: AccountAddress | null, fallbackName: string, fallbackPhone: string) {
  if (!address) return { ...EMPTY_ADDRESS, recipientName: fallbackName, phone: fallbackPhone };
  return {
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    addressLine: address.addressLine,
    ward: address.ward ?? '',
    district: address.district,
    province: address.province,
    isDefault: address.isDefault,
  };
}

function validateAddress(values: AddressFormValues) {
  const errors: Partial<Record<AddressFieldName, string>> = {};
  if (!values.label.trim()) errors.label = 'Đặt một tên ngắn để dễ nhận ra địa chỉ.';
  if (values.recipientName.trim().length < 2) errors.recipientName = 'Nhập đầy đủ họ tên người nhận.';
  const phone = values.phone.trim().replace(/[\s.-]/g, '');
  if (!/^(?:\+84|0)\d{9,10}$/.test(phone)) errors.phone = 'Nhập số điện thoại bắt đầu bằng 0 hoặc +84.';
  if (!values.addressLine.trim()) errors.addressLine = 'Nhập số nhà và tên đường.';
  if (!values.district.trim()) errors.district = 'Nhập quận hoặc huyện.';
  if (!values.province.trim()) errors.province = 'Nhập tỉnh hoặc thành phố.';
  return errors;
}

function AddressEditor({
  address,
  fallbackName,
  fallbackPhone,
  onCancel,
  onSave,
}: {
  address: AccountAddress | null;
  fallbackName: string;
  fallbackPhone: string;
  onCancel: () => void;
  onSave: (input: AccountAddressInput, clearWard: boolean) => Promise<void>;
}) {
  const [values, setValues] = useState(() => valuesFromAddress(address, fallbackName, fallbackPhone));
  const [touched, setTouched] = useState<Partial<Record<AddressFieldName, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const errors = useMemo(() => validateAddress(values), [values]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(Object.fromEntries(addressFields.map(({ name }) => [name, true])));
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    setError('');
    try {
      await onSave({
        label: values.label.trim(),
        recipientName: values.recipientName.trim(),
        phone: values.phone,
        addressLine: values.addressLine.trim(),
        ward: values.ward.trim() || undefined,
        district: values.district.trim(),
        province: values.province.trim(),
        ...(address ? {} : { isDefault: values.isDefault }),
      }, Boolean(address && !values.ward.trim()));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Chưa thể lưu địa chỉ.');
      setSaving(false);
    }
  }

  return (
    <form className="account-address-form" onSubmit={handleSubmit} noValidate aria-busy={saving}>
      <header><h3>{address ? `Sửa ${address.label}` : 'Thêm nơi nhận'}</h3><p>Địa chỉ này chỉ dùng để điền nhanh; đơn đã tạo vẫn giữ nguyên thông tin cũ.</p></header>
      <div className="account-address-fields">
        {addressFields.map(({ name, label, autoComplete, placeholder, full }) => {
          const fieldError = touched[name] ? errors[name] : undefined;
          return (
            <label key={name} className={`account-field${full ? ' account-field--full' : ''}`}>
              <span>{label}{name === 'ward' ? ' (không bắt buộc)' : ''}</span>
              <input
                name={name}
                value={values[name]}
                autoComplete={autoComplete}
                placeholder={placeholder}
                maxLength={name === 'addressLine' ? 250 : name === 'recipientName' ? 100 : name === 'label' ? 40 : name === 'phone' ? 20 : 120}
                inputMode={name === 'phone' ? 'tel' : undefined}
                disabled={saving}
                aria-invalid={fieldError ? 'true' : undefined}
                aria-describedby={`address-${name}-help`}
                onBlur={() => setTouched((current) => ({ ...current, [name]: true }))}
                onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
              />
              <small id={`address-${name}-help`} data-error={fieldError ? 'true' : undefined}>{fieldError ?? ' '}</small>
            </label>
          );
        })}
        {!address ? (
          <label className="account-default-check account-field--full">
            <input type="checkbox" checked={values.isDefault} onChange={(event) => setValues((current) => ({ ...current, isDefault: event.target.checked }))} />
            <span>Dùng làm địa chỉ mặc định khi thanh toán</span>
          </label>
        ) : null}
      </div>
      {error ? <p className="account-feedback account-feedback--error" role="alert"><AlertCircle aria-hidden="true" /> {error}</p> : null}
      <div className="account-form-actions">
        <button className="account-button" type="submit" disabled={saving || Object.keys(errors).length > 0}>{saving ? <><LoaderCircle aria-hidden="true" /> Đang lưu…</> : 'Lưu địa chỉ'}</button>
        <button className="account-text-button" type="button" disabled={saving} onClick={onCancel}>Đóng biểu mẫu</button>
      </div>
    </form>
  );
}

export function AccountAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletedAddress, setDeletedAddress] = useState<AccountAddress | null>(null);
  const undoTimer = useRef<number | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setError('');
    try {
      setAddresses(await fetchAccountAddresses(signal));
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
      setError(requestError instanceof Error ? requestError.message : 'Chưa thể đọc sổ địa chỉ.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => {
      controller.abort();
      if (undoTimer.current) window.clearTimeout(undoTimer.current);
    };
  }, [load]);

  const editingAddress = editingId && editingId !== 'new'
    ? addresses.find((address) => address.id === editingId) ?? null
    : null;

  async function saveAddress(input: AccountAddressInput, clearWard: boolean) {
    if (editingAddress) {
      const { isDefault: _ignoredDefault, ...editableInput } = input;
      await updateAccountAddress(editingAddress.id, {
        ...editableInput,
        ...(clearWard ? { ward: null } : {}),
      });
    }
    else await createAccountAddress(input);
    setEditingId(null);
    await load();
  }

  async function makeDefault(addressId: string) {
    setBusyId(addressId);
    setError('');
    try {
      await updateAccountAddress(addressId, { isDefault: true });
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Chưa thể đổi địa chỉ mặc định.');
    } finally {
      setBusyId(null);
    }
  }

  async function removeAddress(address: AccountAddress) {
    const previous = addresses;
    setAddresses((current) => current.filter((item) => item.id !== address.id));
    setBusyId(address.id);
    setError('');
    try {
      await deleteAccountAddress(address.id);
      await load();
      setDeletedAddress(address);
      if (undoTimer.current) window.clearTimeout(undoTimer.current);
      undoTimer.current = window.setTimeout(() => setDeletedAddress(null), 8_000);
    } catch (requestError) {
      setAddresses(previous);
      setError(requestError instanceof Error ? requestError.message : 'Chưa thể xóa địa chỉ.');
    } finally {
      setBusyId(null);
    }
  }

  async function undoDelete() {
    if (!deletedAddress) return;
    const snapshot = deletedAddress;
    setDeletedAddress(null);
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    try {
      await createAccountAddress({
        label: snapshot.label,
        recipientName: snapshot.recipientName,
        phone: snapshot.phone,
        addressLine: snapshot.addressLine,
        ward: snapshot.ward ?? undefined,
        district: snapshot.district,
        province: snapshot.province,
        isDefault: snapshot.isDefault,
      });
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Chưa thể khôi phục địa chỉ.');
    }
  }

  return (
    <section className="account-addresses" aria-labelledby="addresses-heading">
      <header className="account-section-heading account-section-heading--with-control">
        <div><h2 id="addresses-heading">Sổ địa chỉ.</h2><p>Lưu những nơi thường nhận hàng để không phải gõ lại ở mỗi mẻ bánh.</p></div>
        <button className="account-button" type="button" onClick={() => setEditingId('new')}><Plus aria-hidden="true" /> Thêm địa chỉ</button>
      </header>
      {error ? <p className="account-feedback account-feedback--error" role="alert"><AlertCircle aria-hidden="true" /> {error}</p> : null}
      {loading ? <div className="account-list-skeleton" role="status" aria-label="Đang tải sổ địa chỉ"><span /><span /></div> : null}

      <div className="account-address-workspace">
        <div className="account-address-list">
          {!loading && addresses.length === 0 ? (
            <div className="account-state">
              <MapPin aria-hidden="true" />
              <h3>Chưa lưu nơi nhận</h3>
              <p>Địa chỉ đầu tiên sẽ tự trở thành địa chỉ mặc định.</p>
              <button className="account-button" type="button" onClick={() => setEditingId('new')}>Thêm nơi nhận</button>
            </div>
          ) : null}
          {addresses.map((address) => (
            <article key={address.id} data-selected={editingId === address.id}>
              <header><div><h3>{address.label}</h3>{address.isDefault ? <span><Check aria-hidden="true" /> Mặc định</span> : null}</div><p>{address.recipientName} · {address.phone}</p></header>
              <p>{[address.addressLine, address.ward, address.district, address.province].filter(Boolean).join(', ')}</p>
              <div className="account-address-actions">
                <button type="button" onClick={() => setEditingId(address.id)}><Pencil aria-hidden="true" /> Sửa</button>
                {!address.isDefault ? <button type="button" disabled={busyId === address.id} onClick={() => void makeDefault(address.id)}>Đặt mặc định</button> : null}
                <button type="button" disabled={busyId === address.id} onClick={() => void removeAddress(address)}><Trash2 aria-hidden="true" /> Xóa</button>
              </div>
            </article>
          ))}
        </div>

        {editingId ? (
          <AddressEditor
            key={editingId}
            address={editingAddress}
            fallbackName={user?.displayName ?? ''}
            fallbackPhone={user?.phone ?? ''}
            onCancel={() => setEditingId(null)}
            onSave={saveAddress}
          />
        ) : (
          <aside className="account-address-note"><strong>Địa chỉ mặc định</strong><p>Được điền trước ở bước thanh toán. Bạn vẫn có thể sửa riêng cho từng đơn trước khi sang ZaloPay.</p></aside>
        )}
      </div>

      {deletedAddress ? (
        <div className="account-toast" role="status">
          <span>Đã xóa “{deletedAddress.label}”.</span>
          <button type="button" onClick={() => void undoDelete()}><Undo2 aria-hidden="true" /> Hoàn tác</button>
        </div>
      ) : null}
    </section>
  );
}
