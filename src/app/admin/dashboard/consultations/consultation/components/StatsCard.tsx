import React from "react";

interface StatsCardProps {
  title: string;
  stats: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  stats,
  subtitle,
  icon,
  color,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] text-[#899193] mb-1">{title}</h3>
          <p className="text-[18px] font-semibold text-[#161D1F]">{stats}</p>
        </div>
        <div className={`${color}`}>{icon}</div>
      </div>
      <p className="text-[10px] text-[#899193]">{subtitle}</p>
    </div>
  );
};

export default StatsCard;
