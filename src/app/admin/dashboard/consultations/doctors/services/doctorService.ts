const HOMECARE_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;

export interface Hospital {
  id: string;
  name: string;
}

export interface DoctorSlot {
  id?: string;
  day?: string;
  day_id: string;
  start_time: string;
  end_time: string;
  slot_capacity: number;
}

export interface DoctorAPI {
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
  hospital: Hospital[];
  is_available_online: boolean;
  is_available_in_person: boolean;
  is_available: boolean;
  mci: string;
  nmc: string;
  state_registration: string;
  rating: string;
  profile_image_url: string;
  doctor_slots: DoctorSlot[];
}

export interface GetDoctorsResponse {
  success?: boolean;
  doctors: DoctorAPI[];
}

export interface GetDoctorsParams {
  search?: string | null;
  specialization?: string[] | null;
  status?: string | null;
  online_available?: boolean | null;
  in_person_available?: boolean | null;
}

export interface CreateDoctorRequest {
  id?: string; // Only for updates
  name: string;
  mobile_number: string;
  specialization_id: string;
  department_id: string;
  experience_in_yrs: number;
  consultation_price: number;
  about: string;
  qualifications: string;
  languages_known: string[];
  hospitals_id: string[];
  is_available_online: boolean;
  is_available_in_person: boolean;
  mci: string;
  nmc: string;
  state_registration: string;
  profile_image_url: string | null;
  is_available: boolean;
  doctor_slots: DoctorSlot[];
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
  success?: boolean;
  roles: EnumItem[];
}

// Add this interface
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

// Add this function
export async function searchHospitals(
  searchText: string,
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

// Existing getDoctors function
export async function getDoctors(
  params: GetDoctorsParams = {},
  token: string
): Promise<GetDoctorsResponse> {
  const { search, specialization, status } = params;

  const url = new URL(`${HOMECARE_API_BASE_URL}/api/clinic/doctors/search`);

  const body: {
    filter_specializations?: string[] | null;
    search_text?: string | null;
    online_available?: boolean | null;
    in_person_available?: boolean | null;
    limit_count?: number | null;
    offset_count?: number | null;
  } = {};

  if (search) {
    body.search_text = search;
  }

  if (specialization) {
    body.filter_specializations = specialization;
  }

  if (status) {
    if (status === "Online") {
      body.online_available = true;
    } else if (status === "In-Person") {
      body.in_person_available = true;
    } else if (status === "Both") {
      body.online_available = true;
      body.in_person_available = true;
    } else if (status === "Unavailable") {
      body.online_available = false;
      body.in_person_available = false;
    }
  }

  console.log("Fetching doctors with body:", body);

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
  console.log("Doctors API response:", responseData);
  return {
    ...responseData,
    doctors: Array.isArray(responseData.doctors) ? responseData.doctors : [],
  };
}

// New function to create or update doctor
export async function createOrUpdateDoctor(
  doctorData: CreateDoctorRequest,
  token: string
): Promise<{ success: boolean; message?: string }> {
  const url = new URL(`${HOMECARE_API_BASE_URL}/api/clinic/doctors`);

  console.log("Creating/Updating doctor with data:", doctorData);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doctorData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  const responseData = await response.json();
  console.log("Create/Update doctor API response:", responseData);
  return responseData;
}

// New function to get enum data
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

  const responseData = await response.json();
  console.log("Enum API response for", code, ":", responseData);
  return responseData;
}

// Helper function to get multiple enum data
export async function getAllEnumData(token: string) {
  try {
    const [departments, specializations, languages, days] = await Promise.all([
      getEnumData("DOC_DEPARTMENT", token),
      getEnumData("DOC_SPECIALIZATION", token),
      getEnumData("INDIAN_LANGUAGE", token),
      getEnumData("DAYS_IN_WEEK", token),
    ]);

    return {
      departments: departments.roles || [],
      specializations: specializations.roles || [],
      languages: languages.roles || [],
      days: days.roles || [],
    };
  } catch (error) {
    console.error("Error fetching enum data:", error);
    throw error;
  }
}

export async function deleteDoctor(
  doctorId: string,
  token: string
): Promise<{ success: boolean; message?: string }> {
  const url = new URL(
    `${HOMECARE_API_BASE_URL}/api/clinic/doctors/${doctorId}`
  );

  console.log("Deleting doctor with ID:", doctorId);

  const response = await fetch(url.toString(), {
    method: "DELETE",
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
  console.log("Delete doctor API response:", responseData);
  return responseData;
}
