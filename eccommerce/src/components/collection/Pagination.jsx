import { useState } from "react";

export default function Pagination({ totalPages = 4 }) {
  const [currentPage, setCurrentPage] = useState(1);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="w-full">
      <nav
        className="flex items-center justify-center gap-2"
        aria-label="Pagination"
        style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
      >
        {/* Previous */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            currentPage === 1
              ? "cursor-not-allowed text-neutral-300 dark:text-neutral-600"
              : "cursor-pointer text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          <span>Previous</span>
        </button>

        {/* Page numbers */}
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => setCurrentPage(page)}
            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? "bg-neutral-200/80 text-neutral-900 dark:bg-neutral-700 dark:text-white"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? "cursor-not-allowed text-neutral-300 dark:text-neutral-600"
              : "cursor-pointer text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          }`}
        >
          <span>Next</span>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </nav>
    </div>
  );
}
