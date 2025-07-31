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
        <div className="bg-white p-4 rounded-lg  border border-gray-300">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Order Items
          </h3>
          <div className="grid grid-cols-5 gap-4 py-4 text-gray-700 text-xs">
            <div className="text-xs">Product Name</div>
            <div className="text-right text-xs">Price</div>
            <div className="text-center text-xs">Quantity</div>
            <div className="text-right text-xs">Total</div>
            <div className="text-center text-xs">Prescription</div>
          </div>
          {order.items.map((item) => (
            <div
              key={item.orderItemId}
              className="grid grid-cols-5 gap-4 py-4 border-t border-gray-100 hover:bg-gray-50"
            >
              <div>
                <h4 className="text-xs text-gray-700">
                  {item.productName || `Product ID: ${item.productId}`}
                </h4>
                {item.sku && (
                  <p className="text-gray-500 text-[10px]">
                    ID: {item.productId}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-gray-700">
                {formatCurrency(parseFloat(item.sellingPrice))}
              </div>
              <div className="text-center text-xs text-gray-600">
                {item.quantity}
              </div>
              <div className="text-right text-xs text-gray-700">
                {formatCurrency(parseFloat(item.sellingPrice) * item.quantity)}
              </div>
              <div className="text-center">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-[10px]">
                  {item.prescriptionRequired === "Yes"
                    ? "Rx Required"
                    : "Not Required"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderItems;
