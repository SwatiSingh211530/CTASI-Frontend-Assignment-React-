import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar user avatar with dropdown menu (My Account / Sign Out).
 * Props:
 *   onAccount – navigate to account page
 *   onLogin   – open auth modal
 *   onLogout  – called after sign-out
 */
export default function UserMenu({ onAccount, onLogin, onLogout }) {
  const { user, logout } = useAuth();
  const [open, setOpen]   = useState(false);
  const menuRef           = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  if (!user) {
    return (
      <button
        onClick={onLogin}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30
                   transition-colors px-4 py-2 rounded-xl font-medium text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30
                   transition-colors px-3 py-2 rounded-xl font-medium text-sm"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name}
            className="w-7 h-7 rounded-lg object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="w-7 h-7 rounded-lg bg-orange-400 flex items-center justify-center
                           text-xs font-bold text-white">
            {initials}
          </span>
        )}
        <span className="hidden sm:inline max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
        <svg xmlns="http://www.w3.org/2000/svg"
          className={`h-3.5 w-3.5 text-blue-200 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl
                        border border-gray-100 overflow-hidden z-50 animate-[fadeSlideIn_0.15s_ease-out]">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>

          {/* My Account */}
          <button
            onClick={() => { setOpen(false); onAccount(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700
                       hover:bg-gray-50 transition-colors text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            My Account
          </button>

          {/* My Orders */}
          <button
            onClick={() => { setOpen(false); onAccount('orders'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700
                       hover:bg-gray-50 transition-colors text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            My Orders
          </button>

          <hr className="border-gray-100" />

          {/* Sign Out */}
          <button
            onClick={() => { setOpen(false); logout(); onLogout?.(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500
                       hover:bg-red-50 transition-colors text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
