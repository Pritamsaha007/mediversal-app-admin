// Replace the existing StatsCard interface and component with this:

import React from "react";

interface Status {
  label: string;
  value: number | string;
}

interface StatsCardProps {
  title: string;
  stats: Status[] | string | number;
  icon: React.ReactNode;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  stats,
  icon,
  color = "text-blue-500",
}) => {
  const getChipClasses = (label: string): string => {
    const base =
      "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full mr-2 mb-1";

    // Order Status Colors
    if (
      label.toLowerCase() === "completed" ||
      label.toLowerCase() === "delivered" ||
      label.toLowerCase() === "verified" ||
      label.toLowerCase() === "paid"
    ) {
      return `${base} bg-[#E6F4EA] text-[#28A745] text-[8px]`;
    }
    if (
      label.toLowerCase() === "cancelled" ||
      label.toLowerCase() === "failed" ||
      label.toLowerCase() === "rejected"
    ) {
      return `${base} bg-[#FFEAEA] text-[#FF1F1F] text-[8px]`;
    }
    if (
      label.toLowerCase() === "pending" ||
      label.toLowerCase() === "awaiting verification" ||
      label.toLowerCase() === "processing"
    ) {
      return `${base} bg-[#FFF3CD] text-[#856404] text-[8px]`;
    }
    if (
      label.toLowerCase() === "shipped" ||
      label.toLowerCase() === "packed" ||
      label.toLowerCase() === "out for delivery"
    ) {
      return `${base} bg-[#E3F2FD] text-[#1976D2] text-[8px]`;
    }
    // Revenue related labels
    if (
      label.toLowerCase() === "today" ||
      label.toLowerCase() === "this month"
    ) {
      return `${base} bg-[#E8F5E8] text-[#2E7D32] text-[8px]`;
    }

    return `${base} bg-gray-100 text-gray-700 text-[8px]`;
  };

  const getTotalValue = (): string => {
    if (typeof stats === "string" || typeof stats === "number") {
      return stats.toString();
    }

    if (Array.isArray(stats)) {
      // For revenue cards, don't sum up the values, just show the main total
      if (title.toLowerCase() === "revenue") {
        const todayValue = stats.find(
          (stat) => stat.label.toLowerCase() === "today"
        )?.value;
        return todayValue?.toString() || "0";
      }

      const total = stats.reduce((acc, curr) => {
        const numValue =
          typeof curr.value === "string"
            ? parseInt(curr.value.replace(/[^\d]/g, "")) || 0
            : Number(curr.value) || 0;
        return acc + numValue;
      }, 0);

      return total.toString();
    }

    return "0";
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
      {icon && <div className={`absolute top-2 right-2 ${color}`}>{icon}</div>}
      <div className="flex flex-col items-start">
        <p className="text-sm text-[#161D1F] text-[10px] mb-1">{title}</p>
        <div className="text-[14px] font-semibold text-[#161D1F] mb-2">
          {getTotalValue()}
        </div>
        {/* Only show chips if stats is an array */}
        {Array.isArray(stats) && (
          <div className="flex flex-wrap">
            {stats.map((stat, index) => (
              <span key={index} className={getChipClasses(stat.label)}>
                {stat.value} {stat.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
