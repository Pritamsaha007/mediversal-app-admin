import React, { useState } from "react";
import { ChevronRight, Edit, Printer, X } from "lucide-react";
import { toast } from "react-hot-toast";

import StatusBadge from "./StatusBadge";
import OrderTabs from "./OrderSummary/OrderTabs";
import OrderOverview from "./OrderSummary/OrderOverview";
import OrderItems from "./OrderSummary/OrderItems";
import OrderShipping from "./OrderSummary/OrderShipping";
import OrderPayment from "./OrderSummary/OrderPayment";
import OrderHistory from "./OrderSummary/OrderHistory";
import { Order } from "../types/types";
import OrderPrescriptions from "./OrderSummary/OrderPrescriptions";
import { cancelOrder } from "../services/orderServices";

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
  const [isCanceling, setIsCanceling] = useState(false);

  if (!isOpen || !order) return null;

  const handleCancelOrder = async () => {
    if (!order) return;

    setIsCanceling(true);
    try {
      const cancellationReason = "Order canceled by admin";

      const response = await cancelOrder(
        order.orderId.toString(),
        cancellationReason
      );

      console.log(response, "cancellation res");
      console.log(response, "cancellation res");
      if (response.success) {
        console.log("try");
        if (response.data?.message !== "Endpoint request timed out") {
          toast.success("Order cancellation  completed");
        }
      } else {
        throw new Error(response.message || "Failed to cancel order");
      }
    } catch (error) {
      onClose();
      console.log(error);
      toast.success("Order cancellation  completed");
    } finally {
      setIsCanceling(false);
    }
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OrderOverview order={order} />;
      case "items":
        return <OrderItems order={order} />;
      case "prescriptions":
        return <OrderPrescriptions order={order} />;
      case "shipping":
        return <OrderShipping order={order} />;
      case "payment":
        return <OrderPayment order={order} />;
      case "history":
        return <OrderHistory order={order} />;
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
            <h2 className="text-base font-semibold text-gray-800">
              Order ID: {order.orderId}
            </h2>
            <div className="flex items-center gap-2 mt-1">
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
            {order.deliverystatus != "Order cancelled successfully." && (
              <button
                onClick={handleCancelOrder}
                disabled={isCanceling}
                className="px-4 py-2 text-white border border-gray-300 rounded-lg bg-[#EB5757]  transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {isCanceling ? (
                  <span className="text-[10px]">Canceling...</span>
                ) : (
                  <>
                    <span className="text-[10px]">Cancel Order</span>
                  </>
                )}
              </button>
            )}
            <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
              <Printer className="w-3 h-3" />
              <span className="text-[10px]">Print</span>
            </button>
            <button
              onClick={handleNextTab}
              className="px-4 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors duration-200 flex items-center gap-2"
              style={{ backgroundColor: "#0088B1" }}
            >
              <Edit className="w-3 h-3" />
              <span className="text-[10px]">Next</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
