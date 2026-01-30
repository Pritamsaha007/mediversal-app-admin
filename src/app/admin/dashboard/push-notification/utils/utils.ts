import { Notification, CustomScheduleDay } from "../types/types";

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (timeString: string): string => {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "LIVE":
      return "bg-[#34C759] text-white";
    case "SCHEDULED":
      return "bg-[#FF9500] text-white";
    case "COMPLETED":
      return "bg-[#2F80ED] text-white";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getUserGroupColor = (userGroup: string): string => {
  switch (userGroup) {
    case "ALL_USERS":
      return "border-[#FF6B6B] text-[#FF6B6B]";
    case "ACTIVE_USERS":
      return "border-[#0088B1] text-[#0088B1]";
    case "INACTIVE_USERS":
      return "border-[#F59E0B] text-[#F59E0B]";
    case "NEW_USERS":
      return "border-[#9B51E0] text-[#9B51E0]";
    case "PREMIUM_USERS":
      return "border-[#34C759] text-[#34C759]";
    default:
      return "border-gray-400 text-gray-400";
  }
};

export const formatUserGroup = (userGroup?: string | null): string => {
  if (!userGroup) return "Single Users";

  return userGroup
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const parseCustomSchedule = (
  customSchedule: CustomScheduleDay[] | null,
): { day: string; times: string[] }[] => {
  if (!customSchedule || !Array.isArray(customSchedule)) return [];

  return customSchedule.map((scheduleItem) => {
    const [day, times] = Object.entries(scheduleItem)[0];
    return { day, times };
  });
};

export const formatScheduledDays = (
  notification: Notification,
): { day: string; time: string }[] => {
  const result: { day: string; time: string }[] = [];

  if (notification.custom_schedule && notification.custom_schedule.length > 0) {
    const parsed = parseCustomSchedule(notification.custom_schedule);
    parsed.forEach((schedule) => {
      schedule.times.forEach((time) => {
        result.push({
          day: schedule.day.substring(0, 3),
          time: formatTime(time + ":00"),
        });
      });
    });
  } else if (
    notification.days_selected &&
    notification.days_selected.length > 0
  ) {
    notification.days_selected.forEach((day: any) => {
      const dayValue = typeof day === "string" ? day : day.value;
      result.push({
        day: dayValue.substring(0, 3),
        time: formatTime(notification.notification_time),
      });
    });
  }

  return result;
};
