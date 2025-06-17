import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 4) {
        pages.push("ellipsis-start");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className="bg-white border-t border-gray-200/60">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4">
        {/* Items info and per-page selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-sm text-gray-600 font-medium">
            Showing{" "}
            <span className="text-gray-900 font-semibold">{startItem}</span> to{" "}
            <span className="text-gray-900 font-semibold">{endItem}</span> of{" "}
            <span className="text-gray-900 font-semibold">{totalItems}</span>{" "}
            results
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium whitespace-nowrap">
              Show:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 bg-white text-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium
                         focus:ring-2 focus:ring-[#0088B1]/20 focus:border-[#0088B1] transition-all duration-200
                         hover:border-gray-400 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 
                       border border-gray-300 rounded-lg transition-all duration-200
                       hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white
                       disabled:hover:border-gray-300 disabled:hover:text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {generatePageNumbers().map((pageNumber, index) => {
              if (
                pageNumber === "ellipsis-start" ||
                pageNumber === "ellipsis-end"
              ) {
                return (
                  <div key={`ellipsis-${index}`} className="px-2 py-2">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>
                );
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => {
                    if (typeof pageNumber === "number") {
                      onPageChange(pageNumber);
                    }
                  }}
                  className={`min-w-[40px] h-10 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === pageNumber
                      ? "bg-[#0088B1] text-white shadow-sm border border-[#0088B1] hover:bg-[#0088B1]"
                      : "text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600
                       border border-gray-300 rounded-lg transition-all duration-200
                       hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white
                       disabled:hover:border-gray-300 disabled:hover:text-gray-600"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
