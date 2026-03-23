"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

interface ActionMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

interface ActionMenuProps {
  id: string;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  items: ActionMenuItem[];
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  id,
  openMenuId,
  setOpenMenuId,
  items,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOpen = openMenuId === id;
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  // Calculate position every time menu opens
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.right - 192, // 192px = w-48
      zIndex: 9999,
      minWidth: 192,
    });
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setOpenMenuId]);

  // Close on any scroll
  useEffect(() => {
    if (!isOpen) return;
    const handler = () => setOpenMenuId(null);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [isOpen, setOpenMenuId]);

  const dropdown = isOpen ? (
    <div
      ref={menuRef}
      style={menuStyle}
      className="bg-white border border-[#E5E8E9] rounded-xl shadow-xl py-1"
    >
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
            setOpenMenuId(null);
          }}
          className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] transition-colors ${
            item.className || "text-[#161D1F] hover:bg-[#E8F4F7]"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(isOpen ? null : id);
        }}
        className="p-1.5 text-[#899193] hover:text-[#161D1F] hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </>
  );
};

export default ActionMenu;
