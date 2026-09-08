import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadCart, saveCart, type CartItem } from './cart-storage';

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItems: (items: CartItem[]) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => saveCart(items), [items]);

  const addItems = useCallback((incoming: CartItem[]) => {
    setItems((current) => {
      const merged = new Map(current.map((item) => [item.variantId, item]));
      incoming.forEach((item) => {
        const existing = merged.get(item.variantId);
        merged.set(item.variantId, {
          ...item,
          quantity: Math.min(99, (existing?.quantity ?? 0) + item.quantity),
        });
      });
      return [...merged.values()];
    });
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((current) => current.map((item) => (
      item.variantId === variantId
        ? { ...item, quantity: Math.max(1, Math.min(99, quantity)) }
        : item
    )));
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((current) => current.filter((item) => item.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    addItems,
    updateQuantity,
    removeItem,
    clearCart,
  }), [addItems, clearCart, items, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart phải được dùng bên trong CartProvider.');
  return value;
}
