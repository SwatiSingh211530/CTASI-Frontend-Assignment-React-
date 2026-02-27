/**
 * Full-page order-success overlay with animated checkmark and order summary.
 * Props:
 *   onClose      – dismiss and return to shopping
 *   onViewOrders – navigate to account / orders page
 *   order        – order object ({ id, total, itemCount }) from OrderContext
 */
import { formatINR } from '../utils/currency';

export default function OrderSuccess({ onClose, onViewOrders, order }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden
                      animate-[fadeSlideIn_0.35s_ease-out]">
        {/* Green header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-400 px-8 pt-8 pb-6 text-white text-center">
          {/* Checkmark */}
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16
                          rounded-full bg-white/20">
            <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52" fill="none">
              <path stroke="currentColor" strokeWidth="5"
                strokeLinecap="round" strokeLinejoin="round"
                d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Order Confirmed! 🎉</h2>
          <p className="text-green-100 text-sm mt-1">
            Thank you for shopping with{' '}
            <span className="font-bold text-white">ShopSwift</span>
          </p>
        </div>

        {/* Order summary */}
        {order && (
          <div className="px-8 py-5 space-y-3 border-b border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono font-semibold text-gray-800 text-xs">{order.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Items</span>
              <span className="font-semibold text-gray-800">{order.itemCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Paid</span>
              <span className="font-bold text-green-600 text-base">{formatINR(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Est. Delivery</span>
              <span className="font-semibold text-gray-800">
                {new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', {
                  weekday: 'short', month: 'short', day: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}

        {/* Delivery address */}
        {order?.address && (
          <div className="px-8 py-4 border-b border-gray-100 bg-blue-50">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5">
              📍 Delivering to
            </p>
            <p className="text-sm font-semibold text-gray-800">{order.address.fullName}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''},{' '}
              {order.address.city}, {order.address.state} – {order.address.pin}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">📞 {order.address.phone}</p>
          </div>
        )}

        {/* Actions */}
        <div className="px-8 py-5 space-y-3">
          {onViewOrders && (
            <button
              onClick={onViewOrders}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold
                         py-3 rounded-xl transition-colors text-sm"
            >
              View My Orders
            </button>
          )}
          <button
            onClick={onClose}
            className={`w-full font-semibold py-3 rounded-xl transition-colors text-sm
              ${ onViewOrders
                ? 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
