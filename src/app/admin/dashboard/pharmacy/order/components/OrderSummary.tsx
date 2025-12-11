"use client";
import React, { useState } from "react";
import { Edit, Printer, X } from "lucide-react";
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
import { CancelOrderRequest, cancelShiprocketOrder } from "../services";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const downloadAndPrintPDF = (url: string, orderId: string) => {
  try {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    document.body.appendChild(printFrame);

    printFrame.onload = () => {
      setTimeout(() => {
        try {
          printFrame.contentWindow?.print();
        } catch (e) {
          console.error("Print error:", e);
          window.open(url, "_blank");
        }
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 500);
    };

    printFrame.src = url;
  } catch (error) {
    console.error("Error printing receipt:", error);
    toast.error("Failed to print receipt. Opening in new tab...");
    window.open(url, "_blank");
  }
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        if (order?.receipt_url) {
          handlePrint();
        }
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isOpen, order?.receipt_url]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  if (!isOpen || !order) return null;

  const handleCancel = async () => {
    try {
      setIsSubmitting(true);

      const cancellationReason = "Order Cancelled by admin";

      const cancelData: CancelOrderRequest = {
        orderId: order.id,
        orderStatus: "Cancelled",
        reason: cancellationReason,
      };

      const response = await cancelShiprocketOrder(cancelData);
      order.deliverystatus = "Cancelled";
      toast.success("Order cancelled successfully");
      onClose();
      console.log("ShipRocket cancellation response:", response);
    } catch (error) {
      console.error("Cancellation error:", error);

      onClose();
    } finally {
      setIsSubmitting(false);
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
  const handlePrint = () => {
    if (!order?.receipt_url) {
      toast.error("Receipt not available");
      return;
    }

    downloadAndPrintPDF(order.receipt_url, order.id);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Order ID: {order.id}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={order.deliverystatus || "Pending"} />
              <StatusBadge status={order.paymentstatus} />
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
            {order.deliverystatus != "Cancelled" && (
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-white border border-gray-300 rounded-lg bg-[#EB5757]  transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="text-[10px]">Canceling...</span>
                ) : (
                  <>
                    <span className="text-[10px]">Cancel Order</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={handlePrint}
              disabled={!order?.receipt_url}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                !order?.receipt_url
                  ? "No receipt available"
                  : "Print receipt (Ctrl+P)"
              }
            >
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
