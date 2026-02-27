import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';

/**
 * Individual product card for the listing grid.
 * Shows image, name, category badge, price, stock, rating, and an Add-to-Cart CTA.
 */
export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();

  const cartItem = cartItems.find((i) => i.id === product.id);
  const inCart = !!cartItem;
  const outOfStock = product.stock === 0;

  const stockLabel =
    product.stock > 20
      ? { text: 'In Stock', cls: 'bg-green-100 text-green-700' }
      : product.stock > 0
      ? { text: `Only ${product.stock} left`, cls: 'bg-yellow-100 text-yellow-700' }
      : { text: 'Out of Stock', cls: 'bg-red-100 text-red-600' };

  const stars = Math.round(product.rating?.rate ?? 0);

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow
                        flex flex-col overflow-hidden group">
      {/* Product image */}
      <div className="relative h-52 bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="h-full object-contain mix-blend-multiply
                     group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Category badge */}
        <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px]
                         font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full">
          {product.category}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Title */}
        <h2 className="text-sm font-semibold line-clamp-2 leading-snug" title={product.title}>
          {product.title}
        </h2>

        {/* Rating */}
        <div className="flex items-center gap-1 text-yellow-400 text-xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3.5 w-3.5 ${i < stars ? 'fill-current' : 'fill-gray-200 text-gray-200'}`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969
                0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54
                1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
                1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          ))}
          <span className="text-gray-500 ml-1">
            {product.rating?.rate?.toFixed(1)} ({product.rating?.count})
          </span>
        </div>

        {/* Price + Stock */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-lg font-bold text-blue-700">{formatINR(product.price)}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stockLabel.cls}`}>
            {stockLabel.text}
          </span>
        </div>

        {/* CTA button */}
        <button
          disabled={outOfStock}
          onClick={() => addToCart(product)}
          className={`mt-2 w-full py-2 rounded-xl text-sm font-semibold transition-colors
            ${outOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : inCart
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          {outOfStock ? 'Out of Stock' : inCart ? '+ Add More' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
