import {
  AlertTriangle,
  Archive,
  ChevronRight,
  ClipboardList,
  LoaderCircle,
  PackagePlus,
  Plus,
  Search,
  Warehouse,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AdminApiError,
  adjustInventory,
  createAdminProduct,
  createAdminVariant,
  fetchAdminProducts,
  fetchInventoryMovements,
  updateAdminProduct,
  updateAdminVariant,
} from '../../features/admin/api';
import type {
  AdminProduct,
  AdminVariant,
  InventoryMovement,
  InventoryReason,
  MeasurementUnit,
  ProductKind,
} from '../../features/admin/types';

type LoadStatus = 'loading' | 'ready' | 'error';
type ProductFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

const UNIT_LABELS: Record<MeasurementUnit, string> = {
  GRAM: 'g',
  MILLILITER: 'ml',
  PIECE: 'cái',
};

const REASON_LABELS: Record<InventoryReason, string> = {
  INITIAL_STOCK: 'Tồn đầu khi tạo',
  RESTOCK: 'Nhập thêm hàng',
  CORRECTION: 'Điều chỉnh kiểm kê',
  DAMAGED: 'Hư hỏng / hao hụt',
  RETURNED: 'Hàng hoàn về kho',
  ORDER_RESERVED: 'Giữ hàng cho đơn',
  ORDER_RELEASED: 'Hoàn giữ hàng',
};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
const moneyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

function errorMessage(error: unknown) {
  return error instanceof AdminApiError ? error.message : 'Không kết nối được với máy chủ quản trị. Hãy kiểm tra API rồi thử lại.';
}

function ProductCreateForm({ onCreated, onCancel }: { onCreated: (product: AdminProduct) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [kind, setKind] = useState<ProductKind>('INGREDIENT');
  const [sku, setSku] = useState('');
  const [label, setLabel] = useState('');
  const [unit, setUnit] = useState<MeasurementUnit>('GRAM');
  const [packageQuantity, setPackageQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function changeKind(nextKind: ProductKind) {
    setKind(nextKind);
    if (nextKind === 'TOOL') setUnit('PIECE');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const product = await createAdminProduct({
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || null,
        kind,
        variants: [{
          sku: sku.trim(),
          label: label.trim(),
          unit,
          packageQuantity: Number(packageQuantity),
          price: Number(price),
          stockQuantity: Number(stockQuantity),
        }],
      });
      onCreated(product);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="admin-editor" aria-labelledby="create-product-heading">
      <div className="admin-editor__heading">
        <div>
          <span className="admin-context">Sản phẩm mới</span>
          <h2 id="create-product-heading">Tạo mặt hàng và quy cách đầu tiên</h2>
        </div>
        <button className="admin-button admin-button--quiet" type="button" onClick={onCancel}>Đóng</button>
      </div>
      <form className="admin-form" onSubmit={submit} aria-busy={submitting}>
        <label className="admin-field admin-field--wide">
          <span>Tên sản phẩm</span>
          <input required maxLength={180} value={name} onChange={(event) => setName(event.target.value)} />
          <small>Tên hiển thị cho người mua; đường dẫn được tạo tự động.</small>
        </label>
        <label className="admin-field admin-field--wide">
          <span>Mô tả ngắn</span>
          <textarea required maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} />
          <small>Mô tả cụ thể công dụng hoặc đặc điểm, tối đa 500 ký tự.</small>
        </label>
        <label className="admin-field admin-field--wide">
          <span>Địa chỉ ảnh</span>
          <input type="url" maxLength={500} placeholder="https://…" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
          <small>Có thể để trống; bản đầu chỉ lưu địa chỉ ảnh, chưa tải tệp trực tiếp.</small>
        </label>
        <label className="admin-field">
          <span>Loại mặt hàng</span>
          <select value={kind} onChange={(event) => changeKind(event.target.value as ProductKind)}>
            <option value="INGREDIENT">Nguyên liệu</option>
            <option value="TOOL">Dụng cụ</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Mã hàng</span>
          <input required maxLength={80} placeholder="FLOUR-500" value={sku} onChange={(event) => setSku(event.target.value)} />
          <small>Chỉ dùng chữ, số, dấu chấm, gạch ngang hoặc gạch dưới.</small>
        </label>
        <label className="admin-field">
          <span>Tên quy cách</span>
          <input required maxLength={180} placeholder="Túi 500 g" value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <label className="admin-field">
          <span>Đơn vị</span>
          <select disabled={kind === 'TOOL'} value={unit} onChange={(event) => setUnit(event.target.value as MeasurementUnit)}>
            <option value="GRAM">Gam</option>
            <option value="MILLILITER">Mililít</option>
            <option value="PIECE">Cái</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Lượng mỗi gói</span>
          <input required type="number" inputMode="decimal" min="0.001" step="0.001" value={packageQuantity} onChange={(event) => setPackageQuantity(event.target.value)} />
        </label>
        <label className="admin-field">
          <span>Giá bán (đ)</span>
          <input required type="number" inputMode="numeric" min="0" step="1" value={price} onChange={(event) => setPrice(event.target.value)} />
        </label>
        <label className="admin-field">
          <span>Tồn kho ban đầu</span>
          <input required type="number" inputMode="numeric" min="0" step="1" value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} />
        </label>
        {error ? <p className="admin-feedback admin-feedback--error admin-field--wide" role="alert"><AlertTriangle aria-hidden="true" size={17} /> {error}</p> : null}
        <div className="admin-form__actions admin-field--wide">
          <button className="admin-button admin-button--primary" type="submit" disabled={submitting}>
            {submitting ? <><LoaderCircle className="spin" aria-hidden="true" size={17} /> Đang tạo…</> : <><PackagePlus aria-hidden="true" size={17} /> Tạo sản phẩm</>}
          </button>
        </div>
      </form>
    </section>
  );
}

function InventoryHistoryList({ movements }: { movements: InventoryMovement[] }) {
  if (movements.length === 0) return <p className="admin-empty-inline">Chưa có biến động nào được ghi cho quy cách này.</p>;
  return (
    <ol className="inventory-ledger">
      {movements.map((movement) => (
        <li key={movement.id}>
          <div>
            <strong>{movement.quantityDelta > 0 ? '+' : ''}{movement.quantityDelta}</strong>
            <span>{movement.stockBefore} → {movement.stockAfter}</span>
          </div>
          <p><b>{REASON_LABELS[movement.reason]}</b>{movement.note ? ` · ${movement.note}` : ''}</p>
          <small>{dateFormatter.format(new Date(movement.createdAt))} · {movement.actorName ?? movement.orderNumber ?? 'Hệ thống'}</small>
        </li>
      ))}
    </ol>
  );
}

function VariantEditor({ variant, productKind, onProductUpdated, onStockChanged }: {
  variant: AdminVariant;
  productKind: ProductKind;
  onProductUpdated: (product: AdminProduct) => void;
  onStockChanged: (variantId: string, stock: number) => void;
}) {
  const [label, setLabel] = useState(variant.label);
  const [unit, setUnit] = useState<MeasurementUnit>(variant.unit);
  const [packageQuantity, setPackageQuantity] = useState(variant.packageQuantity);
  const [price, setPrice] = useState(String(Number(variant.price)));
  const [active, setActive] = useState(variant.active);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState<'RESTOCK' | 'CORRECTION' | 'DAMAGED' | 'RETURNED'>('RESTOCK');
  const [note, setNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [movements, setMovements] = useState<InventoryMovement[] | null>(null);
  const [historyStatus, setHistoryStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const increaseOnly = reason === 'RESTOCK' || reason === 'RETURNED';
  const decreaseOnly = reason === 'DAMAGED';

  async function saveVariant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaveState('idle');
    setMessage(null);
    try {
      const product = await updateAdminVariant(variant.id, {
        label: label.trim(),
        unit,
        packageQuantity: Number(packageQuantity),
        price: Number(price),
        active,
      });
      onProductUpdated(product);
      setSaveState('success');
      setMessage('Đã lưu thông tin quy cách.');
    } catch (caught) {
      setSaveState('error');
      setMessage(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function submitAdjustment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdjusting(true);
    setMessage(null);
    try {
      const result = await adjustInventory(variant.id, {
        quantityDelta: Number(delta),
        reason,
        note: note.trim() || undefined,
      });
      onStockChanged(variant.id, result.stockQuantity);
      setMovements((current) => current ? [result.movement, ...current] : current);
      setDelta('');
      setNote('');
      setSaveState('success');
      setMessage(`Tồn kho mới: ${result.stockQuantity}.`);
    } catch (caught) {
      setSaveState('error');
      setMessage(errorMessage(caught));
    } finally {
      setAdjusting(false);
    }
  }

  async function loadHistory() {
    if (movements) return;
    setHistoryStatus('loading');
    setSaveState('idle');
    setMessage(null);
    try {
      setMovements(await fetchInventoryMovements(variant.id));
      setHistoryStatus('idle');
    } catch (caught) {
      setHistoryStatus('error');
      setSaveState('error');
      setMessage(errorMessage(caught));
    }
  }

  return (
    <article className="variant-editor">
      <header className="variant-editor__summary">
        <div>
          <strong>{variant.label}</strong>
          <span>{variant.sku} · {variant.packageQuantity} {UNIT_LABELS[variant.unit]} · {moneyFormatter.format(Number(variant.price))}</span>
        </div>
        <div className="variant-editor__stock"><span>Tồn hiện tại</span><b>{variant.stockQuantity}</b></div>
      </header>
      <form className="admin-form admin-form--compact" onSubmit={saveVariant} aria-busy={saving}>
        <label className="admin-field"><span>Tên quy cách</span><input required maxLength={180} value={label} onChange={(event) => setLabel(event.target.value)} /></label>
        <label className="admin-field"><span>Đơn vị</span><select disabled={productKind === 'TOOL'} value={unit} onChange={(event) => setUnit(event.target.value as MeasurementUnit)}><option value="GRAM">Gam</option><option value="MILLILITER">Mililít</option><option value="PIECE">Cái</option></select><small>{productKind === 'TOOL' ? 'Dụng cụ luôn dùng đơn vị cái.' : ''}</small></label>
        <label className="admin-field"><span>Lượng mỗi gói</span><input required type="number" min="0.001" step="0.001" value={packageQuantity} onChange={(event) => setPackageQuantity(event.target.value)} /></label>
        <label className="admin-field"><span>Giá bán (đ)</span><input required type="number" min="0" step="1" value={price} onChange={(event) => setPrice(event.target.value)} /></label>
        <label className="admin-check admin-field--wide"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /><span>Quy cách đang được bán</span></label>
        <div className="admin-form__actions admin-field--wide"><button className="admin-button" type="submit" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu quy cách'}</button></div>
      </form>

      <details className="inventory-panel">
        <summary><Warehouse aria-hidden="true" size={18} /> Điều chỉnh và xem sổ kho</summary>
        <form className="admin-form admin-form--compact inventory-form" onSubmit={submitAdjustment} aria-busy={adjusting}>
          <label className="admin-field"><span>Số lượng thay đổi</span><input required type="number" step="1" min={increaseOnly ? 1 : undefined} max={decreaseOnly ? -1 : undefined} placeholder={decreaseOnly ? '-2' : '12'} value={delta} onChange={(event) => setDelta(event.target.value)} /><small>{decreaseOnly ? 'Nhập số âm vì hàng bị loại khỏi kho.' : increaseOnly ? 'Nhập số dương vì hàng được thêm vào kho.' : 'Dùng số âm để giảm hoặc số dương để tăng.'}</small></label>
          <label className="admin-field"><span>Lý do</span><select value={reason} onChange={(event) => { setReason(event.target.value as typeof reason); setDelta(''); }}><option value="RESTOCK">Nhập thêm hàng</option><option value="CORRECTION">Điều chỉnh kiểm kê</option><option value="DAMAGED">Hư hỏng / hao hụt</option><option value="RETURNED">Hàng hoàn về kho</option></select></label>
          <label className="admin-field admin-field--wide"><span>Ghi chú</span><input maxLength={300} value={note} onChange={(event) => setNote(event.target.value)} /><small>Nên ghi nguồn nhập hoặc nguyên nhân chênh lệch.</small></label>
          <div className="admin-form__actions admin-field--wide"><button className="admin-button admin-button--primary" type="submit" disabled={adjusting}>{adjusting ? 'Đang ghi sổ…' : 'Ghi biến động kho'}</button></div>
        </form>
        <button className="admin-button admin-button--quiet" type="button" disabled={historyStatus === 'loading'} onClick={() => void loadHistory()}>
          <ClipboardList aria-hidden="true" size={17} /> {historyStatus === 'loading' ? 'Đang tải sổ…' : movements ? 'Sổ kho gần nhất' : 'Tải sổ kho'}
        </button>
        {movements ? <InventoryHistoryList movements={movements} /> : null}
      </details>
      {message ? <p className={`admin-feedback admin-feedback--${saveState}`} role={saveState === 'error' ? 'alert' : 'status'}>{saveState === 'error' ? <AlertTriangle aria-hidden="true" size={17} /> : null}{message}</p> : null}
    </article>
  );
}

function AddVariantForm({ product, onCreated }: { product: AdminProduct; onCreated: (product: AdminProduct) => void }) {
  const [sku, setSku] = useState('');
  const [label, setLabel] = useState('');
  const [unit, setUnit] = useState<MeasurementUnit>(product.kind === 'TOOL' ? 'PIECE' : 'GRAM');
  const [packageQuantity, setPackageQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const updated = await createAdminVariant(product.id, { sku, label, unit, packageQuantity: Number(packageQuantity), price: Number(price), stockQuantity: Number(stock) });
      onCreated(updated);
      setSku(''); setLabel(''); setPackageQuantity(''); setPrice(''); setStock('0');
    } catch (caught) { setError(errorMessage(caught)); } finally { setSubmitting(false); }
  }

  return (
    <details className="add-variant-panel">
      <summary><Plus aria-hidden="true" size={17} /> Thêm quy cách bán</summary>
      <form className="admin-form admin-form--compact" onSubmit={submit} aria-busy={submitting}>
        <label className="admin-field"><span>Mã hàng</span><input required maxLength={80} value={sku} onChange={(event) => setSku(event.target.value)} /></label>
        <label className="admin-field"><span>Tên quy cách</span><input required maxLength={180} value={label} onChange={(event) => setLabel(event.target.value)} /></label>
        <label className="admin-field"><span>Đơn vị</span><select disabled={product.kind === 'TOOL'} value={unit} onChange={(event) => setUnit(event.target.value as MeasurementUnit)}><option value="GRAM">Gam</option><option value="MILLILITER">Mililít</option><option value="PIECE">Cái</option></select></label>
        <label className="admin-field"><span>Lượng mỗi gói</span><input required type="number" min="0.001" step="0.001" value={packageQuantity} onChange={(event) => setPackageQuantity(event.target.value)} /></label>
        <label className="admin-field"><span>Giá bán (đ)</span><input required type="number" min="0" step="1" value={price} onChange={(event) => setPrice(event.target.value)} /></label>
        <label className="admin-field"><span>Tồn ban đầu</span><input required type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} /></label>
        {error ? <p className="admin-feedback admin-feedback--error admin-field--wide" role="alert"><AlertTriangle aria-hidden="true" size={17} />{error}</p> : null}
        <div className="admin-form__actions admin-field--wide"><button className="admin-button" type="submit" disabled={submitting}>{submitting ? 'Đang thêm…' : 'Thêm quy cách'}</button></div>
      </form>
    </details>
  );
}

function ProductEditor({ product, onUpdated, onStockChanged }: { product: AdminProduct; onUpdated: (product: AdminProduct) => void; onStockChanged: (variantId: string, stock: number) => void }) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? '');
  const [active, setActive] = useState(product.active);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(null); setFailed(false);
    try {
      onUpdated(await updateAdminProduct(product.id, { name: name.trim(), description: description.trim(), imageUrl: imageUrl.trim() || null, active }));
      setMessage('Đã lưu thông tin sản phẩm.');
    } catch (caught) { setFailed(true); setMessage(errorMessage(caught)); } finally { setSaving(false); }
  }

  return (
    <section className="admin-editor" aria-labelledby="product-editor-heading">
      <div className="admin-editor__heading">
        <div><span className="admin-context">{product.kind === 'INGREDIENT' ? 'Nguyên liệu' : 'Dụng cụ'} · {product.slug}</span><h2 id="product-editor-heading">{product.name}</h2></div>
        <span className="admin-stock-total">Tổng tồn <b>{product.stockQuantity}</b></span>
      </div>
      <form className="admin-form" onSubmit={save} aria-busy={saving}>
        <label className="admin-field admin-field--wide"><span>Tên sản phẩm</span><input required maxLength={180} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="admin-field admin-field--wide"><span>Mô tả ngắn</span><textarea required maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label className="admin-field admin-field--wide"><span>Địa chỉ ảnh</span><input type="url" maxLength={500} placeholder="https://…" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} /><small>Có thể để trống; ảnh hiện được lưu dưới dạng địa chỉ URL.</small></label>
        <label className="admin-check admin-field--wide"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /><span>Sản phẩm đang được bán</span></label>
        <div className="admin-form__actions admin-field--wide"><button className="admin-button admin-button--primary" type="submit" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu sản phẩm'}</button></div>
        {message ? <p className={`admin-feedback admin-feedback--${failed ? 'error' : 'success'} admin-field--wide`} role={failed ? 'alert' : 'status'}>{failed ? <AlertTriangle aria-hidden="true" size={17} /> : null}{message}</p> : null}
      </form>
      <div className="variant-section">
        <div className="variant-section__heading"><h3>Các quy cách bán</h3><span>{product.variants.length} quy cách</span></div>
        {product.variants.map((variant) => <VariantEditor key={variant.id} variant={variant} productKind={product.kind} onProductUpdated={onUpdated} onStockChanged={onStockChanged} />)}
        <AddVariantForm product={product} onCreated={onUpdated} />
      </div>
    </section>
  );
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProductFilter>('ALL');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading'); setLoadError(null); setLoadMoreError(null);
    void fetchAdminProducts({ q: query, status: filter, signal: controller.signal })
      .then((result) => { setProducts(result.items); setNextCursor(result.nextCursor); setSelectedId((current) => result.items.some((item) => item.id === current) ? current : result.items[0]?.id ?? null); setStatus('ready'); })
      .catch((error) => { if (error instanceof DOMException && error.name === 'AbortError') return; setLoadError(errorMessage(error)); setStatus('error'); });
    return () => controller.abort();
  }, [filter, query, reloadKey]);

  const selectedProduct = useMemo(() => products.find((product) => product.id === selectedId) ?? null, [products, selectedId]);

  function replaceProduct(product: AdminProduct) {
    setProducts((current) => current.map((item) => item.id === product.id ? product : item));
  }

  function changeStock(variantId: string, stockQuantity: number) {
    setProducts((current) => current.map((product) => {
      if (!product.variants.some((variant) => variant.id === variantId)) return product;
      const variants = product.variants.map((variant) => variant.id === variantId ? { ...variant, stockQuantity } : variant);
      return { ...product, variants, stockQuantity: variants.reduce((sum, variant) => sum + variant.stockQuantity, 0) };
    }));
  }

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const result = await fetchAdminProducts({ q: query, status: filter, cursor: nextCursor });
      setProducts((current) => [...current, ...result.items]);
      setNextCursor(result.nextCursor);
    } catch (error) { setLoadMoreError(errorMessage(error)); } finally { setLoadingMore(false); }
  }

  function clearSearch() {
    setQueryInput('');
    setQuery('');
  }

  return (
    <div className="admin-products-page">
      <header className="admin-page-heading">
        <div><span className="admin-context">Danh mục đang vận hành</span><h1>Sản phẩm và tồn kho</h1><p>Tìm một mặt hàng, sửa quy cách bán hoặc ghi lại lần nhập – xuất kho.</p></div>
        <button className="admin-button admin-button--primary" type="button" onClick={() => setCreating(true)}><Plus aria-hidden="true" size={18} /> Tạo sản phẩm</button>
      </header>

      <div className="admin-product-workspace">
        <section className="admin-product-index" aria-labelledby="product-index-heading">
          <h2 id="product-index-heading" className="sr-only">Danh sách sản phẩm</h2>
          <form className="admin-search" role="search" onSubmit={(event) => { event.preventDefault(); setQuery(queryInput.trim()); }}>
            <label><span>Tìm theo tên hoặc mã hàng</span><div><Search aria-hidden="true" size={18} /><input type="search" value={queryInput} onChange={(event) => setQueryInput(event.target.value)} /><button type="submit">Tìm</button></div></label>
          </form>
          <div className="admin-filter" role="group" aria-label="Lọc trạng thái sản phẩm">
            {([['ALL', 'Tất cả'], ['ACTIVE', 'Đang bán'], ['INACTIVE', 'Ngừng bán']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
          </div>

          {status === 'loading' ? <div className="admin-skeleton-list" role="status" aria-label="Đang tải sản phẩm">{[0, 1, 2].map((item) => <span key={item} />)}</div> : null}
          {status === 'error' ? <div className="admin-empty-state" role="alert"><AlertTriangle aria-hidden="true" /><h3>Chưa tải được danh mục</h3><p>{loadError}</p><button className="admin-button" type="button" onClick={() => setReloadKey((current) => current + 1)}>Thử lại</button></div> : null}
          {status === 'ready' && products.length === 0 ? <div className="admin-empty-state"><Archive aria-hidden="true" /><h3>{query ? 'Không có sản phẩm khớp tìm kiếm' : 'Danh mục chưa có sản phẩm'}</h3><p>{query ? 'Thử tên hoặc mã hàng ngắn hơn.' : 'Tạo mặt hàng đầu tiên để bắt đầu quản lý quy cách và tồn kho.'}</p><button className="admin-button" type="button" onClick={query ? clearSearch : () => setCreating(true)}>{query ? 'Xóa tìm kiếm' : 'Tạo sản phẩm'}</button></div> : null}

          <div className="admin-product-list">
            {products.map((product) => (
              <button className="admin-product-row" data-selected={selectedId === product.id && !creating} type="button" key={product.id} onClick={() => { setCreating(false); setSelectedId(product.id); }}>
                <span className="admin-product-row__name"><b>{product.name}</b><small>{product.kind === 'INGREDIENT' ? 'Nguyên liệu' : 'Dụng cụ'} · {product.variants.length} quy cách</small></span>
                <span className="admin-product-row__stock"><small>Tổng tồn</small><b>{product.stockQuantity}</b></span>
                <span className={`admin-status ${product.active ? 'admin-status--active' : 'admin-status--inactive'}`}>{product.active ? 'Đang bán' : 'Ngừng bán'}</span>
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            ))}
          </div>
          {nextCursor ? <button className="admin-button admin-load-more" type="button" disabled={loadingMore} onClick={() => void loadMore()}>{loadingMore ? 'Đang tải…' : 'Tải thêm sản phẩm'}</button> : null}
          {loadMoreError ? <p className="admin-feedback admin-feedback--error" role="alert"><AlertTriangle aria-hidden="true" size={17} />{loadMoreError}</p> : null}
        </section>

        <div className="admin-product-detail">
          {creating ? <ProductCreateForm onCancel={() => setCreating(false)} onCreated={(product) => { setProducts((current) => [product, ...current]); setSelectedId(product.id); setCreating(false); }} /> : null}
          {!creating && selectedProduct ? <ProductEditor key={selectedProduct.id} product={selectedProduct} onUpdated={replaceProduct} onStockChanged={changeStock} /> : null}
          {!creating && !selectedProduct && status === 'ready' ? <div className="admin-detail-placeholder"><Warehouse aria-hidden="true" /><p>Chọn một sản phẩm ở danh sách để xem và chỉnh các quy cách bán.</p></div> : null}
        </div>
      </div>
    </div>
  );
}
