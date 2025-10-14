// components/Pagination.tsx
import * as React from "react";

type PaginationProps = {
  /** 1-based current page (preferred). If omitted, it will be derived from offset/limit. */
  page?: number;
  /** Total number of pages. If omitted, it will be derived from total/limit. */
  totalPages?: number;
  /** Total number of items (used for summary or deriving pages). */
  total?: number;
  /** Items per page. Defaults to 50 if not provided. */
  limit?: number;
  /** 0-based offset (used if page not given). */
  offset?: number;
  /** Called with the new 1-based page number. */
  onPageChange: (page: number) => void;

  /** How many page buttons to show at once (default 5). */
  windowSize?: number;
  /** Show "Showing X–Y of Z" text (default true). */
  showSummary?: boolean;

  className?: string;
};

export const PaginationV2: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  limit = 50,
  offset = 0,
  onPageChange,
  windowSize = 5,
  showSummary = true,
  className = "",
}) => {
  // derive values when not provided
  const derivedTotalPages =
    totalPages ?? Math.max(1, Math.ceil((total ?? 0) / Math.max(1, limit)));
  const currentPage = page ?? Math.floor(offset / Math.max(1, limit)) + 1;

  const clamp = (p: number) => Math.min(Math.max(1, p), derivedTotalPages);
  const goToPage = (p: number) => onPageChange(clamp(p));

  const canPrev = currentPage > 1;
  const canNext = currentPage < derivedTotalPages;

  const getWindowPages = () => {
    const n = derivedTotalPages;
    const w = Math.max(1, windowSize);
    if (n <= w) return Array.from({ length: n }, (_, i) => i + 1);
    let start = Math.max(1, currentPage - Math.floor(w / 2));
    let end = start + w - 1;
    if (end > n) {
      end = n;
      start = Math.max(1, end - w + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = getWindowPages();

  // summary numbers
  const startItem = total ? (currentPage - 1) * limit + 1 : 0;
  const endItem = total ? Math.min(total, currentPage * limit) : 0;

  // hide completely if only 1 page and no summary
  if (derivedTotalPages <= 1 && !showSummary) return null;

  return (
    <div
      className={`bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 ${className}`}
    >
      {/* Mobile: Previous / Next */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={!canPrev}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            !canPrev
              ? "text-gray-300 bg-gray-50"
              : "text-gray-700 bg-white hover:bg-gray-50"
          } whitespace-nowrap`}
        >
          Previous
        </button>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={!canNext}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            !canNext
              ? "text-gray-300 bg-gray-50"
              : "text-gray-700 bg-white hover:bg-gray-50"
          } whitespace-nowrap`}
        >
          Next
        </button>
      </div>

      {/* Desktop: Summary + numbered pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {showSummary ? (
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startItem || 0}</span> to{" "}
              <span className="font-medium">{endItem || 0}</span> of{" "}
              <span className="font-medium">{total ?? 0}</span> results
            </p>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center">
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => goToPage(1)}
              disabled={!canPrev}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                !canPrev ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">First</span>
              <i className="fas fa-angle-double-left" />
            </button>

            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!canPrev}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                !canPrev ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">Previous</span>
              <i className="fas fa-chevron-left" />
            </button>

            {pages.map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === p
                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!canNext}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                !canNext ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">Next</span>
              <i className="fas fa-chevron-right" />
            </button>

            <button
              onClick={() => goToPage(derivedTotalPages)}
              disabled={!canNext}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                !canNext ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">Last</span>
              <i className="fas fa-angle-double-right" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PaginationV2;
