const HOMECARE_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;

export interface HomecareService {
  id: string;
  name: string;
  description: string;
  display_pic_url: string;
  service_tags: string[];
  display_sections: string[];
  custom_medical_info: any;
  status: "Active" | "Inactive";
}

export interface GetServicesResponse {
  success: boolean;
  services: HomecareService[];
}

export interface GetServicesParams {
  status?: string | null;
  search?: string | null;
  start?: number | null;
  max?: number | null;
}

export async function getHomecareServices(
  params: GetServicesParams = {},
  token: string
): Promise<GetServicesResponse> {
  const { status = null, search = null, start = null, max = null } = params;

  const url = new URL(`${HOMECARE_API_BASE_URL}/api/homecare/`);
  url.searchParams.append("status", status?.toString() || "null");
  url.searchParams.append("search", search?.toString() || "null");
  url.searchParams.append("start", start?.toString() || "null");
  url.searchParams.append("max", max?.toString() || "null");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

export interface CreateUpdateServicePayload {
  id?: string;
  name: string;
  description: string;
  is_active: boolean;
  display_pic_url?: string;
  service_tags: string[];
  display_sections: string[];
  custom_medical_info?: any;
}

export async function createOrUpdateHomecareService(
  payload: CreateUpdateServicePayload,
  token: string
): Promise<{ success: boolean; service?: HomecareService; message?: string }> {
  console.log("Making API call to:", `${HOMECARE_API_BASE_URL}/api/homecare/`);
  console.log("With payload:", JSON.stringify(payload, null, 2));

  const response = await fetch(`${HOMECARE_API_BASE_URL}/api/homecare/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("Response status:", response.status);
  console.log(
    "Response headers:",
    Object.fromEntries(response.headers.entries())
  );

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      console.log("Error response data:", errorData);
    } catch (e) {
      console.log("Could not parse error response as JSON");
      const textError = await response.text();
      console.log("Error response text:", textError);
      errorData = { message: textError };
    }

    throw new Error(
      errorData?.message ||
        errorData?.error ||
        `HTTP error! status: ${response.status}`
    );
  }

  const responseData = await response.json();
  console.log("Success response:", responseData);
  return responseData;
}

export async function deleteHomecareService(
  serviceId: string,
  token: string
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(
    `${HOMECARE_API_BASE_URL}/api/homecare/${serviceId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}
