const HOMECARE_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;

export interface HospitalAPI {
  id: string;
  name: string;
  description: string;
  display_pic: string;
  address_line1: string;
  address_line2: string;
  city: string;
  landmark: string;
  state: string;
  pincode: string;
  country: string;
  is_available_24_7: boolean;
  contact: string;
  email: string;
  website: string;
  departments: string[];
  operating_hours: {
    day: string;
    end_time: string;
    start_time: string;
  }[];
}

export interface GetHospitalsResponse {
  success?: boolean;
  hospitals: HospitalAPI[];
}

export interface GetHospitalsParams {
  search_text?: string | null;
  filter_department?: string[] | null;
  filter_operating_hrs_start_time?: string | null;
  filter_operating_hrs_end_time?: string | null;
  sort_by?: string;
  sort_order?: string;
}

export interface EnumItem {
  id: string;
  slno: number;
  code: string;
  value: string;
  description: string | null;
  metadata: string | null;
}

export interface HospitalFormData {
  id?: string;
  name: string;
  description: string;
  display_pic?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  landmark?: string;
  state_id: string;
  pincode: string;
  country: string;
  is_available_24_7: boolean;
  contact: string;
  email: string;
  website?: string;
  departments: string[];
  operating_hrs: {
    id?: string;
    day_id: string;
    start_time: string;
    end_time: string;
  }[];
}

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
