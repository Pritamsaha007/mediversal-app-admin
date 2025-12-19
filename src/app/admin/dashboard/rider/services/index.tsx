// Update your rider API service
import axios from "axios";
import {
  CreateRiderPayload,
  DeliveryRider,
  SearchRidersPayload,
  CreateRiderResponse,
  PincodeSearchPayload,
  Pincode,
  PincodeSearchResponse,
  RiderOverviewPayload,
  RiderOverviewResponse,
  UpdateRiderInfoPayload,
  UpdateRiderInfoResponse,
} from "../types";
import { EnumCodes, EnumResponse, fetchEnums } from "@/app/service/enumService";

const RIDER_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;

export const getRidersStats = (riders: DeliveryRider[]) => {
  const activeRiders = riders.filter(
    (r) => r.is_available_status === "active" && !r.is_deleted
  ).length;
  const verifiedRiders = riders.filter(
    (r) => r.is_poi_verified_status === "approved" && !r.is_deleted
  ).length;

  return {
    totalRiders: riders.filter((r) => !r.is_deleted).length,
    activeRiders,
    verifiedRiders,
  };
};

export const createRider = async (
  payload: CreateRiderPayload,
  token: string
): Promise<CreateRiderResponse> => {
  try {
    const response = await axios.post(
      `${RIDER_API_BASE_URL}/api/rider`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error creating rider:", error);
    throw new Error(error.response?.data?.message || "Failed to create rider");
  }
};

export const searchRider = async (
  payload: SearchRidersPayload,
  token: string
): Promise<DeliveryRider[]> => {
  try {
    const response = await axios.post(
      `${RIDER_API_BASE_URL}/api/rider/search`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      const riders = response.data.riders;
      return riders;
    }

    throw new Error("Failed to fetch riders");
  } catch (error: any) {
    console.error("Error searching riders:", error);
    throw new Error(error.response?.data?.message || "Failed to search riders");
  }
};

export const updateRider = async (
  payload: any,
  token: string
): Promise<CreateRiderResponse> => {
  try {
    const response = await axios.post(
      `${RIDER_API_BASE_URL}/api/rider`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating rider:", error);
    throw new Error(error.response?.data?.message || "Failed to update rider");
  }
};

export const deleteRider = async (
  riderId: string,
  token: string
): Promise<CreateRiderResponse> => {
  try {
    const payload = {
      id: riderId,
      is_deleted: true,
    };

    const response = await axios.post(
      `${RIDER_API_BASE_URL}/api/rider`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error deleting rider:", error);
    throw new Error(error.response?.data?.message || "Failed to delete rider");
  }
};

export const getRiderById = async (
  riderId: string,
  token: string
): Promise<DeliveryRider> => {
  try {
    const response = await axios.get(
      `${RIDER_API_BASE_URL}/api/rider/${riderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch rider details");
  } catch (error: any) {
    console.error("Error fetching rider:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch rider");
  }
};

export const fetchServiceCities = (token: string) =>
  fetchEnums(EnumCodes.SERVICE_CITY, token);

export const fetchVehicles = (token: string) =>
  fetchEnums(EnumCodes.DELIVERY_VEHICLE_TYPE, token);

export const fetchRiderStatus = (token: string) =>
  fetchEnums(EnumCodes.RIDER_DELIVERY_STATUS, token);
export const searchPincodes = async (
  payload: PincodeSearchPayload,
  token: string
): Promise<PincodeSearchResponse> => {
  try {
    const response = await axios.post(
      `${RIDER_API_BASE_URL}/api/lookup/pincode-search`,
      {
        search_city: payload.search_city || null,
        search_pincode: payload.search_pincode || null,
        start: payload.start || 0,
        max: payload.max || 50,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error("Failed to fetch pincodes");
  } catch (error: any) {
    console.error("Error searching pincodes:", error);
    throw new Error(
      error.response?.data?.message || "Failed to search pincodes"
    );
  }
};
export const getRiderOverview = async (
  payload: RiderOverviewPayload,
  token: string
): Promise<RiderOverviewResponse> => {
  try {
    const response = await axios.post(
      `${RIDER_API_BASE_URL}/api/rider/overview`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error fetching rider overview:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch rider overview"
    );
  }
};
export const updateOrderRiderInfo = async (
  payload: UpdateRiderInfoPayload,
  token: string
): Promise<UpdateRiderInfoResponse> => {
  try {
    const response = await axios.patch(
      `${RIDER_API_BASE_URL}/api/order/update-rider-info`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating rider info:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update rider information"
    );
  }
};

export const updateRiderPOI = async (
  riderId: string,
  isApproved: boolean,
  token: string
): Promise<CreateRiderResponse> => {
  try {
    const payload = {
      id: riderId,
      is_POI_verified: isApproved,
    };

    const response = await axios.post(
      `${RIDER_API_BASE_URL}/api/rider`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating rider POI status:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update rider POI status"
    );
  }
};
