export type CartItem = {
  variantId: string;
  name: string;
  label: string;
  quantity: number;
  unitPrice: number;
  currency: string;
};

type StoredCart = {
  version: 1;
  items: CartItem[];
};

const CART_KEY = 'ecomtech.cart';

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredCart;
    return parsed.version === 1 && Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify({ version: 1, items } satisfies StoredCart));
  } catch {
    // Giỏ vẫn dùng được trong phiên hiện tại nếu trình duyệt chặn localStorage.
  }
}

