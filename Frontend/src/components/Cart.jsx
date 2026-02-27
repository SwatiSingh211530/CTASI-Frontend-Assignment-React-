import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import CartItem from './CartItem';

/**
 * Slide-in cart drawer (right side).
 * Props:
 *  isOpen        – boolean controlling visibility
 *  onClose       – callback to close the drawer
 *  onCheckout    – callback fired after checkout confirmed
 *  onRequireAuth – callback when user tries to checkout without being logged in
 */
export default function Cart({ isOpen, onClose, onCheckout, onRequireAuth }) {
  const { cartItems, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();

  /* Lock body scroll when cart is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleCheckout = () => {
    if (!user) {
      onClose();
      onRequireAuth?.();
      return;
    }
    onClose();
    onCheckout();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50
                    flex flex-col transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4L7 13zm0 0L5.4 5M7 13l-2 5h14
                   M9 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
            </svg>
            <h2 className="text-base font-bold text-gray-800">
              My Cart
              {totalItems > 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 font-semibold
                                 px-2 py-0.5 rounded-full">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg
                       hover:bg-gray-100"
            aria-label="Close cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-5">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-20">
              <span className="text-7xl">🛒</span>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm">
                Add some products to get started!
              </p>
              <button
                onClick={onClose}
                className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm
                           font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <ul>
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </ul>
          )}
        </div>

        {/* Footer – only when cart has items */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            {/* Price breakdown */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Subtotal ({totalItems} items)</span>
              <span className="font-semibold text-gray-800">{formatINR(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold
                            border-t border-gray-100 pt-3">
              <span>Total</span>
              <span className="text-blue-700 text-lg">{formatINR(totalPrice)}</span>
            </div>

            {/* Actions */}
            <button
              onClick={handleCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold
                         py-3 rounded-xl transition-colors text-sm tracking-wide"
            >
              Proceed to Checkout →
            </button>
            <button
              onClick={clearCart}
              className="w-full text-sm text-gray-400 hover:text-red-500
                         transition-colors underline underline-offset-2"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
