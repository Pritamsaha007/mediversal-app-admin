"use client";
import { Search, Plus, Download } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface SearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedItems: string[];

  onExport?: () => void;
}

export default function SearchAndActions({
  searchTerm,
  onSearchChange,
  selectedItems,

  onExport,
}: SearchAndActionsProps) {
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const bulkActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bulkActionsRef.current &&
        !bulkActionsRef.current.contains(event.target as Node)
      ) {
        setBulkActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by coupon code, discount..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
          />
        </div>

        {onExport && (
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              {selectedItems.length > 0
                ? `Export Selected (${selectedItems.length})`
                : "Export All"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
