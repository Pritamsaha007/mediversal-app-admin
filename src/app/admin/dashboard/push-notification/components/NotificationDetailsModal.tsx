"use client";
import React from "react";
import { X } from "lucide-react";
import { Notification } from "../types/types";
import {
  formatDate,
  formatTime,
  getStatusColor,
  getUserGroupColor,
  formatUserGroup,
} from "../utils/utils";

interface NotificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
}

const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  isOpen,
  onClose,
  notification,
}) => {
  if (!isOpen || !notification) return null;

  const renderScheduledDays = () => {
    if (notification.frequency_value === "ONCE") {
      return (
        <div className="text-[12px] text-[#161D1F]">
          Once: {formatTime(notification.notification_time)}
        </div>
      );
    }

    if (
      notification.custom_schedule &&
      notification.custom_schedule.length > 0
    ) {
      return (
        <div className="flex flex-wrap gap-2">
          {notification.custom_schedule.map((scheduleItem, idx) =>
            Object.entries(scheduleItem).map(([dayId, times]) => {
              const day = notification.days_selected?.find(
                (d) => d.id === dayId
              );
              return times.map((time, timeIdx) => (
                <span
                  key={`${idx}-${dayId}-${timeIdx}`}
                  className="text-[12px] bg-[#E8F4F7] text-[#161D1F] px-3 py-1.5 rounded"
                >
                  {day?.value.substring(0, 3)}: {formatTime(time)}
                </span>
              ));
            })
          )}
        </div>
      );
    }

    if (notification.days_selected && notification.days_selected.length > 0) {
      return (
        <div className="flex flex-wrap gap-2">
          {notification.days_selected.map((day) => (
            <span
              key={day.id}
              className="text-[12px] bg-[#E8F4F7] text-[#161D1F] px-3 py-1.5 rounded"
            >
              {day.value.substring(0, 3)}:{" "}
              {formatTime(notification.notification_time)}
            </span>
          ))}
        </div>
      );
    }

    return <div className="text-[12px] text-[#899193]">No schedule set</div>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#161D1F]">
            Push Notification Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-[14px] font-semibold text-[#161D1F] mb-2">
              Title:{" "}
              <span className="font-normal">{notification.message_title}</span>
            </h3>
            <div className="text-[12px] text-[#899193]">
              Notification ID: {notification.id}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="text-[12px] font-medium text-[#161D1F] mb-2">
              Tags:
            </div>
            <div className="flex gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded text-[12px] font-medium ${getStatusColor(
                  notification.status
                )}`}
              >
                {notification.status.charAt(0) +
                  notification.status.slice(1).toLowerCase()}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded text-[12px] font-medium border ${getUserGroupColor(
                  notification.targeted_user_group_value
                )}`}
              >
                {formatUserGroup(notification.targeted_user_group_value)}
              </span>
            </div>
          </div>

          {/* Message */}
          <div>
            <div className="text-[12px] font-medium text-[#161D1F] mb-2">
              Message
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-[12px] text-[#161D1F] border border-gray-200">
              {notification.message_body}
            </div>
          </div>

          {/* Time Range */}
          <div>
            <div className="text-[12px] font-medium text-[#161D1F] mb-2">
              Time Range
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex gap-8">
                <div>
                  <span className="text-[12px] text-green-600 font-medium">
                    Start:{" "}
                  </span>
                  <span className="text-[12px] text-[#161D1F]">
                    {formatDate(notification.start_date)}
                  </span>
                </div>
                {notification.end_date && (
                  <div>
                    <span className="text-[12px] text-red-600 font-medium">
                      End:{" "}
                    </span>
                    <span className="text-[12px] text-[#161D1F]">
                      {formatDate(notification.end_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scheduled Days */}
          <div>
            <div className="text-[12px] font-medium text-[#161D1F] mb-2">
              Scheduled Days
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {renderScheduledDays()}
            </div>
          </div>

          {/* Image */}
          {notification.image_url && (
            <div>
              <div className="text-[12px] font-medium text-[#161D1F] mb-2">
                Image
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <img
                  src={notification.image_url}
                  alt="Notification"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            </div>
          )}

          {/* App URI (FIXED) */}
          {notification.app_uri && (
            <div>
              <div className="text-[12px] font-medium text-[#161D1F] mb-2">
                Feature URI
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <a
                  href={notification.app_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[#0088B1] hover:underline break-all"
                >
                  {notification.app_uri}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailsModal;
