"use client";
import React from "react";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 flex-wrap">
      <Home className="w-3.5 h-3.5 text-[#899193]" />
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <ChevronRight className="w-3.5 h-3.5 text-[#C5C9CA] flex-shrink-0" />
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-[12px] text-[#899193] hover:text-[#0088B1] transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-[12px] font-medium text-[#0088B1] bg-[#E8F4F7] px-2.5 py-0.5 rounded-full">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
