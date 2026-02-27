import { useState, useEffect } from 'react';

/**
 * Fetches and enriches product data from FakeStoreAPI.
 * Adds a simulated `stock` field (5–50 units) to each product.
 */
export function useFetchProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('https://fakestoreapi.com/products');
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();

        const enriched = data.map((p) => ({
          ...p,
          stock: Math.floor(Math.random() * 46) + 5, // 5–50
        }));

        if (!cancelled) setProducts(enriched);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to fetch products.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}
