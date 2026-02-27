import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import { useOrders } from '../context/OrderContext';
import OrderCard from './OrderCard';

/**
 * AccountPage
 * Props:
 *   onBack  – callback to return to product listing
 */
export default function AccountPage({ onBack }) {
  const { user, logout, updateName } = useAuth();
  const { myOrders } = useOrders();

  const [editMode, setEditMode]   = useState(false);
  const [nameVal, setNameVal]     = useState(user?.name ?? '');
  const [nameErr, setNameErr]     = useState('');
  const [saved, setSaved]         = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile'

  if (!user) return null;

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = new Date(
    JSON.parse(localStorage.getItem('sw_users') ?? '[]').find(u => u.id === user.id)?.createdAt ?? Date.now()
  ).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  /* ── Save name ──────────────────────────────────────────── */
  const handleSaveName = () => {
    if (!nameVal.trim()) { setNameErr('Name cannot be empty.'); return; }
    updateName(nameVal.trim());
    setEditMode(false);
    setNameErr('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  /* ── Logout ─────────────────────────────────────────────── */
  const handleLogout = () => {
    logout();
    onBack();
  };

  const tabs = [
    { key: 'orders',  label: 'My Orders', icon: '📦' },
    { key: 'profile', label: 'Profile',   icon: '👤' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600
                   transition-colors mb-6 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Shopping
      </button>

      {/* Profile hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-3xl p-6 text-white
                      flex flex-col sm:flex-row sm:items-center gap-4 mb-6 shadow-lg">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name}
              className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-white/20 flex items-center justify-center
                            text-2xl font-bold">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-blue-100 text-sm">{user.email}</p>
          <p className="text-blue-200 text-xs mt-0.5">Member since {memberSince}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold">{myOrders.length}</p>
            <p className="text-xs text-blue-100">Orders</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold">
              {formatINR(myOrders.reduce((s, o) => s + o.total, 0))}
            </p>
            <p className="text-xs text-blue-100">Spent</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-200 rounded-xl p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
              ${activeTab === t.key ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ORDERS TAB ───────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {myOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <span className="text-6xl block mb-4">📭</span>
              <p className="text-lg font-semibold text-gray-700">No orders yet</p>
              <p className="text-gray-400 text-sm mt-1 mb-4">
                Once you place an order, it will appear here.
              </p>
              <button
                onClick={onBack}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm
                           font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-1">
                {myOrders.length} order{myOrders.length !== 1 ? 's' : ''} · click to expand details
              </p>
              {myOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </>
          )}
        </div>
      )}

      {/* ── PROFILE TAB ──────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5 max-w-md">
          <h2 className="font-bold text-gray-800 text-base">Personal Information</h2>

          {/* Saved toast */}
          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200
                            text-green-700 rounded-xl px-3 py-2.5 text-sm">
              ✅ Profile updated successfully!
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {editMode ? (
              <div className="flex gap-2">
                <input
                  value={nameVal}
                  onChange={e => { setNameVal(e.target.value); setNameErr(''); }}
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none
                    focus:ring-2 focus:ring-blue-500
                    ${nameErr ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  autoFocus
                />
                <button onClick={handleSaveName}
                  className="bg-blue-600 text-white px-4 rounded-xl text-sm font-semibold
                             hover:bg-blue-700 transition-colors">
                  Save
                </button>
                <button onClick={() => { setEditMode(false); setNameVal(user.name); setNameErr(''); }}
                  className="px-3 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-800 font-medium">{user.name}</p>
                <button onClick={() => { setEditMode(true); setNameVal(user.name); }}
                  className="text-blue-600 text-sm hover:underline font-medium">
                  Edit
                </button>
              </div>
            )}
            {nameErr && <p className="mt-1 text-xs text-red-500">{nameErr}</p>}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="flex items-center justify-between">
              <p className="text-gray-800 font-medium">{user.email}</p>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Verified</span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                       border border-red-200 text-red-500 hover:bg-red-50 transition-colors
                       text-sm font-semibold"
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
