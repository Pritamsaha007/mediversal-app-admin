import React from "react";
import { MoreVertical, Eye, Printer, Trash2 } from "lucide-react";
import { Order } from "../types/types";

interface OrderActionDropdownProps {
  order: Order;
  isOpen: boolean;
  onToggle: () => void;
  onAction: (action: string, order: Order) => void;
}

const OrderActionDropdown: React.FC<OrderActionDropdownProps> = ({
  order,
  isOpen,
  onToggle,
  onAction,
}) => {
  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log("DEBUG - View button clicked", order.orderId);
    onAction("view", order);
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="dropdown-toggle p-1 rounded-full hover:bg-gray-100"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <button
            onClick={handleViewClick}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => onAction("print", order)}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <button
            onClick={() => onAction("delete", order)}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderActionDropdown;
