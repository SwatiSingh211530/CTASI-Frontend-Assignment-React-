import { useState } from 'react';
import { formatINR } from '../utils/currency';
import { ORDER_STEPS, useOrders } from '../context/OrderContext';

const CANCELLABLE = new Set(['Order Placed', 'Confirmed']);

/* ── Step icons (SVG) ──────────────────────────────────────── */
const STEP_ICONS = [
  /* Order Placed */
  <svg key="placed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z"/>
    <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087z" clipRule="evenodd"/>
  </svg>,
  /* Confirmed */
  <svg key="confirmed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd"/>
  </svg>,
  /* Shipped */
  <svg key="shipped" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a3 3 0 116 0h.375c1.035 0 1.875-.84 1.875-1.875V15h-9z"/>
    <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883l-.382-6.383A1.5 1.5 0 0020.585 9.75l-2.497-2.498a1.5 1.5 0 00-1.06-.44H15.75z"/>
    <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"/>
  </svg>,
  /* Out for Delivery */
  <svg key="out" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd"/>
  </svg>,
  /* Delivered */
  <svg key="delivered" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd"/>
  </svg>,
];

const STEP_COLORS = {
  done:    'bg-blue-600  text-white  border-blue-600',
  current: 'bg-orange-500 text-white  border-orange-500',
  future:  'bg-white     text-gray-300 border-gray-300',
};

const LINE_COLORS = {
  done:   'bg-blue-600',
  future: 'bg-gray-200',
};

/**
 * Flipkart-style 5-step order tracker
 */
function StatusTracker({ status }) {
  const currentIdx = ORDER_STEPS.indexOf(status);

  return (
    <div className="px-5 pt-4 pb-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Status</p>

      {/* Horizontal tracker */}
      <div className="flex items-start">
        {ORDER_STEPS.map((step, idx) => {
          const isDone    = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const isLast    = idx === ORDER_STEPS.length - 1;

          const circleClass = isCurrent ? STEP_COLORS.current
                            : isDone    ? STEP_COLORS.done
                            : STEP_COLORS.future;

          return (
            <div key={step} className="flex items-start flex-1 min-w-0">
              {/* Step + label */}
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Circle */}
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                                 transition-all duration-300 ${circleClass}
                                 ${isCurrent ? 'ring-2 ring-orange-300 ring-offset-1' : ''}`}>
                  {STEP_ICONS[idx]}
                </div>
                {/* Label */}
                <p className={`text-center mt-1.5 leading-tight
                               ${isCurrent ? 'text-orange-600 font-bold' : isDone ? 'text-blue-600 font-semibold' : 'text-gray-400'}
                               `}
                   style={{ fontSize: '0.6rem', maxWidth: '4.5rem' }}>
                  {step}
                </p>
              </div>

              {/* Connector line (not after last) */}
              {!isLast && (
                <div className="flex-1 mt-3.5 mx-0.5">
                  <div className={`h-0.5 rounded-full transition-all duration-500
                    ${idx < currentIdx ? LINE_COLORS.done : LINE_COLORS.future}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Expandable order card for the account/order history page.
 */
export default function OrderCard({ order }) {
  const { cancelOrder }         = useOrders();
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false); // cancel confirm step

  const date          = new Date(order.date);
  const formattedDate = date.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  const isCancelled   = order.status === 'Cancelled';
  const currentIdx    = ORDER_STEPS.indexOf(order.status);
  const isDelivered   = order.status === 'Delivered';
  const canCancel     = CANCELLABLE.has(order.status);

  const handleCancel = () => {
    cancelOrder(order.id);
    setConfirming(false);
    setExpanded(true); // keep open to show cancelled state
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Order header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4
                   cursor-pointer hover:bg-gray-50 transition-colors select-none"
        onClick={() => setExpanded(e => !e)}
        role="button"
        aria-expanded={expanded}
      >
        {/* Left: order ID + date */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
          <p className="font-bold text-gray-800 text-sm font-mono">{order.id}</p>
          <p className="text-xs text-gray-500 mt-0.5">{formattedDate} · {formattedTime}</p>
        </div>

        {/* Centre: item count + total */}
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-0.5">Items</p>
          <p className="font-semibold text-gray-700 text-sm">{order.itemCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-0.5">Total</p>
          <p className="font-bold text-blue-700 text-sm">{formatINR(order.total)}</p>
        </div>

        {/* Right: status badge + chevron */}
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5
                            rounded-full border
                            ${isCancelled
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : isDelivered
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : order.status === 'Out for Delivery'
                                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                                  : order.status === 'Shipped'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
            {isCancelled
              ? <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/></svg>
              : <span>{STEP_ICONS[currentIdx >= 0 ? currentIdx : 0]}</span>
            }
            <span className="hidden sm:inline">{order.status}</span>
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Expandable detail section */}
      {expanded && (
        <div className="border-t border-gray-100">

          {/* ── Cancelled banner ─────────────────────────── */}
          {isCancelled ? (
            <div className="mx-5 mt-4 mb-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">Order Cancelled</p>
                <p className="text-xs text-red-500 mt-0.5">
                  {order.cancelledAt
                    ? `Cancelled on ${new Date(order.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : 'This order has been cancelled.'}
                </p>
              </div>
            </div>
          ) : (
            /* ── Flipkart-style status tracker ────────────── */
            <StatusTracker status={order.status} />
          )}

          {/* ── Delivery address ─────────────────────────── */}
          {order.address && (
            <div className="mx-5 my-3 rounded-xl border border-dashed border-blue-200 bg-blue-50 p-3">
              <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wider">
                📍 Delivery Address
              </p>
              <p className="text-sm font-semibold text-gray-800">{order.address.fullName}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ''}
              </p>
              <p className="text-xs text-gray-600">
                {order.address.city}, {order.address.state} – {order.address.pin}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">📞 {order.address.phone}</p>
            </div>
          )}

          {/* ── Items list ────────────────────────────────── */}
          <div className="divide-y divide-gray-50 mt-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl border border-gray-100
                                flex items-center justify-center p-1">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full object-contain mix-blend-multiply"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Qty: {item.quantity} × {formatINR(item.price)}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-700 flex-shrink-0">
                  {formatINR(item.price * item.quantity)}
                </p>
              </div>
            ))}

            {/* Order total row */}
            <div className="flex justify-between items-center px-5 py-3 bg-gray-50">
              <span className="text-sm text-gray-500">Order Total</span>
              <span className={`font-bold ${isCancelled ? 'text-gray-400 line-through' : 'text-blue-700'}`}>
                {formatINR(order.total)}
              </span>
            </div>
          </div>

          {/* ── Cancel button ─────────────────────────────── */}
          {canCancel && !confirming && (
            <div className="px-5 pb-4 pt-1">
              <button
                onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
                className="w-full py-2.5 rounded-2xl border-2 border-red-200 text-red-500
                           text-xs font-bold hover:bg-red-50 transition-colors"
              >
                Cancel Order
              </button>
            </div>
          )}

          {/* ── Cancel confirmation ───────────────────────── */}
          {confirming && (
            <div className="mx-5 mb-4 mt-1 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700 mb-0.5">Cancel this order?</p>
              <p className="text-xs text-red-500 mb-3">This action cannot be undone. Your refund will be processed in 5–7 business days.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600
                             text-white text-xs font-bold transition-colors"
                >
                  Yes, Cancel Order
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600
                             text-xs font-semibold hover:bg-gray-100 transition-colors"
                >
                  No, Keep It
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
