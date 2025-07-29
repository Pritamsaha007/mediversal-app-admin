import React, { useState, useEffect } from "react";
import { Order } from "../../types/types";
import { trackOrders } from "../../services/orderServices";

interface OrderHistoryProps {
  order: Order;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ order }) => {
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!order.rapidshypAwb) return;

      setLoading(true);
      try {
        const data = await trackOrders(
          Number(order.orderId),
          order.rapidshypAwb
        );
        setTrackingData(data);
      } catch (err) {
        setError("Order Cancelled");
        console.log("Tracking error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [order.orderId, order.rapidshypAwb]);

  if (loading)
    return <div className="p-4 text-center">Loading tracking data...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!trackingData?.scans || trackingData.scans.length === 0) {
    return <div className="p-4 text-center">No tracking data available</div>;
  }

  return (
    <div className="h-80 p-4 overflow-y-auto">
      <h3 className="text-lg font-medium text-gray-700 mb-4 sticky top-0 bg-white py-2">
        Complete Shipping History
      </h3>

      {/* Vertical Timeline */}
      <div className="relative border-l-2 border-gray-200 pl-6 space-y-6">
        {trackingData.scans.map((scan: any, index: number) => {
          // Determine status color
          let statusColor = "bg-blue-500";
          if (scan.scan.includes("Delivered")) statusColor = "bg-green-500";
          if (scan.scan.includes("CANCELED")) statusColor = "bg-red-500";
          if (scan.scan.includes("Return")) statusColor = "bg-purple-500";

          return (
            <div key={index} className="relative">
              {/* Timeline dot */}
              <div
                className={`absolute -left-2.5 top-1 w-4 h-4 rounded-full border-2 border-white ${statusColor}`}
              ></div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800">{scan.scan}</h4>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                    {new Date(scan.scan_date_time).toLocaleString()}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {scan.location && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span>{" "}
                      {scan.location}
                    </p>
                  )}
                  {scan.remarks && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Details:</span>{" "}
                      {scan.remarks}
                    </p>
                  )}
                  {scan.status_code && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status Code:</span>{" "}
                      {scan.status_code}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
