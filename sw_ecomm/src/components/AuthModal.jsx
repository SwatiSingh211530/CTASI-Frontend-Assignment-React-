import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';

/**
 * AuthModal
 * Props:
 *   isOpen        – show / hide
 *   onClose       – close callback
 *   onSuccess     – called after successful login or registration
 *   defaultTab    – 'login' | 'register'
 *   hint          – optional string shown below the title (e.g. "Login to continue checkout")
 */
export default function AuthModal({ isOpen, onClose, onSuccess, defaultTab = 'login', hint }) {
  const { login, register } = useAuth();
  const [tab, setTab]           = useState(defaultTab);
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const firstInputRef           = useRef(null);

  /* Reset form when modal opens or tab changes */
  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setForm({ name: '', email: '', password: '', confirm: '' });
      setErrors({});
      setApiError('');
      setShowPwd(false);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen, defaultTab]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* ESC to close */
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  /* ── form field change ─────────────────────────────────── */
  const change = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
    setApiError('');
  };

  /* ── validation ────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (tab === 'register' && !form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    else if (tab === 'register' && form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (tab === 'register' && form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    return e;
  };

  /* ── Google OAuth success ──────────────────────────────── */
  const handleGoogleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const handleGoogleError = (msg) => {
    setApiError(msg ?? 'Google sign-in failed. Please try again.');
  };

  /* ── submit ────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    // small async tick to show loading state
    await new Promise(r => setTimeout(r, 300));

    const result = tab === 'login'
      ? login({ email: form.email, password: form.password })
      : register({ name: form.name, email: form.email, password: form.password });

    setLoading(false);
    if (!result.ok) { setApiError(result.error); return; }
    onSuccess?.();
    onClose();
  };

  /* ── ui helpers ───────────────────────────────────────── */
  const Field = ({ id, label, type, value, onChange, error, autoComplete, inputRef }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden
                      animate-[fadeSlideIn_0.25s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 pt-6 pb-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {tab === 'login' ? 'Welcome back 👋' : 'Create your account'}
              </h2>
              {hint && (
                <p className="mt-1 text-sm text-blue-100">{hint}</p>
              )}
            </div>
            <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors mt-0.5"
              aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-blue-800/40 rounded-xl p-1">
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setErrors({}); setApiError(''); }}
                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize
                  ${tab === t ? 'bg-white text-blue-700 shadow' : 'text-blue-100 hover:text-white'}`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {/* ── Google button ──────────────────────────────── */}
          <div className="space-y-3">
            <GoogleAuthButton
              tab={tab}
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

            {/* Divider */}
            <div className="flex items-center gap-3">
              <hr className="flex-1 border-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or continue with email</span>
              <hr className="flex-1 border-gray-200" />
            </div>
          </div>

          {/* API-level error */}
          {apiError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600
                            rounded-xl px-3 py-2.5 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {apiError}
            </div>
          )}

          {/* Name – register only */}
          {tab === 'register' && (
            <Field
              id="auth-name" label="Full Name" type="text"
              value={form.name} onChange={change('name')} error={errors.name}
              autoComplete="name" inputRef={firstInputRef}
            />
          )}

          {/* Email */}
          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              ref={tab === 'login' ? firstInputRef : undefined}
              id="auth-email"
              type="email"
              value={form.email}
              onChange={change('email')}
              autoComplete="email"
              className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={change('password')}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className={`w-full px-3 py-2.5 pr-10 rounded-xl border text-sm transition-colors focus:outline-none
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
              />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPwd ? 'Hide password' : 'Show password'}>
                {showPwd ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm password – register only */}
          {tab === 'register' && (
            <div>
              <label htmlFor="auth-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="auth-confirm"
                type={showPwd ? 'text' : 'password'}
                value={form.confirm}
                onChange={change('confirm')}
                autoComplete="new-password"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.confirm ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
              />
              {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                       text-white font-bold py-3 rounded-xl transition-colors
                       flex items-center justify-center gap-2 mt-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {/* Switch tab link */}
          <p className="text-center text-sm text-gray-500">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setErrors({}); setApiError(''); }}
              className="text-blue-600 font-semibold hover:underline">
              {tab === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
