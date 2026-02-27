/**
 * Currency utility – converts USD prices from FakeStoreAPI to Indian Rupees.
 *
 * Uses the browser-native Intl.NumberFormat with 'en-IN' locale so numbers
 * are formatted in Indian style: ₹1,23,456
 *
 * All internal cart/order values remain in USD; this helper is called only
 * at the display layer.
 */

export const USD_TO_INR = 84; // 1 USD ≈ ₹84

/**
 * Format a USD value as Indian Rupees.
 * @param {number} usd – price in US dollars
 * @param {object} [opts]
 * @param {number} [opts.decimals=0] – fraction digits (default 0 for clean ₹ amounts)
 * @returns {string}  e.g. "₹1,259"
 */
export function formatINR(usd, { decimals = 0 } = {}) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(usd * USD_TO_INR);
}
