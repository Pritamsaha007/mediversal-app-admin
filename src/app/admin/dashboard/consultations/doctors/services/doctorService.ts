const HOMECARE_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;

export interface Hospital {
  id: string;
  name: string;
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
}

export interface GetDoctorsResponse {
  success?: boolean;
  doctors: DoctorAPI[];
}

export interface GetDoctorsParams {
  search?: string | null;
  specialization?: string | null;
  status?: string | null;
}

export async function getDoctors(
  params: GetDoctorsParams = {},
  token: string
): Promise<GetDoctorsResponse> {
  const { search = null, specialization = null, status = null } = params;

  const url = new URL(`${HOMECARE_API_BASE_URL}/api/clinic/doctors`);
  if (search) url.searchParams.append("search", search);
  if (specialization) url.searchParams.append("specialization", specialization);
  if (status) url.searchParams.append("status", status);

  console.log("Fetching doctors from:", url.toString());

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
  console.log("Doctors API response:", responseData);
  return responseData;
}
