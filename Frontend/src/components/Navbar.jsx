import { useCart } from '../context/CartContext';
import UserMenu from './UserMenu';

/**
 * Top navigation bar with brand name, animated cart badge, and user menu.
 * Props:
 *   onCartOpen  – open cart drawer
 *   onAccount   – navigate to account page
 *   onLogin     – open auth modal
 */
export default function Navbar({ onCartOpen, onAccount, onLogin }) {
  const { totalItems } = useCart();

  return (
    <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button onClick={onAccount ? undefined : undefined}
          className="flex items-center gap-2 select-none cursor-default">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24"
            fill="currentColor">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4L7 13zm0 0L5.4 5M7 13l-2 5h14M9 21a1
              1 0 1 1-2 0 1 1 0 0 1 2 0zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
          </svg>
          <span className="text-xl font-bold tracking-tight">ShopSwift</span>
        </button>

        {/* Right: cart + user menu */}
        <div className="flex items-center gap-2">
          {/* Cart button */}
          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-2 bg-white/20 hover:bg-white/30
                       transition-colors px-4 py-2 rounded-xl font-medium text-sm"
            aria-label="Open cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4L7 13zm0 0L5.4 5M7 13l-2 5h14
                   M9 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs
                           font-bold rounded-full h-5 w-5 flex items-center justify-center
                           animate-bounce"
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* User avatar / sign-in button */}
          <UserMenu
            onAccount={onAccount}
            onLogin={onLogin}
            onLogout={() => {}}
          />
        </div>
      </div>
    </header>
  );
}
