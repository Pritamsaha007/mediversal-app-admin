import React, { useEffect, useRef } from "react";
import { Play, FileCheck, Trash2 } from "lucide-react";

interface LeadActionMenuProps {
  onMarkInProgress: () => void;
  onMarkConverted: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const LeadActionMenu: React.FC<LeadActionMenuProps> = ({
  onMarkInProgress,
  onMarkConverted,
  onDelete,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 z-50 bg-white border border-[#E5E8E9] rounded-lg shadow-lg w-52 py-1"
    >
      <button
        onClick={() => {
          onMarkInProgress();
          onClose();
        }}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-[12px] text-[#161D1F] hover:bg-gray-50 transition-colors"
      >
        <Play className="w-4 h-4 text-[#161D1F]" />
        Mark as In-Progress
      </button>
      <button
        onClick={() => {
          onMarkConverted();
          onClose();
        }}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-[12px] text-[#161D1F] hover:bg-gray-50 transition-colors"
      >
        <FileCheck className="w-4 h-4 text-[#161D1F]" />
        Mark as Converted
      </button>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-[12px] text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};

export default LeadActionMenu;
