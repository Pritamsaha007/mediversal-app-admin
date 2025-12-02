import React from "react";

interface StatsCardProps {
  title: string;
  stats: string | number | undefined;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, stats, icon, color }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[12px] shadow-2xs text-[#899193] mb-1">{title}</p>
        <p className="text-sm font-semibold text-[#161D1F]">{stats}</p>
      </div>
      <div className={`${color}`}>{icon}</div>
    </div>
  </div>
);

export default StatsCard;
