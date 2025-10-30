import {
  CreateHealthPackagePayload,
  HealthPackage,
  SearchHealthPackagesPayload,
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
export interface EnumItem {
  id: string;
  slno: number;
  code: string;
  value: string;
  description: string | null;
  metadata: any | null;
}

export interface EnumResponse {
  success: boolean;
  roles: EnumItem[];
}

export enum EnumCodes {
  LAB_TEST_BODY_PARTS = "LAB_TEST_BODY_PARTS",
  LAB_TEST_SAMPLE = "LAB_TEST_SAMPLE",
  LAB_TEST_CATEGORY = "LAB_TEST_CATEGORY",
  LAB_TEST_MODALITY = "LAB_TEST_MODALITY",
  DAYS_IN_WEEK = "DAYS_IN_WEEK",
  PHLEBO_SPECIALIZATION = "PHLEBO_SPECIALIZATION",
  SERVICE_CITY = "SERVICE_CITY",
  SERVICE_AREA = "SERVICE_AREA",
}

export async function fetchEnums(
  code: EnumCodes,
  token: string
): Promise<EnumResponse> {
  const response = await fetch(`${LAB_API_BASE_URL}/api/lookup/enums`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
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
  start: number;
  max: number;
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
