import { useState, useRef, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { isGoogleConfigured } from '../config/google';

/* ── Demo accounts shown when no real Client ID is set ───── */
const DEMO_ACCOUNTS = [
  {
    sub: 'demo-google-001',
    name: 'Swati Singh',
    email: 'swati.singh@gmail.com',
    picture: 'https://api.dicebear.com/9.x/personas/svg?seed=swati&backgroundColor=b6e3f4',
  },
  {
    sub: 'demo-google-002',
    name: 'Ravi Kumar',
    email: 'ravi.kumar@gmail.com',
    picture: 'https://api.dicebear.com/9.x/personas/svg?seed=ravi&backgroundColor=ffd5dc',
  },
  {
    sub: 'demo-google-003',
    name: 'Anita Desai',
    email: 'anita.desai@gmail.com',
    picture: 'https://api.dicebear.com/9.x/personas/svg?seed=anita&backgroundColor=c0aede',
  },
];

/* ── Google "G" logo SVG ─────────────────────────────────── */
function GoogleLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

/* ── Demo account picker popup ──────────────────────────── */
function DemoPicker({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div ref={ref}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden
                   animate-[fadeSlideIn_0.2s_ease-out]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GoogleLogo size={22} />
            <span className="text-base font-semibold text-gray-700">Sign in with Google</span>
          </div>
          <p className="text-xs text-gray-400">
            Demo mode — choose an account to continue
          </p>
        </div>

        {/* Account list */}
        <ul className="divide-y divide-gray-50 py-1">
          {DEMO_ACCOUNTS.map((acc) => (
            <li key={acc.sub}>
              <button
                onClick={() => onSelect(acc)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50
                           transition-colors text-left"
              >
                <img
                  src={acc.picture}
                  alt={acc.name}
                  className="w-10 h-10 rounded-full border border-gray-100 flex-shrink-0 bg-gray-100"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{acc.name}</p>
                  <p className="text-xs text-gray-400 truncate">{acc.email}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 ml-auto flex-shrink-0"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 leading-tight max-w-[200px]">
            Demo mode · Add <code className="bg-gray-200 px-0.5 rounded">VITE_GOOGLE_CLIENT_ID</code> for real Google auth
          </p>
          <button onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main exported component ────────────────────────────── */
/**
 * GoogleAuthButton
 * Props:
 *   tab        – 'login' | 'register'  (controls button label)
 *   onSuccess  – called after successful Google auth
 *   onError    – called with an error message string
 */
export default function GoogleAuthButton({ tab, onSuccess, onError }) {
  const { loginWithGoogle, loginWithGoogleProfile } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const configured = isGoogleConfigured();

  /* ── Real Google credential callback ────────────────── */
  const handleRealSuccess = ({ credential }) => {
    const result = loginWithGoogle(credential);
    if (!result.ok) { onError?.(result.error); return; }
    onSuccess?.();
  };

  /* ── Demo account selected ───────────────────────────── */
  const handleDemoSelect = async (account) => {
    setPickerOpen(false);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate network
    const result = loginWithGoogleProfile(account);
    setLoading(false);
    if (!result.ok) { onError?.(result.error); return; }
    onSuccess?.();
  };

  /* ── Real mode: delegate entirely to @react-oauth/google */
  if (configured) {
    return (
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleRealSuccess}
          onError={() => onError?.('Google sign-in was cancelled or failed.')}
          useOneTap={false}
          shape="rectangular"
          size="large"
          width="368"
          text={tab === 'login' ? 'signin_with' : 'signup_with'}
          logo_alignment="left"
        />
      </div>
    );
  }

  /* ── Demo mode: custom styled button + account picker ── */
  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => setPickerOpen(true)}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300
                   hover:border-gray-400 hover:bg-gray-50 rounded-xl py-2.5 px-4
                   text-sm font-medium text-gray-700 shadow-sm transition-all
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <GoogleLogo size={18} />
        )}
        <span>{loading ? 'Signing in…' : tab === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
      </button>

      {pickerOpen && (
        <DemoPicker
          onSelect={handleDemoSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
