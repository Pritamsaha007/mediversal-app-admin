// components/Pagination.tsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  hasMore,
  loading,
  onPrevious,
  onNext,
  totalItems,
  itemsPerPage = 20,
  className = "",
}) => {
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = currentPage * itemsPerPage + (totalItems || 0);
  const showItemCount = totalItems !== undefined;

  return (
    <div
      className={`px-6 py-6 border-t border-gray-200 flex justify-end ${className}`}
    >
      <div className="mt-1">
        {showItemCount && totalItems > 0 && (
          <p className="text-sm text-gray-600">
            {startItem} to {endItem} Items
          </p>
        )}
      </div>

      <div className="flex items-center ">
        <button
          onClick={onPrevious}
          disabled={currentPage === 0 || loading}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
            currentPage === 0 || loading
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#161D1F] hover:bg-gray-100"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* <div className="text-sm text-gray-600">Page {currentPage + 1}</div> */}

        <button
          onClick={onNext}
          disabled={!hasMore || loading}
          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium ${
            !hasMore || loading
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#161D1F] hover:bg-gray-100"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
