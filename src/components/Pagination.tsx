import React from "react";

interface PaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage > 1 ? currentPage - 1 : 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={() =>
            onPageChange(
              currentPage < totalPages ? currentPage + 1 : currentPage
            )
          }
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span> items
          </p>
        </div>
        <div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() =>
                onPageChange(currentPage > 1 ? currentPage - 1 : 1)
              }
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="sr-only">Previous</span>
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => onPageChange(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border ${
                  currentPage === index + 1
                    ? "bg-indigo-50 border-indigo-500 text-indigo-600 z-10"
                    : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                } text-sm font-medium cursor-pointer`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                onPageChange(
                  currentPage < totalPages ? currentPage + 1 : currentPage
                )
              }
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="sr-only">Next</span>
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
