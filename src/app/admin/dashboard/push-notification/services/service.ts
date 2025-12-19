import axios from "axios";
import {
  SearchNotificationParams,
  NotificationResponse,
  EnumResponse,
  CreateNotificationPayload,
  CustomerSearchResponse,
} from "../types/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const searchNotifications = async (
  params: SearchNotificationParams,
  token: string
): Promise<NotificationResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/notification/search`,
      params,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const getEnums = async (
  code: string,
  token: string
): Promise<EnumResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/lookup/enums`,
      { code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching enums:", error);
    throw error;
  }
};

export const searchCustomers = async (
  search: string,
  start: number,
  max: number,
  token: string
): Promise<CustomerSearchResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/customer/search`,
      { search, start, max },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching customers:", error);
    throw error;
  }
};

export const createNotification = async (
  payload: CreateNotificationPayload,
  token: string
): Promise<{ success: boolean }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/notification`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const uploadImage = async (
  file: File,
  token: string
): Promise<{ success: boolean; url: string }> => {
  try {
    const base64Content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const bucketName =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_PROD
        : process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_DEV;

    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `notification-${timestamp}.${fileExtension}`;

    const payload = {
      bucketName: bucketName,
      folderPath: "mediversal/notification",
      fileName: fileName,
      fileContent: base64Content,
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/misc/upload`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: response.data.success,
      url: response.data.result,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
