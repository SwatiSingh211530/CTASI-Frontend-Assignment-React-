import { useState, useMemo } from 'react';
import { useFetchProducts } from '../hooks/useFetchProducts';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import SearchBar from './SearchBar';
import Pagination from './Pagination';

const PAGE_SIZE = 8;

/**
 * Main product listing section: search, paginated grid, loading/error states.
 */
export default function ProductList() {
  const { products, loading, error } = useFetchProducts();
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  /* Filter by search */
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query, products]);

  /* Pagination */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  /* Reset to page 1 when query changes */
  const handleSearch = (val) => {
    setQuery(val);
    setCurrentPage(1);
  };

  /* ── Skeleton ── */
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="h-10 bg-gray-200 rounded-xl w-full max-w-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex flex-col items-center gap-4">
          <span className="text-6xl">😵</span>
          <h2 className="text-xl font-bold text-red-600">Failed to load products</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-xl
                       hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <SearchBar value={query} onChange={handleSearch} />
        <p className="text-sm text-gray-500 whitespace-nowrap">
          {filtered.length === 0
            ? 'No products found'
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                currentPage * PAGE_SIZE,
                filtered.length
              )} of ${filtered.length} products`}
        </p>
      </div>

      {/* No results */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-lg font-medium">No products match "{query}"</p>
          <button
            onClick={() => handleSearch('')}
            className="mt-4 text-blue-600 hover:underline text-sm"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
}
