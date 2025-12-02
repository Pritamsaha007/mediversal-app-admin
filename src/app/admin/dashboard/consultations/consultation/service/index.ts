import {
  CreateConsultationRequest,
  DoctorSearchResponse,
  EnumResponse,
  GetConsultationsParams,
  GetConsultationsResponse,
  HospitalSearchResponse,
  RTCTokenResponse,
} from "../types";

const HOMECARE_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;
const API_TIMEOUT = 10000;

const createFetchWithTimeout = (timeout: number) => {
  return (url: string, options: RequestInit) => {
    return Promise.race([
      fetch(url, options),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeout)
      ),
    ]);
  };
};
const fetchWithTimeout = createFetchWithTimeout(API_TIMEOUT);

export async function getConsultations(
  params: GetConsultationsParams = {},
  token: string
): Promise<GetConsultationsResponse> {
  const url = new URL(`${HOMECARE_API_BASE_URL}/api/clinic/consultations`);

  if (params.start !== undefined) {
    url.searchParams.append("start", params.start.toString());
  }
  if (params.max !== undefined) {
    url.searchParams.append("max", params.max.toString());
  }

  console.log(params, "params");
  const body = {
    customer_id: params.customer_id || null,
    search_text: params.search_text || null,
    is_online_consultation: params.is_online_consultation || null,
    filter_status: params.filter_status || null,
  };

  console.log("Fetching consultations with body:", body);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  const responseData = await response.json();
  console.log("Consultations API response:", responseData);
  return responseData;
}

export async function createOrUpdateConsultation(
  consultationData: CreateConsultationRequest,
  token: string
): Promise<{ success: boolean; message?: string }> {
  const url = new URL(`${HOMECARE_API_BASE_URL}/api/clinic/consultation`);

  console.log("Creating/Updating consultation with data:", consultationData);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(consultationData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  const responseData = await response.json();
  console.log("Create/Update consultation API response:", responseData);
  return responseData;
}

export async function searchHospitals(
  searchText: string | null,
  token: string
): Promise<HospitalSearchResponse> {
  const url = new URL(`${HOMECARE_API_BASE_URL}/api/clinic/search`);

  const body = {
    search_text: searchText,
  };

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

export async function searchDoctors(
  searchText: string | null,
  token: string
): Promise<DoctorSearchResponse> {
  const url = new URL(`${HOMECARE_API_BASE_URL}/api/clinic/doctors/search`);

  const body = {
    search_text: searchText,
  };

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

export async function getEnumData(
  code: string,
  token: string
): Promise<EnumResponse> {
  const url = new URL(`${HOMECARE_API_BASE_URL}/api/lookup/enums`);

  const body = {
    code: code,
  };

  console.log("Fetching enum data for code:", code);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  const responseData: EnumResponse = await response.json();
  console.log("Enum API response for", code, ":", responseData);
  return responseData;
}

export async function getConsultationEnumData(token: string) {
  try {
    const [paymentModes, paymentStatuses, languages] = await Promise.all([
      getEnumData("PAYMENT_MODE", token),
      getEnumData("PAYMENT_STATUS", token),
      getEnumData("INDIAN_LANGUAGE", token),
    ]);

    return {
      paymentModes: paymentModes.roles || [],
      paymentStatuses: paymentStatuses.roles || [],
      languages: languages.roles || [],
    };
  } catch (error) {
    console.error("Error fetching consultation enum data:", error);
    throw error;
  }
}
export async function getRTCToken(
  consultationId: string,
  token: string
): Promise<RTCTokenResponse> {
  const channelId = consultationId.substring(0, 6).toUpperCase();
  const url = new URL(
    `${HOMECARE_API_BASE_URL}/api/clinic/consultation/rtc-token/${channelId}`
  );

  console.log("Fetching RTC token for channel:", channelId);

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
  console.log("RTC Token API response:", responseData);
  return responseData;
}

export const updateConsultationStatus = async (
  order_id: string,
  customer_id: string | null,
  status: string,

  token: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${HOMECARE_API_BASE_URL}/api/clinic/consultation/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: order_id,
          customer_id: customer_id,
          status: status,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update consultation status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating consultation status:", error);
    throw error;
  }
};

export async function getChatToken(
  consultationId: string,
  token: string
): Promise<{
  success: boolean;
  data: { userId: string; chatToken: string; expireIn: number };
}> {
  // Use consultationId directly as userId or extract it based on your logic
  const userId = consultationId; // Adjust this based on your actual userId logic

  const url = new URL(
    `${HOMECARE_API_BASE_URL}/api/clinic/consultation/chat-token/${userId}`
  );

  console.log("Fetching chat token for user:", userId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Chat token error:", errorData);
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  const responseData = await response.json();
  console.log("Chat Token API response:", responseData);
  return responseData;
}
