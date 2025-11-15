import {
  CreateDoctorRequest,
  EnumResponse,
  GetDoctorsParams,
  GetDoctorsResponse,
  HospitalSearchResponse,
} from "../types";

const HOMECARE_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;

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
