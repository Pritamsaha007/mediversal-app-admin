import {
  EnumItem,
  GetHospitalsParams,
  GetHospitalsResponse,
  HospitalFormData,
} from "../types";

const HOMECARE_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;

export async function getHospitals(
  params: GetHospitalsParams = {},
  token: string
): Promise<GetHospitalsResponse> {
  const {
    search_text = null,
    filter_department = null,
    filter_operating_hrs_start_time = null,
    filter_operating_hrs_end_time = null,
    sort_by = "name",
    sort_order = "DESC",
  } = params;

  const body = {
    search_text,
    filter_department,
    filter_operating_hrs_start_time,
    filter_operating_hrs_end_time,
    sort_by,
    sort_order,
  };

  console.log("Fetching hospitals with params:", body);

  const response = await fetch(`${HOMECARE_API_BASE_URL}/api/clinic/search`, {
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
  console.log("Hospitals API response:", responseData);
  return responseData;
}

export async function getEnumValues(
  code: string,
  token: string
): Promise<EnumItem[]> {
  const body = {
    id: null,
    slno: null,
    code: code,
    value: null,
    description: null,
    metadata: null,
  };

  const response = await fetch(`${HOMECARE_API_BASE_URL}/api/lookup/enums`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch enum values for ${code}`);
  }

  const data = await response.json();
  return data.roles || [];
}

export async function addOrUpdateHospital(
  hospitalData: HospitalFormData,
  token: string
): Promise<any> {
  console.log(
    "Sending hospital data payload:",
    JSON.stringify(hospitalData, null, 2)
  );

  const response = await fetch(`${HOMECARE_API_BASE_URL}/api/clinic`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(hospitalData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("API Error Response:", errorData);
    throw new Error(
      errorData?.message ||
        `Failed to ${hospitalData.id ? "update" : "add"} hospital`
    );
  }

  const responseData = await response.json();
  console.log("API Success Response:", responseData);
  return responseData;
}

export async function deleteHospital(
  hospitalId: string,
  token: string
): Promise<any> {
  const response = await fetch(
    `${HOMECARE_API_BASE_URL}/api/clinic/${hospitalId}`,
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
    throw new Error(errorData?.message || "Failed to delete hospital");
  }

  return await response.json();
}
