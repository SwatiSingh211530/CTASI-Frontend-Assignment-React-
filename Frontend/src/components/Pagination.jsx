/**
 * Pagination controls with first / prev / numbered / next / last buttons.
 * Shows at most 5 page numbers at a time, centred on the current page.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getRange = () => {
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: right - left + 1 }, (_, i) => left + i);
  };

  const btnBase =
    'inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors';
  const active = 'bg-blue-600 text-white shadow';
  const inactive =
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
  const disabled = 'opacity-40 pointer-events-none';

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1 mt-8">
      {/* First */}
      <button
        className={`${btnBase} ${inactive} ${currentPage === 1 ? disabled : ''}`}
        onClick={() => onPageChange(1)}
        aria-label="First page"
      >
        «
      </button>

      {/* Prev */}
      <button
        className={`${btnBase} ${inactive} ${currentPage === 1 ? disabled : ''}`}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        ‹
      </button>

      {/* Numbered pages */}
      {getRange().map((page) => (
        <button
          key={page}
          className={`${btnBase} ${page === currentPage ? active : inactive}`}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        className={`${btnBase} ${inactive} ${
          currentPage === totalPages ? disabled : ''
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        ›
      </button>

      {/* Last */}
      <button
        className={`${btnBase} ${inactive} ${
          currentPage === totalPages ? disabled : ''
        }`}
        onClick={() => onPageChange(totalPages)}
        aria-label="Last page"
      >
        »
      </button>
    </nav>
  );
}
