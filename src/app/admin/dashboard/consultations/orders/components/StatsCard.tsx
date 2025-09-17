import React from "react";

interface StatsCardProps {
  title: string;
  stats: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, stats, icon, color }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] text-[#899193] mb-1">{title}</p>
        <p className="text-[18px] font-semibold text-[#161D1F]">{stats}</p>
      </div>
      <div className={`${color}`}>{icon}</div>
    </div>
  </div>
);

export default StatsCard;
