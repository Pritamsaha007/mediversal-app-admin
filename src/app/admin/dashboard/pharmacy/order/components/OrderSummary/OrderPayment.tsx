import React from "react";
import { Order } from "../../types/types";
import StatusBadge from "./StatusBadge";

interface OrderPaymentProps {
  order: Order;
}

const OrderPayment: React.FC<OrderPaymentProps> = ({ order }) => {
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  const Original_value =
    Number(order.TotalOrderAmount) +
    (order.applied_discount_value ? Number(order.applied_discount_value) : 0);
  const finalAmount =
    Original_value < 499 ? Original_value - 50 : Original_value - 10;

  return (
    <div className="space-y-6 h-80">
      {/* Payment Information */}
      <div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Payment Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Payment Method</p>
              <p className="font-medium text-gray-700">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Payment Status</p>
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Order Summary
          </h3>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-700">₹{finalAmount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Handling & Packaging Fee:</span>
            <span className="font-medium text-gray-700">₹5.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Platform Fee:</span>
            <span className="font-medium text-gray-700">₹5.00</span>
          </div>
          {order.applied_discount_value && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Applied Discount:</span>
              <span className="font-medium text-gray-700">
                -{order.applied_discount_value}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Delivery Charges:</span>
            <span className="font-medium text-gray-700">
              {finalAmount < 499 ? "₹40" : "N/A"}
            </span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">
                Total:
              </span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(parseFloat(order.TotalOrderAmount || "0"))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPayment;
