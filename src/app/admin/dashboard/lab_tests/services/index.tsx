import { EnumCodes, fetchEnums } from "@/app/service/enumService";
import {
  AvailableSlotsResponse,
  BookingDetailsResponse,
  SearchLabTestBookingsPayload,
  SearchLabTestBookingsResponse,
  UpdateLabTestBookingPayload,
  UpdateLabTestBookingResponse,
} from "../bookings/type";
import {
  CreateHealthPackagePayload,
  HealthPackage,
  SearchHealthPackagesPayload,
  statics,
  UpdateHealthPackagePayload,
} from "../health_package/types";
import {
  CreatePathologyTestPayload,
  PathologyTest,
  UpdatePathologyTestPayload,
} from "../pathology_tests/types";
import {
  CreatePhlebotomistPayload,
  CreatePhlebotomistResponse,
  Phlebotomist,
  UpdatePhlebotomistPayload,
} from "../phlebotomists/type";
import {
  SearchLabTestReportsPayload,
  SearchLabTestReportsResponse,
} from "../reports/types";

const LAB_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;

export interface CreateTestResponse {
  success: boolean;
  labTestId: string;
}

export async function createPathologyTest(
  payload: CreatePathologyTestPayload,
  token: string
): Promise<CreateTestResponse> {
  const response = await fetch(`${LAB_API_BASE_URL}/api/labtest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

export async function updatePathologyTest(
  payload: UpdatePathologyTestPayload,
  token: string
): Promise<CreateTestResponse> {
  const response = await fetch(`${LAB_API_BASE_URL}/api/labtest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

export async function deletePathologyTest(
  testId: string,
  token: string
): Promise<CreateTestResponse> {
  const deletePayload = {
    id: testId,
    is_deleted: true,
    name: "",
    description: "",
    code: "",
    category_id: "",
    sample_type_ids: [] as string[],
    test_params: [] as string[],
    report_time_hrs: 0,
    cost_price: 0,
    selling_price: 0,
    preparation_instructions: [] as string[],
    precautions: [] as string[],
    is_fasting_reqd: false,
    in_person_visit_reqd: false,
    is_featured_lab_test: false,
    is_home_collection_available: false,
    is_active: false,
    image_url: "",
    modality_type_id: "",
    inspection_parts_ids: [] as string[],
    related_lab_test_ids: [] as string[],
  };

  return await updatePathologyTest(
    deletePayload as UpdatePathologyTestPayload,
    token
  );
}
export const fetchBodyParts = (token: string) =>
  fetchEnums(EnumCodes.LAB_TEST_BODY_PARTS, token);

export const fetchSampleTypes = (token: string) =>
  fetchEnums(EnumCodes.LAB_TEST_SAMPLE, token);

export const fetchCategories = (token: string) =>
  fetchEnums(EnumCodes.LAB_TEST_CATEGORY, token);

export const fetchModalities = (token: string) =>
  fetchEnums(EnumCodes.LAB_TEST_MODALITY, token);
export const fetchDays = (token: string) =>
  fetchEnums(EnumCodes.DAYS_IN_WEEK, token);
export const fetchPhleboSpecializations = (token: string) =>
  fetchEnums(EnumCodes.PHLEBO_SPECIALIZATION, token);
export const fetchServiceCities = (token: string) =>
  fetchEnums(EnumCodes.SERVICE_CITY, token);
export const fetchServiceAreas = (token: string) =>
  fetchEnums(EnumCodes.SERVICE_AREA, token);

export interface SearchLabTestsPayload {
  start: number | null;
  max: number | null;
  search_category: string | null;
  search: string | null;
  filter_sample_type_ids: string[] | null;
  filter_active: boolean | null;
  filter_featured: boolean | null;
  sort_by: string;
  sort_order: "ASC" | "DESC";
}
export interface SearchLabTestsResponse {
  success: boolean;
  labTests: PathologyTest[];
}

export async function searchPathologyTests(
  payload: SearchLabTestsPayload,
  token: string
): Promise<SearchLabTestsResponse> {
  const response = await fetch(`${LAB_API_BASE_URL}/api/labtest/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

export interface SearchHealthPackagesResponse {
  success: boolean;
  healthpackages: HealthPackage[];
  statics: statics;
}

export async function searchHeathPackages(
  payload: SearchHealthPackagesPayload,
  token: string
): Promise<SearchHealthPackagesResponse> {
  const response = await fetch(
    `${LAB_API_BASE_URL}/api/labtest/healthpackage/search`,
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
export interface UploadRequest {
  bucketName: string;
  folderPath: string;
  fileName: string;
  fileContent: string;
}

export interface UploadResponse {
  success: boolean;
  result: string;
}

export async function uploadFile(
  token: string,
  requestData: UploadRequest
): Promise<UploadResponse> {
  try {
    const response = await fetch(`${LAB_API_BASE_URL}/api/misc/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error uploading file:", error);
    throw new Error(error.message || "Failed to upload file");
  }
}

export interface CreateHealthPackageResponse {
  success: boolean;
  healthPackageId: string;
}
export async function createHealthPackage(
  payload: CreateHealthPackagePayload,
  token: string
): Promise<CreateHealthPackageResponse> {
  const response = await fetch(
    `${LAB_API_BASE_URL}/api/labtest/healthpackage`,
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

export async function updateHealthPackage(
  payload: UpdateHealthPackagePayload,
  token: string
): Promise<CreateHealthPackageResponse> {
  const response = await fetch(
    `${LAB_API_BASE_URL}/api/labtest/healthpackage`,
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

export async function deleteHealthPackage(
  packageId: string,
  token: string
): Promise<CreateHealthPackageResponse> {
  const deletePayload = {
    id: packageId,
    is_deleted: true,
    name: "",
    description: "",
    image_url: "",
    linked_test_ids: [] as string[],
    cost_price: 0,
    selling_price: 0,
    prepare_instructions: [] as string[],
    is_active: false,
    is_popular: false,
    related_health_package_ids: [] as string[],
    is_fasting_reqd: false,
    in_person_visit_reqd: false,
    is_home_collection_available: false,
  };

  return await updateHealthPackage(
    deletePayload as UpdateHealthPackagePayload,
    token
  );
}
export async function createPhlebotomist(
  payload: CreatePhlebotomistPayload,
  token: string
): Promise<CreatePhlebotomistResponse> {
  const response = await fetch(`${LAB_API_BASE_URL}/api/labtest/phlebotomist`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

export async function updatePhlebotomist(
  payload: UpdatePhlebotomistPayload,
  token: string
): Promise<CreatePhlebotomistResponse> {
  const response = await fetch(`${LAB_API_BASE_URL}/api/labtest/phlebotomist`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}
export async function deletePhlebotomist(
  phlebotomistId: string,
  token: string
): Promise<CreatePhlebotomistResponse> {
  const deletePayload = {
    id: phlebotomistId,
    is_deleted: true,
    name: "",
    mobile_number: "",
    email: "",
    service_city: "",
    service_area: "",
    specialization_id: "",
    license_no: "",
    joining_date: "",
    is_home_collection_certified: false,
    is_available: false,
    availability: [],
  };

  return await updatePhlebotomist(
    deletePayload as UpdatePhlebotomistPayload,
    token
  );
}
export interface SearchPhlebotomistsPayload {
  start: number;
  max: number;
  search_text?: string | null;
  filter_specialization?: string | null;
  filter_service_city?: string | null;
  filter_is_available?: boolean | null;
  filter_is_home_collection_certified?: boolean | null;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export interface PhlebotomistStatics {
  total_phlebotomists: number;
  active_phlebotomists: number;
  inactive_phlebotomists: number;
  home_collection_certified: number;
  average_experience_yrs: number;
}

export interface SearchPhlebotomistsResponse {
  success: boolean;
  phlebotomists: Phlebotomist[];
  statics: PhlebotomistStatics;
}

export async function searchPhlebotomists(
  payload: SearchPhlebotomistsPayload,
  token: string
): Promise<SearchPhlebotomistsResponse> {
  const response = await fetch(
    `${LAB_API_BASE_URL}/api/labtest/phlebotomist/search`,
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

export async function searchLabTestBookings(
  payload: SearchLabTestBookingsPayload,
  token: string
): Promise<SearchLabTestBookingsResponse> {
  const response = await fetch(
    `${LAB_API_BASE_URL}/api/labtest/booking/search`,
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

export async function updateLabTestBooking(
  payload: UpdateLabTestBookingPayload,
  token: string
): Promise<UpdateLabTestBookingResponse> {
  const response = await fetch(`${LAB_API_BASE_URL}/api/labtest/bookings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

export interface AvailableSlotsPayload {
  search_text: string | null;
  city_id: string | null;
  area_id: string | null;
  date: string;
}

export async function fetchAvailableSlots(
  payload: AvailableSlotsPayload,
  token: string
): Promise<AvailableSlotsResponse> {
  const response = await fetch(
    `${LAB_API_BASE_URL}/api/labtest/phlebotomist/available-slots`,
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

export async function getBookingById(
  bookingID: string,
  token: string
): Promise<BookingDetailsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL}/api/labtest/booking/${bookingID}`,
    {
      method: "GET",
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
export async function searchLabTestReports(
  payload: SearchLabTestReportsPayload,
  token: string
): Promise<SearchLabTestReportsResponse> {
  const response = await fetch(
    `${LAB_API_BASE_URL}/api/labtest/report/search`,
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
