import React from "react";
import { StatsCardProps } from "../types/prescription";

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  stats,
  icon,
  color = "text-blue-500",
}) => {
  const getChipClasses = (label: string): string => {
    const base =
      "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full mr-2 mb-1";
    if (label.toLowerCase() === "verified")
      return `${base} bg-[#E6F4EA] text-[#28A745] text-[8px]`;
    if (label.toLowerCase() === "pending")
      return `${base} bg-[#FFF3CD] text-[#856404] text-[8px]`;
    if (label.toLowerCase() === "rejected")
      return `${base} bg-[#FFEAEA] text-[#FF1F1F] text-[8px]`;
    if (label.toLowerCase() === "awaiting confirmation")
      return `${base} bg-[#E7F1FF] text-[#004085] text-[8px]`;
    return `${base} bg-gray-100 text-gray-700 text-[8px]`;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
      {icon && <div className={`absolute top-2 right-2 ${color}`}>{icon}</div>}
      <div className="flex flex-col items-start">
        <p className="text-sm text-[#161D1F] text-[10px] mb-1">{title}</p>
        <div className="text-[14px] font-semibold text-[#161D1F] mb-2">
          {stats.reduce((acc, curr) => acc + Number(curr.value), 0)}
        </div>
        <div className="flex flex-wrap">
          {stats.map((stat, index) => (
            <span key={index} className={getChipClasses(stat.label)}>
              {stat.value} {stat.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
