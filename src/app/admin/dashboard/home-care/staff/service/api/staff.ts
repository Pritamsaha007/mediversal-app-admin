import { useAdminStore } from "@/app/store/adminStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;

export interface ApiStaff {
  id: string;
  name: string;
  mobile_number: string;
  role_name: string;
  email: string;
  experience_in_yrs: number;
  experience_in_months: number;
  experience_in_days: number;
  specializations: string[];
  certifications: string[];
  rating: string;
  profile_image_url: string;
  availability_status: string;
}

export interface StaffApiResponse {
  success: boolean;
  staffs: ApiStaff[];
}

export const fetchStaff = async (
  search?: string,
  start?: number,
  max?: number
): Promise<StaffApiResponse> => {
  const { token, refreshTokenIfNeeded } = useAdminStore.getState();

  await refreshTokenIfNeeded();

  const updatedToken = useAdminStore.getState().token;

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (start !== undefined) params.append("start", start.toString());
  if (max !== undefined) params.append("max", max.toString());

  const response = await fetch(
    `${API_BASE_URL}/api/homecare/staff?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${updatedToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch staff");
  }

  return response.json();
};

export const deleteStaff = async (
  staffId: string
): Promise<{ success: boolean }> => {
  const { token, refreshTokenIfNeeded } = useAdminStore.getState();

  await refreshTokenIfNeeded();

  const updatedToken = useAdminStore.getState().token;

  const response = await fetch(
    `${API_BASE_URL}/api/homecare/staff/${staffId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${updatedToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete staff");
  }

  return response.json();
};

export interface CreateUpdateStaffPayload {
  id?: string;
  name: string;
  mobile_number: string;
  role: string;
  email: string;
  experience_in_yrs: number;
  experience_in_months: number;
  experience_in_days: number;
  specializations: string[];
  certifications: string[];
  rating: number;
  profile_image_url?: string;
}

export const createUpdateStaff = async (
  staffData: CreateUpdateStaffPayload
): Promise<{ success: boolean }> => {
  const { token, refreshTokenIfNeeded } = useAdminStore.getState();

  await refreshTokenIfNeeded();
  const updatedToken = useAdminStore.getState().token;

  console.log("API Request Payload:", staffData);

  console.log("Sending API Payload:", JSON.stringify(staffData, null, 2));

  const response = await fetch(`${API_BASE_URL}/api/homecare/staff`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${updatedToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(staffData),
  });

  console.log("API Response Status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    throw new Error(`Failed to ${staffData.id ? "update" : "create"} staff`);
  }

  const json = await response.json();
  console.log("API Success Response:", json);
  return json;
};
export interface Role {
  id: string;
  role_name: string;
}
