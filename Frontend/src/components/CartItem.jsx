import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';

/**
 * Single row inside the cart drawer.
 */
export default function CartItem({ item }) {
  const { addToCart, decreaseQty, removeFromCart } = useCart();

  return (
    <li className="flex gap-3 py-4 border-b border-gray-100 last:border-none">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border
                      border-gray-100 flex items-center justify-center p-1">
        <img
          src={item.image}
          alt={item.title}
          className="h-full object-contain mix-blend-multiply"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <p className="text-xs font-semibold line-clamp-2 leading-snug text-gray-800">
          {item.title}
        </p>
        <p className="text-sm font-bold text-blue-700">
          {formatINR(item.price * item.quantity)}
          <span className="text-xs text-gray-400 font-normal ml-1">
            ({formatINR(item.price)} × {item.quantity})
          </span>
        </p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => decreaseQty(item.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       border border-gray-300 hover:bg-gray-100 text-gray-600
                       transition-colors text-base leading-none"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
          <button
            onClick={() => addToCart(item)}
            disabled={item.quantity >= item.stock}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       border border-gray-300 hover:bg-gray-100 text-gray-600
                       transition-colors text-base leading-none
                       disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            +
          </button>
          {item.quantity >= item.stock && (
            <span className="text-[10px] text-orange-500 font-medium">Max stock</span>
          )}
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="flex-shrink-0 self-start mt-0.5 text-gray-300 hover:text-red-500
                   transition-colors"
        aria-label="Remove item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </li>
  );
}
