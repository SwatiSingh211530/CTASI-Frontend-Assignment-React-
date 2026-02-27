import { useState, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { useCart } from './context/CartContext';
import { useOrders } from './context/OrderContext';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import OrderSuccess from './components/OrderSuccess';
import AuthModal from './components/AuthModal';
import AccountPage from './components/AccountPage';
import AddressModal from './components/AddressModal';
import { GOOGLE_CLIENT_ID } from './config/google';

/* ─────────────────────────────────────────────────────────────────
  Inner shell – must be inside all providers so it can use the hooks
───────────────────────────────────────────────────────────────── */
function Shell() {
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();
  const { placeOrder } = useOrders();

  const [view, setView]             = useState('home');    // 'home' | 'account'
  const [cartOpen, setCartOpen]     = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);   // null = hidden
  const [addressOpen, setAddressOpen] = useState(false);  // delivery address modal

  /* Auth modal state */
  const [authModal, setAuthModal]   = useState({
    open: false,
    tab: 'login',     // 'login' | 'register'
    hint: '',
    afterLogin: null, // callback to fire once logged in
  });

  const openAuth = useCallback((opts = {}) => {
    setAuthModal({ open: true, tab: opts.tab ?? 'login', hint: opts.hint ?? '', afterLogin: opts.afterLogin ?? null });
  }, []);

  const closeAuth = useCallback(() => {
    setAuthModal(m => ({ ...m, open: false, afterLogin: null }));
  }, []);

  /* Called by Cart when checkout is clicked + user IS logged in */
  /* Opens the address modal instead of placing the order directly */
  const handleCheckout = useCallback(() => {
    setCartOpen(false);
    setAddressOpen(true);
  }, []);

  /* Called by AddressModal when user clicks "Place Order →" */
  const handleAddressConfirm = useCallback((address) => {
    setAddressOpen(false);
    const order = placeOrder({ items: cartItems, total: totalPrice, itemCount: totalItems, address });
    clearCart();
    setPlacedOrder(order);
  }, [cartItems, clearCart, placeOrder, totalItems, totalPrice]);

  /* Cart calls this when user is NOT logged in */
  const handleRequireAuth = useCallback(() => {
    openAuth({
      tab: 'login',
      hint: 'Please sign in to complete your checkout.',
      afterLogin: () => {
        // Re-open cart after login so user can click checkout again
        setCartOpen(true);
      },
    });
  }, [openAuth]);

  /* After successful auth, fire pending callback */
  const handleAuthSuccess = useCallback(() => {
    authModal.afterLogin?.();
  }, [authModal]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        onCartOpen={() => setCartOpen(true)}
        onAccount={() => setView('account')}
        onLogin={() => openAuth({ tab: 'login' })}
      />

      {/* ── Views ─────────────────────────────────────────── */}
      {view === 'home' && (
        <>
          {/* Hero banner */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-10 px-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              Welcome to ShopSwift 🚀
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Discover thousands of products at unbeatable prices.
            </p>
          </div>
          <main>
            <ProductList />
          </main>
        </>
      )}

      {view === 'account' && (
        <main>
          <AccountPage onBack={() => setView('home')} />
        </main>
      )}

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-200 mt-8">
        © {new Date().getFullYear()} ShopSwift — Built with React + Tailwind CSS
      </footer>

      {/* Cart drawer */}
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
        onRequireAuth={handleRequireAuth}
      />

      {/* Auth modal */}
      <AuthModal
        isOpen={authModal.open}
        defaultTab={authModal.tab}
        hint={authModal.hint}
        onClose={closeAuth}
        onSuccess={handleAuthSuccess}
      />

      {/* Delivery address modal */}
      <AddressModal
        isOpen={addressOpen}
        onClose={() => { setAddressOpen(false); setCartOpen(true); }}
        onConfirm={handleAddressConfirm}
        cartTotal={totalPrice}
        itemCount={totalItems}
      />

      {/* Order success overlay */}
      {placedOrder && (
        <OrderSuccess
          order={placedOrder}
          onClose={() => { setPlacedOrder(null); setView('home'); }}
          onViewOrders={() => { setPlacedOrder(null); setView('account'); }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
  Root – wrap with all providers
───────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <Shell />
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
