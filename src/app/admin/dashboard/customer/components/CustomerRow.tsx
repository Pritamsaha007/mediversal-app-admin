import React from "react";
import { Customer } from "../type/customerDetailTypes";
import { CustomerService } from "../services/customerService";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isActive = status?.toLowerCase() === "active";
  return (
    <span
      className={`inline-flex items-center px-4 py-1 rounded text-[10px] font-medium ${
        isActive ? "bg-[#34C759] text-white" : "bg-[#EB5757] text-white"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

interface CustomerRowProps {
  customer: Customer;
  onClick: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

const CustomerRow: React.FC<CustomerRowProps> = React.memo(
  ({ customer, onClick, isSelected, onSelect }) => {
    return (
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={onClick}
      >
        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-gray-300 text-[#0088B1] focus:ring-[#0088B1]"
          />
        </td>
        <td className="px-6 py-4">
          <div className="text-[12px] font-medium text-[#161D1F]">
            {CustomerService.getFullName(customer)}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-[12px] text-[#161D1F]">
            {customer.email || "N/A"}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-[12px] text-[#161D1F]">
            {customer.phone_number || "N/A"}
          </div>
        </td>
        <td className="px-6 py-4">
          <StatusBadge status={customer.status} />
        </td>
        <td className="px-6 py-4">
          <div className="text-[12px] font-medium text-[#161D1F]">
            {CustomerService.formatCurrency(customer.total_spent)}
          </div>
        </td>
      </tr>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.customer.id === nextProps.customer.id &&
      prevProps.customer.status === nextProps.customer.status &&
      prevProps.customer.total_spent === nextProps.customer.total_spent &&
      prevProps.isSelected === nextProps.isSelected
    );
  }
);

CustomerRow.displayName = "CustomerRow";

export default CustomerRow;
