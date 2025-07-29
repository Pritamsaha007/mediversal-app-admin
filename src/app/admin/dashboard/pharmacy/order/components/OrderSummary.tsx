import React, { useState } from "react";
import { X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import OrderTabs from "./OrderSummary/OrderTabs";
import OrderOverview from "./OrderSummary/OrderOverview";
import OrderItems from "./OrderSummary/OrderItems";
import OrderShipping from "./OrderSummary/OrderShipping";
import OrderPayment from "./OrderSummary/OrderPayment";
import OrderHistory from "./OrderSummary/OrderHistory";
import { Order } from "../types/types";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen || !order) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OrderOverview order={order} />;
      case "items":
        return <OrderItems order={order} />;
      case "shipping":
        return <OrderShipping order={order} />;
      case "payment":
        return <OrderPayment order={order} />;
      // case "history":
      //   return <OrderHistory order={order} />;
      default:
        return <OrderOverview order={order} />;
    }
  };

  const handleNextTab = () => {
    const tabs = ["overview", "items", "shipping", "payment", "history"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Order Details
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-medium" style={{ color: "#0088B1" }}>
                Order ID: {order.orderId}
              </p>
              <StatusBadge status={order.deliverystatus || "Pending"} />
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <OrderTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-190px)] ">
          {renderTabContent()}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50 mt-2">
          <div className="flex gap-2">
            {/* <button className="px-4 py-2 text-white border mr-5 border-gray-300 rounded-lg bg-[#EB5757] hover:bg-gray-50 transition-colors duration-200">
              Cancel Order
            </button> */}
            {/* <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              Print
            </button> */}
          </div>
          <button
            onClick={handleNextTab}
            className="px-6 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors duration-200"
            style={{ backgroundColor: "#0088B1" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
