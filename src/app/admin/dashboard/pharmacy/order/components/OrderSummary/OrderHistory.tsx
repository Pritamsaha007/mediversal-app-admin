import React, { useState, useEffect } from "react";
import { Timeline, TimelineEvent } from "react-event-timeline";
import { Order } from "../../types/types";
import { trackOrders } from "../../services/orderServices";

interface TrackScan {
  scan: string;
  scan_datetime: string;
  scan_location?: string;
  rapidshyp_status_code?: string;
}

interface OrderHistoryProps {
  order: Order;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ order }) => {
  const [trackingData, setTrackingData] = useState<TrackScan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!order.rapidshypAwb) {
          throw new Error("Tracking number (AWB) is required");
        }

        const data = await trackOrders(
          Number(order.orderId),
          order.rapidshypAwb
        );

        if (data?.records?.[0]?.shipment_details?.[0]?.track_scans) {
          setTrackingData(data.records[0].shipment_details[0].track_scans);
        } else {
          throw new Error("No tracking information available");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load tracking details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingDetails();
  }, [order]);

  const parseCustomDate = (dateString: string) => {
    const parts = dateString.split(" ");
    const dateParts = parts[0].split("-");
    const timeParts = parts[1].split(":");

    return new Date(
      parseInt(dateParts[2]), // year
      parseInt(dateParts[1]) - 1, // month
      parseInt(dateParts[0]), // day
      parseInt(timeParts[0]), // hours
      parseInt(timeParts[1]), // minutes
      parseInt(timeParts[2]) // seconds
    );
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4 h-80">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-3 h-3 rounded-full bg-gray-200 mt-1"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error(error);
    return (
      <div className="bg-white p-4 rounded-lg border h-80 border-gray-300 flex flex-col items-center justify-center">
        <p className="text-xs text-gray-600">Order cancelled</p>
      </div>
    );
  }

  if (trackingData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No tracking history available
      </div>
    );
  }

  return (
    <div className="h-80">
      <div className="bg-white p-4 rounded-lg border border-gray-300">
        <h2 className="text-sm text-black mb-4">Order Timeline</h2>

        <Timeline>
          {trackingData.map((scan, index) => {
            let date: Date;
            try {
              date = parseCustomDate(scan.scan_datetime);
              if (isNaN(date.getTime())) {
                throw new Error("Invalid date");
              }
            } catch (err) {
              console.error("Invalid date format:", scan.scan_datetime);
              date = new Date();
            }

            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            const formattedTime = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <TimelineEvent
                key={index}
                title={
                  <span className="text-gray-900 font-medium">{scan.scan}</span>
                }
                createdAt={
                  <span className="text-gray-700">{`${formattedDate}, ${formattedTime}`}</span>
                }
                icon={<i className="fas fa-circle" />}
                iconColor="#80C1D8"
                contentStyle={{
                  background: "white",
                  boxShadow: "none",
                  color: "#111827",
                }}
              >
                <div className="space-y-1 mt-1">
                  {scan.scan_location && (
                    <div className="text-sm text-gray-800">
                      <span className="font-semibold">Location:</span>{" "}
                      {scan.scan_location}
                    </div>
                  )}
                </div>
              </TimelineEvent>
            );
          })}
        </Timeline>
      </div>
    </div>
  );
};

export default OrderHistory;
