import React from "react";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case "active":
        return "px-3 py-1 text-[8px] bg-[#34C759] text-white rounded-lg text-center";
      case "inactive":
        return "px-3 py-1 text-[8px] bg-[#F2994A] text-white rounded-lg text-center";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-[10px] font-medium rounded-full ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
