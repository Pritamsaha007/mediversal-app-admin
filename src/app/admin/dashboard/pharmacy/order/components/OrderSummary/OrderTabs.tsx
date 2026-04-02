import React from "react";
import {
  User,
  Package,
  Truck,
  CreditCard,
  Clock,
  FileText,
} from "lucide-react";

interface OrderTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const OrderTabs: React.FC<OrderTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "items", label: "Items", icon: Package },
    { id: "prescriptions", label: "Prescriptions", icon: FileText },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "payment", label: "Payment", icon: CreditCard },

    { id: "history", label: "History", icon: Clock },
  ];

  return (
    <div className="border-b  bg-gray-50 p-2">
      <nav className="flex w-full gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 whitespace-nowrap text-[12px] py-3 font-medium rounded-md transition-colors duration-200 text-center
          ${
            activeTab === tab.id ? "bg-[#0088b1] text-white" : " text-gray-600 "
          }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OrderTabs;
