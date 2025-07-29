import React, { useState } from "react";
import {
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Order } from "../../types/types";
import PrescriptionViewer from "./PrescriptionViewer";

interface OrderItemsProps {
  order: Order;
}

const OrderItems: React.FC<OrderItemsProps> = ({ order }) => {
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  return (
    <div className="space-y-20 h-80">
      {/* Order Items */}
      <div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Order Items
          </h3>
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-medium text-gray-700 text-sm">
            <div>Product Name</div>
            <div className="text-right">Price</div>
            <div className="text-center">Quantity</div>
            <div className="text-right">Total</div>
            <div className="text-center">Prescription</div>
          </div>
          {order.items.map((item) => (
            <div
              key={item.orderItemId}
              className="grid grid-cols-5 gap-4 p-4 border-t border-gray-100 hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium text-gray-700">
                  {item.productName || `Product ID: ${item.productId}`}
                </h4>
                {item.sku && (
                  <p className="text-gray-500 text-sm">SKU: {item.sku}</p>
                )}
              </div>
              <div className="text-right font-semibold text-gray-700">
                {formatCurrency(parseFloat(item.sellingPrice))}
              </div>
              <div className="text-center text-gray-600">{item.quantity}</div>
              <div className="text-right font-semibold text-gray-700">
                {formatCurrency(parseFloat(item.sellingPrice) * item.quantity)}
              </div>
              <div className="text-center">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                  {item.prescriptionRequired === "Yes"
                    ? "Rx Required"
                    : "Not Required"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prescription Information */}
      {order.prescriptions.length > 0 && (
        <div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
              Prescription Information
            </h3>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Prescription ID</p>
                <p className="font-medium text-gray-700">
                  {order.prescriptions[0].prescription_id}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Verified
              </span>
            </div>

            <PrescriptionViewer prescriptions={order.prescriptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItems;
