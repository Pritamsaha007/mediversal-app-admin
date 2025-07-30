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
    <div className="border-b border-gray-200 bg-gray-50">
      <nav className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-md text-[10px] font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? "bg-[#0088b1] text-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            {/* <tab.icon className="w-4 h-4" /> */}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OrderTabs;
