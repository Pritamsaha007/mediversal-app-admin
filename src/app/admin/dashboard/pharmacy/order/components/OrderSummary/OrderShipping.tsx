import React from "react";
import { Order } from "../../types/types";

interface OrderShippingProps {
  order: Order;
}

const OrderShipping: React.FC<OrderShippingProps> = ({ order }) => {
  return (
    <div className="space-y-6 h-80">
      {/* Shipping Address */}
      <div>
        <div className="bg-white p-4 rounded-lg  border border-gray-300">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Shipping Address
          </h3>
          <div className="flex items-start gap-3">
            <div>
              <p className="text-xs text-gray-700">{order.customerName}</p>
              <p className="text-gray-600 text-[10px] mt-1">
                {order.customerAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Details */}
      <div>
        <div className="bg-white p-4 rounded-lg  border border-gray-300 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Shipping Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-[10px]">Delivery Method</p>
              <p className="font-medium text-xs text-gray-700">
                Standard Delivery
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-[10px]">Shipping Cost</p>
              <p className="text-xs text-gray-700">
                {Number(order.TotalOrderAmount) < 499 ? "₹40" : "N/A"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-[10px]">Estimated Delivery</p>
              <div>
                <div className="text-xs text-gray-800">
                  {new Date(
                    new Date(order.createdAt).getTime() +
                      3 * 24 * 60 * 60 * 1000
                  ).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-[10px]">Actual Delivery</p>
              <div>
                <div className="text-xs text-gray-800">
                  {new Date(
                    new Date(order.createdAt).getTime() +
                      3 * 24 * 60 * 60 * 1000
                  ).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-gray-600 text-[10px]">Tracking Number</p>
            <p className="text-xs text-gray-700">{order.rapidshypAwb}</p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-gray-600 text-[10px]">
              <span className="text-xs">Delivery Notes:</span> Please deliver
              medicines in a temperature-controlled package.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderShipping;
