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
      <div className="bg-white border-2 border-gray-400 rounded-lg border-r-0 lg:border-r-2">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Customer Information
          </h3>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
              {order.customerName
                .split(" ")
                .map((name: any) => name[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-lg">
                {order.customerName}
              </div>
              <div className="text-sm text-gray-500">
                ID: {order.customerId}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700">{order.customerPhone}</span>
            </div>

            {order.customerEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">{order.customerEmail}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white border-2 border-gray-400 rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Order Details
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500 mb-1">Order Date</div>
                <div className="font-medium text-gray-800">
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
                <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                <div className="font-medium text-gray-800">
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
              <div className="text-sm text-gray-500 mb-1">Delivery Method</div>
              <div className="font-medium text-gray-800">Standard Delivery</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">
                Estimated Delivery
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Order Date</div>
                <div className="font-medium text-gray-800">
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
              <div className="text-sm text-gray-500 mb-1">Actual Delivery</div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Order Date</div>
                <div className="font-medium text-gray-800">
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
              <div className="text-sm text-gray-500 mb-2">Order Notes</div>
              <div className="text-sm text-gray-700">
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
