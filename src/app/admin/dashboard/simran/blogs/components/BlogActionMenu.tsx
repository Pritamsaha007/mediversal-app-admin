import React, { useEffect, useRef } from "react";
import { ShieldOff, ShieldCheck, Trash2 } from "lucide-react";

interface BlogActionMenuProps {
  isActive: boolean;
  onToggleActive: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const BlogActionMenu: React.FC<BlogActionMenuProps> = ({
  isActive,
  onToggleActive,
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
      className="absolute right-0 top-8 z-50 bg-white border border-[#E5E8E9] rounded-lg shadow-lg w-44 py-1"
    >
      <button
        onClick={() => {
          onToggleActive();
          onClose();
        }}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] text-[#161D1F] hover:bg-gray-50 transition-colors"
      >
        {isActive ? (
          <>
            <ShieldOff className="w-4 h-4" />
            Make Inactive
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 text-[#0088B1]" />
            Make Active
          </>
        )}
      </button>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};

export default BlogActionMenu;
