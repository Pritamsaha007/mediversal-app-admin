// components/StatusBadge.tsx
import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "payment" | "order";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "order",
}) => {
  const statusColors = {
    Processing: "bg-blue-100 text-blue-800",
    Packed: "bg-purple-100 text-purple-800",
    Shipped: "bg-indigo-100 text-indigo-800",
    OnGoing: "bg-cyan-100 text-cyan-800",
    OutforDelivery: "bg-orange-100 text-orange-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
    Paid: "bg-green-100 text-green-800",
    PAID: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Failed: "bg-red-100 text-red-800",
    Refund: "bg-orange-100 text-orange-800",
    completed: "bg-red-100 text-green-800",
    "Not Provided": "bg-yellow-100 text-yellow-800",
    "ON GOING": "bg-cyan-100 text-cyan-800",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        statusColors[status as keyof typeof statusColors] ||
        "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
