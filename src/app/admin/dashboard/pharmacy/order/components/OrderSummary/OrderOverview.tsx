import React from "react";
import { Phone, Mail } from "lucide-react";
import { Order } from "../../types/types";

interface OrderOverviewProps {
  order: Order;
}

const OrderOverview: React.FC<OrderOverviewProps> = ({ order }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-80">
      {/* Customer Information */}
      <div className="bg-white rounded-lg  border border-gray-300">
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-6">
            Customer Information
          </h3>

          <div className="flex items-center gap-3 mb-4">
            {/* Avatar initials or fallback */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 font-bold">
              {order?.customerName
                ? order.customerName
                    .split(" ")
                    .map((name: string) => name[0])
                    .join("")
                    .toUpperCase()
                : "M"}
            </div>

            {/* Customer info */}
            <div>
              <div className="font-semibold text-gray-800 text-xs">
                {order?.customerName || "Guest User"}
              </div>
              <div className="text-[10px] text-gray-500">
                ID: {order?.customerId || "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-3 h-3 text-gray-600" />
              <span className="text-gray-700 text-[10px]">
                {order.customerPhone}
              </span>
            </div>

            {order.customerEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700 text-[10px]">
                  {order.customerEmail}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg  border border-gray-300">
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-6">
            Order Details
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] text-gray-500 mb-1">Order Date</div>
                <div className="text-xs text-gray-800">
                  {new Date(order.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 mb-1">
                  Last Updated
                </div>
                <div className="text-xs text-gray-800">
                  {new Date(order.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-gray-500 mb-1">
                Delivery Method
              </div>
              <div className="text-xs text-gray-800">Standard Delivery</div>
            </div>

            <div>
              <div className="text-[10px] text-gray-500 mb-1">
                Estimated Delivery
              </div>
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
              <div className="text-[10px] text-gray-500 mb-1">
                Actual Delivery
              </div>
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

            <div className="pt-4">
              <div className="text-[10px] text-gray-500 mb-2">Order Notes</div>
              <div className="text-xs text-gray-700">
                Please deliver medicines in a temperature-controlled package
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderOverview;
