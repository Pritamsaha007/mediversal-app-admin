export const getCurrentDateTime = () => {
  const now = new Date();
  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return { date, time };
};
export const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return "";

  const date = new Date(dateTime.replace(" ", "T")); // important fix

  const day = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day}, ${time}`;
};
export const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return "";

  try {
    const dateOnly = dateString.split(" ")[0].split("T")[0];

    const date = new Date(dateOnly);
    if (isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};
