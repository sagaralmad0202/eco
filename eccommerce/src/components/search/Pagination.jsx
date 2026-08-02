export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-16" aria-label="Pagination" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
      {/* Previous */}
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
          currentPage === 1
            ? "text-neutral-300 cursor-not-allowed"
            : "text-neutral-700 hover:bg-neutral-100"
        }`}
        aria-label="Previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page numbers */}
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            currentPage === page
              ? "bg-neutral-900 text-white"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
          aria-label={`Page ${page}`}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
          currentPage === totalPages
            ? "text-neutral-300 cursor-not-allowed"
            : "text-neutral-700 hover:bg-neutral-100"
        }`}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </nav>
  );
}
