import { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useLocalStorage('sw_cart', []);

  /* ─── Add / increment ───────────────────────────────────── */
  const addToCart = useCallback(
    (product) => {
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          // respect stock cap
          const maxQty = Math.min(existing.quantity + 1, product.stock);
          return prev.map((i) =>
            i.id === product.id ? { ...i, quantity: maxQty } : i
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
    },
    [setCartItems]
  );

  /* ─── Decrease / remove at 0 ────────────────────────────── */
  const decreaseQty = useCallback(
    (productId) => {
      setCartItems((prev) =>
        prev
          .map((i) =>
            i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
          )
          .filter((i) => i.quantity > 0)
      );
    },
    [setCartItems]
  );

  /* ─── Hard-remove ───────────────────────────────────────── */
  const removeFromCart = useCallback(
    (productId) => {
      setCartItems((prev) => prev.filter((i) => i.id !== productId));
    },
    [setCartItems]
  );

  /* ─── Clear ─────────────────────────────────────────────── */
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, [setCartItems]);

  /* ─── Derived values ────────────────────────────────────── */
  const totalItems = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        decreaseQty,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* convenience hook */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
