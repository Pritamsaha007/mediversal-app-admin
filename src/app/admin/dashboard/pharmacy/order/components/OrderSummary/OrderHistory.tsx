import React, { useState, useEffect } from "react";
import { Timeline, TimelineEvent } from "react-event-timeline";
import { Order } from "../../types/types";
import { getTracking } from "../../services"; // Import the new API

interface ShipmentTrackActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
  "sr-status": string | number;
  "sr-status-label": string;
}

interface TrackingResponse {
  tracking_data: {
    track_status: number;
    shipment_status: number;
    shipment_track: any[];
    shipment_track_activities: ShipmentTrackActivity[];
    track_url: string;
    etd: string;
    qc_response: string;
    is_return: boolean;
    order_tag: string;
  };
}

interface OrderHistoryProps {
  order: Order;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ order }) => {
  const [trackingData, setTrackingData] = useState<ShipmentTrackActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!order.Awb) {
          throw new Error("Tracking number (AWB) is required");
        }

        // Use the new ShipRocket API
        const data: TrackingResponse = await getTracking(order.Awb);

        if (data?.tracking_data?.shipment_track_activities) {
          // Sort activities by date (newest first) for timeline
          const sortedActivities = [
            ...data.tracking_data.shipment_track_activities,
          ].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          setTrackingData(sortedActivities);
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return { formattedDate, formattedTime };
    } catch (err) {
      console.error("Invalid date format:", dateString);
      return {
        formattedDate: "Invalid Date",
        formattedTime: "Invalid Time",
      };
    }
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

  if (order.deliverystatus == "Order cancelled successfully.") {
    console.error(error);
    return (
      <div className="bg-white p-4 rounded-lg border h-80 border-gray-300 flex flex-col items-center justify-center">
        <p className="text-xs text-gray-600">Order Cancelled</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg border h-80 border-gray-300 flex flex-col items-center justify-center">
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  if (trackingData.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg border h-80 border-gray-300 flex flex-col items-center justify-center">
        <p className="text-xs text-gray-600">No tracking history available</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <div className="bg-white p-4 rounded-lg border border-gray-300">
        <h2 className="text-sm text-black mb-4">Order Timeline</h2>

        <Timeline>
          {trackingData.map((activity, index) => {
            const { formattedDate, formattedTime } = formatDate(activity.date);

            return (
              <TimelineEvent
                key={index}
                title={
                  <span className="text-gray-900 font-medium">
                    {activity["sr-status-label"] ||
                      activity.activity ||
                      activity.status}
                  </span>
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
                  {activity.location && (
                    <div className="text-sm text-gray-800">
                      <span className="font-semibold">Location:</span>{" "}
                      {activity.location}
                    </div>
                  )}
                  {activity.status && activity.status !== activity.activity && (
                    <div className="text-sm text-gray-800">
                      <span className="font-semibold">Status:</span>{" "}
                      {activity.status}
                    </div>
                  )}
                  {activity.activity && (
                    <div className="text-sm text-gray-800">
                      <span className="font-semibold">Activity:</span>{" "}
                      {activity.activity}
                    </div>
                  )}
                  {activity["sr-status"] && (
                    <div className="text-sm text-gray-800">
                      <span className="font-semibold">SR Status:</span>{" "}
                      {activity["sr-status"]}
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
