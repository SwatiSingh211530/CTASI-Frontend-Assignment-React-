
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman & Nicobar Islands','Chandigarh','Dadra & Nagar Haveli',
  'Daman & Diu','Delhi','Lakshadweep','Puducherry','Ladakh','Jammu & Kashmir',
];

const EMPTY = {
  fullName: '', phone: '', line1: '', line2: '',
  city: '', state: '', pin: '', type: 'Home',
};

const ADDRESS_TYPES = [
  { label: 'Home',  icon: '🏠' },
  { label: 'Work',  icon: '🏢' },
  { label: 'Other', icon: '📍' },
];

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

/* ─── Text field with floating label ─────────────────────────────
   At module level to keep React's identity stable across renders.  */
function Field({ id, label, value, onChange, error, maxLength, inputMode, inputRef, required = true, hint }) {
  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          placeholder=" "
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete="off"
          className={`
            peer w-full px-4 pt-6 pb-2 rounded-2xl border-2 text-sm bg-white
            outline-none transition-all duration-200
            ${error
              ? 'border-red-400 bg-red-50/40 focus:border-red-500'
              : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'}
          `}
        />
        <label
          htmlFor={id}
          className={`
            absolute left-4 pointer-events-none select-none transition-all duration-200
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-gray-400
            top-1.5 text-[10px] font-bold tracking-wide
            peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold
            ${error ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-400 peer-focus:text-blue-500'}
          `}
        >
          {label}{required && <span className="ml-0.5 text-red-400">*</span>}
        </label>
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-medium">
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.5a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
          {error}
        </p>
      )}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

/* ─── Select with floating label ───────────────────────────────── */
function SelectField({ id, label, value, onChange, error, children, required = true }) {
  return (
    <div>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`
            peer w-full px-4 pt-6 pb-2 rounded-2xl border-2 text-sm bg-white
            outline-none transition-all duration-200 appearance-none cursor-pointer
            ${value ? 'text-gray-800' : 'text-transparent focus:text-gray-800'}
            ${error
              ? 'border-red-400 bg-red-50/40 focus:border-red-500'
              : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'}
          `}
        >
          {children}
        </select>
        <label
          htmlFor={id}
          className={`
            absolute left-4 pointer-events-none select-none transition-all duration-200
            ${value
              ? 'top-1.5 text-[10px] font-bold tracking-wide'
              : 'top-4 text-sm font-normal text-gray-400 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-blue-500'}
            ${error ? 'text-red-500' : value ? 'text-gray-400' : ''}
          `}
        >
          {label}{required && <span className="ml-0.5 text-red-400">*</span>}
        </label>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-medium">
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.5a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
      {children}
    </p>
  );
}

/**
 * AddressModal
 * Props:
 *   isOpen     – show / hide
 *   onClose    – cancel callback
 *   onConfirm  – called with the address object when user confirms
 *   cartTotal  – numeric total (for summary display)
 *   itemCount  – number of cart items
 */
export default function AddressModal({ isOpen, onClose, onConfirm, cartTotal, itemCount }) {
  const { user }              = useAuth();
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [placing, setPlacing] = useState(false);
  const firstRef              = useRef(null);

  /* Reset on open */
  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY, fullName: user?.name ?? '' });
      setErrors({});
      setPlacing(false);
      setTimeout(() => firstRef.current?.focus(), 80);
    }
  }, [isOpen, user?.name]);

  /* Body scroll lock */
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

  const change = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())  e.fullName = 'Full name is required.';
    if (!form.phone.trim())     e.phone    = 'Phone number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (!form.line1.trim())     e.line1    = 'Address line 1 is required.';
    if (!form.city.trim())      e.city     = 'City is required.';
    if (!form.state)            e.state    = 'Please select a state.';
    if (!form.pin.trim())       e.pin      = 'PIN code is required.';
    else if (!/^\d{6}$/.test(form.pin.trim())) e.pin = 'Enter a valid 6-digit PIN code.';
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setPlacing(true);
    setTimeout(() => {
      onConfirm({
        fullName: form.fullName.trim(),
        phone:    form.phone.trim(),
        line1:    form.line1.trim(),
        line2:    form.line2.trim(),
        city:     form.city.trim(),
        state:    form.state,
        pin:      form.pin.trim(),
        type:     form.type,
      });
    }, 300);
  };

  const errorCount = Object.keys(errors).length;

  return (
    /* Backdrop — click outside to close */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet: full-width slide-up on mobile, centered card on sm+ */}
      <div className="
        relative bg-white w-full sm:max-w-lg
        rounded-t-[2rem] sm:rounded-3xl
        shadow-2xl flex flex-col
        max-h-[95dvh] sm:max-h-[90vh]
        animate-[slideUp_0.32s_cubic-bezier(0.32,0.72,0,1)]
        sm:animate-[fadeSlideIn_0.22s_ease-out]
      ">

        {/* Drag pill – mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-0 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 sm:px-7 pt-4 sm:pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
                <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013 3.5-4.619 3.5-7.327A8 8 0 004.5 12.5c0 2.708 1.556 5.314 3.5 7.327a19.58 19.58 0 002.963 2.524l.077.05zm-1.37-4.473A14.945 14.945 0 0112 19.658a14.945 14.945 0 011.83-1.78C15.86 16.085 17 14.082 17 12.5a5 5 0 00-10 0c0 1.582 1.14 3.585 3.17 5.378z" clipRule="evenodd"/>
                  <path d="M12 13.5a1 1 0 100-2 1 1 0 000 2z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  Delivery Address
                </h2>
                <p className="text-xs text-gray-400">
                  {itemCount} item{itemCount !== 1 ? 's' : ''} · where should we deliver?
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200
                         flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Scrollable form ──────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-7 py-5 space-y-6">

          {/* Address type */}
          <div>
            <SectionLabel>Address type</SectionLabel>
            <div className="flex gap-2">
              {ADDRESS_TYPES.map(({ label, icon }) => (
                <button
                  key={label} type="button"
                  onClick={() => setForm(f => ({ ...f, type: label }))}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5
                    py-2.5 rounded-2xl text-xs font-bold border-2 transition-all
                    ${form.type === label
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}
                  `}
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <SectionLabel>Contact info</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                id="addr-name" label="Full Name"
                value={form.fullName} onChange={change('fullName')}
                error={errors.fullName} inputRef={firstRef}
              />
              <Field
                id="addr-phone" label="Mobile Number"
                value={form.phone} onChange={change('phone')}
                error={errors.phone} maxLength={10} inputMode="numeric"
                hint="10-digit Indian mobile number"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <SectionLabel>Address details</SectionLabel>
            <div className="space-y-3">
              <Field
                id="addr-line1" label="House / Flat / Building & Street"
                value={form.line1} onChange={change('line1')}
                error={errors.line1}
              />
              <Field
                id="addr-line2" label="Area / Colony / Landmark (optional)"
                value={form.line2} onChange={change('line2')}
                error={errors.line2} required={false}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="addr-city" label="City / Town"
                  value={form.city} onChange={change('city')}
                  error={errors.city}
                />
                <Field
                  id="addr-pin" label="PIN Code"
                  value={form.pin} onChange={change('pin')}
                  error={errors.pin} maxLength={6} inputMode="numeric"
                />
              </div>
              <SelectField
                id="addr-state" label="State"
                value={form.state} onChange={change('state')}
                error={errors.state}
              >
                <option value="">Select your state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </SelectField>
            </div>
          </div>

          {/* Error summary */}
          {errorCount > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-red-50 border border-red-100">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 012 0v4a1 1 0 01-2 0V7zm1 7a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd"/>
              </svg>
              <p className="text-xs font-semibold text-red-600">
                Please fix {errorCount} field{errorCount > 1 ? 's' : ''} above before continuing.
              </p>
            </div>
          )}
        </div>

        {/* ── Sticky footer ─────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white
                        px-5 sm:px-7 pt-3 pb-6 sm:pb-7 sm:rounded-b-3xl space-y-3">
          {/* Summary row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Order total</p>
              <p className="text-xl font-extrabold text-gray-900">{INR.format(cartTotal * 84)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Est. delivery</p>
              <p className="text-sm font-bold text-green-600">
                {new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'short',
                })}
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={placing}
            className={`
              w-full flex items-center justify-center gap-2
              py-4 rounded-2xl font-bold text-sm transition-all duration-200
              ${placing
                ? 'bg-orange-400 text-white cursor-not-allowed opacity-80'
                : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'}
            `}
          >
            {placing ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Placing your order…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
                Place Order · {INR.format(cartTotal * 84)}
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-gray-400">
            🔒 Secure checkout &nbsp;·&nbsp; Free returns within 10 days
          </p>
        </div>
      </div>
    </div>
  );
}
