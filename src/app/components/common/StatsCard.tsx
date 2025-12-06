import React from "react";

interface Status {
  label: string;
  value: number | string;
}

interface StatsCardProps {
  title: string;
  icon?: React.ReactNode;
  color?: string;
  subtitle?: string;
  stats?: string | number | Status[];
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  stats,
  icon,
  color = "text-blue-500",
  subtitle,
}) => {
  const getChipClasses = (label: string): string => {
    const base =
      "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full mr-2 mb-1";
    if (label.toLowerCase() === "active")
      return `${base} bg-[#E6F4EA] text-[#28A745] text-[8px]`;
    if (label.toLowerCase() === "inactive")
      return `${base} bg-[#FFEAEA] text-[#FF1F1F] text-[8px]`;
    return `${base} bg-gray-100 text-gray-700 text-[8px]`;
  };

  const isDetailedVariant = Array.isArray(stats);

  if (isDetailedVariant) {
    const detailedStats = stats as Status[];
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-row justify-between items-start">
        <div className="flex flex-col items-start">
          <p className="text-[10px] text-[#161D1F] mb-1">{title}</p>

          <div className="text-[14px] font-semibold text-[#161D1F] mb-2">
            {detailedStats?.reduce((acc, curr) => {
              const num = Number(curr.value);
              return acc + (isNaN(num) ? 0 : num);
            }, 0) ?? 0}
          </div>

          {detailedStats && detailedStats.length > 0 && (
            <div className="flex flex-wrap">
              {detailedStats.map((stat, index) => (
                <span key={index} className={getChipClasses(stat.label)}>
                  {stat.value} {stat.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {icon && <div className="text-[#0088B1]">{icon}</div>}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[12px] text-[#899193] mb-1">{title}</h3>
          <p className="text-[14px] font-semibold text-[#161D1F]">{stats}</p>
        </div>
        {icon && <div className={`${color}`}>{icon}</div>}
      </div>
      {subtitle && <p className="text-[10px] text-[#899193]">{subtitle}</p>}
    </div>
  );
};

export default StatsCard;
