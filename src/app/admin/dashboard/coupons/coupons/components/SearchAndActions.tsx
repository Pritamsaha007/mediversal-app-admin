"use client";
import { Search, Plus, ChevronDown } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface SearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedItems: string[];

  onAddCoupon: () => void;
}

export default function SearchAndActions({
  searchTerm,
  onSearchChange,
  selectedItems,

  onAddCoupon,
}: SearchAndActionsProps) {
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const bulkActionsRef = useRef<HTMLDivElement>(null);

  const bulkActions = [
    { label: "Delete Selected", value: "delete", icon: "🗑️" },
    { label: "Export Selected", value: "export", icon: "📤" },
    { label: "Activate Selected", value: "activate", icon: "✅" },
    { label: "Deactivate Selected", value: "deactivate", icon: "❌" },
  ];

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
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by coupon code, discount..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm text-gray-700"
        />
      </div>
      <div className="flex gap-3">
        {selectedItems.length > 0 && (
          <div className="relative" ref={bulkActionsRef}></div>
        )}
        {/* <button
          onClick={() => alert("Generating bulk coupons...")}
          className="flex items-center gap-2 text-sm px-4 py-2 border text-[12px] border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50 transition-colors"
        >
          Bulk Generate
        </button> */}
        <button
          onClick={onAddCoupon}
          className="flex items-center gap-2 text-sm px-4 py-2 text-[12px] bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </div>
    </div>
  );
}
