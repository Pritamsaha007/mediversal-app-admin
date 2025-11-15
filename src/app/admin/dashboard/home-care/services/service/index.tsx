import {
  CreateUpdateOfferingPayload,
  CreateUpdateServicePayload,
  GetOfferingsParams,
  GetOfferingsResponse,
  GetServicesParams,
  GetServicesResponse,
  HomecareService,
} from "../types";

const HOMECARE_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;

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

export async function getDurationTypes(token: string): Promise<{
  success: boolean;
  roles: Array<{
    id: string;
    value: string;
    code: string;
    slno: number;
  }>;
}> {
  const response = await fetch(`${HOMECARE_API_BASE_URL}/api/lookup/enums`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: null,
      code: "DURATION_TYPE",
      value: null,
      sort_by: null,
      sort_order: null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

export async function createOrUpdateOffering(
  payload: CreateUpdateOfferingPayload,
  token: string
): Promise<{ success: boolean; offering?: any; message?: string }> {
  const response = await fetch(
    `${HOMECARE_API_BASE_URL}/api/homecare/offerings`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

export async function getHomecareOfferings(
  params: GetOfferingsParams = {},
  token: string
): Promise<GetOfferingsResponse> {
  const { status = null, service_id = null, offering_name = null } = params;

  const url = new URL(`${HOMECARE_API_BASE_URL}/api/homecare/offerings`);
  url.searchParams.append("status", status?.toString() || "null");
  url.searchParams.append("service_id", service_id?.toString() || "null");
  url.searchParams.append("offering_name", offering_name?.toString() || "null");

  console.log("Fetching offerings from:", url.toString());

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

  const responseData = await response.json();
  console.log("Offerings API response:", responseData);
  return responseData;
}

export async function deleteHomecareOffering(
  offeringId: string,
  token: string
): Promise<{ success: boolean; message?: string }> {
  console.log("Deleting offering with ID:", offeringId);

  const response = await fetch(
    `${HOMECARE_API_BASE_URL}/api/homecare/offerings/${offeringId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("Delete offering response status:", response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Delete offering error:", errorData);
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  const responseData = await response.json();
  console.log("Delete offering success response:", responseData);
  return responseData;
}
