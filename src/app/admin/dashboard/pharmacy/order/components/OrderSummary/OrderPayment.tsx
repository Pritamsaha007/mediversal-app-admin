import React from "react";
import { Order } from "../../types/types";
import StatusBadge from "./StatusBadge";

interface OrderPaymentProps {
  order?: Order | null; // made optional & nullable
}

const OrderPayment: React.FC<OrderPaymentProps> = ({ order }) => {
  // Safe currency formatter
  const formatCurrency = (amount?: number | string | null): string => {
    const value = Number(amount);
    return isNaN(value) ? "₹0.00" : `₹${value.toFixed(2)}`;
  };

  const totalOrderAmount = Number(order?.TotalOrderAmount) || 0;
  const appliedDiscount = Number(order?.applied_discount_value) || 0;
  const originalValue = totalOrderAmount + appliedDiscount;

  const finalAmount =
    originalValue > 0
      ? originalValue < 499
        ? originalValue - 45
        : originalValue - 5
      : 0;

  const deliveryCharges =
    originalValue < 499 && originalValue > 0 ? "₹40" : "N/A";

  const paymentMethod = order?.paymentMethod || "N/A";
  const paymentStatus = order?.paymentStatus || "Unknown";

  return (
    <div className="space-y-6 h-80">
      <div>
        <div className="bg-white p-4 rounded-lg border border-gray-300 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Payment Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-[10px]">Payment Method</p>
              <p className="text-xs text-gray-700">{paymentMethod}</p>
            </div>
            <div>
              <p className="text-gray-600 text-[10px]">Payment Status</p>
              <StatusBadge status={paymentStatus} />
            </div>
          </div>

          <h3 className="text-[10px] font-medium text-gray-700 mb-4">
            Order Summary
          </h3>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-xs">Subtotal:</span>
            <span className="text-xs text-gray-700">
              {formatCurrency(finalAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-xs">
              Handling & Packaging Fee:
            </span>
            <span className="text-xs text-gray-700">₹5.00</span>
          </div>

          {/* <div className="flex justify-between items-center">
            <span className="text-gray-600 text-xs">Platform Fee:</span>
            <span className="text-xs text-gray-700">₹5.00</span>
          </div> */}

          {appliedDiscount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs">Applied Discount:</span>
              <span className="text-xs text-gray-700">
                -{formatCurrency(appliedDiscount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-xs">Delivery Charges:</span>
            <span className="text-xs text-gray-700">{deliveryCharges}</span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(totalOrderAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPayment;
