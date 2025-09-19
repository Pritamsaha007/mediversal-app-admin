const HOMECARE_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;
const API_TIMEOUT = 10000;
export interface ConsultationAPI {
  id: string;
  consultation_date: string;
  consultation_time: string;
  session_duration_in_mins: number;
  patient_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  hospital_id: string;
  symptoms_desc: string;
  payment_mode: string;
  total_amount: string;
  service_fee_tax_amount: string;
  paid_amount: string;
  applied_coupons: string[];
  status: string;
  aadhar_id: string;
  consultation_language: string;
  is_deleted: boolean;
  created_date: string;
  updated_date: string;
  doc_id: string;
  doc_name: string;
  is_available_online: boolean | null;
  is_available_in_person: boolean | null;
  consultation_type: string;
  payment_status: string;
  customer_id: string | null;
  customer_name: string | null;
  total_doc_consultations: string;
  total_in_person_consultations: string;
  total_online_consultations: string;
}

export interface GetConsultationsResponse {
  success?: boolean;
  consultations: ConsultationAPI[];
}

export interface GetConsultationsParams {
  customer_id?: string | null;
  search_text?: string | null;
  is_online_consultation?: boolean | null;
  filter_status?: string | null;
}

export interface CreateConsultationRequest {
  id?: string; // Only for updates
  date: string;
  time: string;
  session_duration_in_mins: number;
  customer_id?: string | null;
  patient_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  hospital_id?: string;
  symptoms_desc: string;
  payment_mode: string;
  total_amount: number;
  service_fee_tax_amount: number;
  paid_amount: number;
  applied_coupons: string[] | null;
  status: string;
  aadhar_id?: string;
  consultation_language_id: string;
  staff_id: string;
}

export interface HospitalSearchResponse {
  success: boolean;
  hospitals: Array<{
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
    operating_hours: any[];
  }>;
}

export interface DoctorSearchResponse {
  success: boolean;
  doctors: Array<{
    id: string;
    name: string;
    mobile_number: string;
    role_name: string;
    experience_in_yrs: number;
    specializations: string;
    departments: string;
    consultation_price: string;
    about: string;
    qualifications: string;
    languages_known: string[];
    hospital: Array<{
      id: string;
      name: string;
    }>;
    is_available_online: boolean;
    is_available_in_person: boolean;
    is_available: boolean;
    mci: string;
    nmc: string;
    state_registration: string;
    rating: string;
    profile_image_url: string;
    doctor_slots: any[];
  }>;
}

export interface EnumItem {
  id: string;
  slno: number;
  code: string;
  value: string;
  description: string | null;
  metadata: any;
}

export interface EnumResponse {
  roles: EnumItem[];
}
export interface RTCTokenResponse {
  success: boolean;
  data: {
    token: string;
    channelName: string;
    expireAt: number;
  };
}

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

// Get consultations
export async function getConsultations(
  params: GetConsultationsParams = {},
  token: string
): Promise<GetConsultationsResponse> {
  const url = new URL(`${HOMECARE_API_BASE_URL}/api/clinic/consultations`);

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

// Create or update consultation
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

// Search hospitals
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

// Search doctors
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

// Get enum data
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

// Helper function to get multiple enum data for consultations
export async function getConsultationEnumData(token: string) {
  try {
    const [paymentModes, paymentStatuses, languages] = await Promise.all([
      getEnumData("PAYMENT_MODE", token),
      getEnumData("PAYMENT_STATUS", token),
      getEnumData("INDIAN_LANGUAGE", token),
    ]);

    return {
      paymentModes: paymentModes.roles || [], // Access the roles array
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
  // Extract first 6 digits from consultation ID
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
