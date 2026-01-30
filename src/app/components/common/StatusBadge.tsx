import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "payment" | "order" | "general";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "order",
}) => {
  const normalized = (status || "").toLowerCase().trim();

  const statusColors: Record<string, string> = {
    processing: "bg-blue-100 text-blue-800",
    packed: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    ongoing: "bg-cyan-100 text-cyan-800",
    "on going": "bg-cyan-100 text-cyan-800",

    outfordelivery: "bg-orange-100 text-orange-800",
    "out for delivery": "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    confirmed: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    unpaid: "bg-[#F2994A] text-white",
    "partially paid": "bg-yellow-200 text-yellow-900",
    "not provided": "bg-amber-100 text-amber-800",
    "in progress": "bg-yellow-100 text-yellow-800",
    "not needed": "bg-yellow-100 text-yellow-800",
    "not assigned": "bg-red-100 text-red-800",

    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    refund: "bg-orange-100 text-orange-800",

    active: "bg-[#34C759] text-white",
    available: "bg-[#34C759] text-white",
    inactive: "bg-[#F2994A] text-white",
    featured: "text-[#F2994A] border border-[#F2994A]",
  };

  const fallback = "bg-gray-100 text-gray-600";

  return (
    <span
      className={`px-3 py-1 text-[10px] font-medium rounded-full ${
        statusColors[normalized] || fallback
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
