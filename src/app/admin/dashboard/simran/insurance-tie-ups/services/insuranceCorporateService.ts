const SIMRAN_API_BASE = process.env.NEXT_PUBLIC_SIMRAN_API_BASE_URL || "";
const HOMECARE_API_BASE = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL || "";

export enum EnumCodes {
  COMPANY_SECTOR = "COMPANY_SECTOR",
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

export async function fetchEnums(
  code: EnumCodes,
  token: string,
): Promise<EnumResponse> {
  const response = await fetch(`${HOMECARE_API_BASE}/api/lookup/enums`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface InsuranceSearchParams {
  search?: string | null;
  filter_active?: boolean | null;
  start: number;
  max: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export interface InsurancePartnerAPI {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
  is_deleted: boolean;
  created_date: string;
  updated_date: string;
}

export interface InsuranceSearchResponse {
  insuranceData: InsurancePartnerAPI[];
  statics: {
    total_partners: number;
    active_partners: number;
    inactive_partners: number;
  };
}

export interface InsurancePayload {
  id: string | null;
  name: string;
  is_active: boolean;
  is_deleted: boolean;
  image_url: string;
}

export async function searchInsurancePartners(
  params: InsuranceSearchParams,
  token: string,
): Promise<InsuranceSearchResponse> {
  const response = await fetch(`${SIMRAN_API_BASE}/insurance-partner/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function saveInsurancePartner(
  payload: InsurancePayload,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${SIMRAN_API_BASE}/insurance-partner`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function toggleInsuranceActive(
  partner: InsurancePartnerAPI,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  return saveInsurancePartner(
    {
      id: partner.id,
      name: partner.name,
      is_active: !partner.is_active,
      is_deleted: partner.is_deleted,
      image_url: partner.image_url,
    },
    token,
  );
}

export async function deleteInsurancePartner(
  partner: InsurancePartnerAPI,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  return saveInsurancePartner(
    {
      id: partner.id,
      name: partner.name,
      is_active: partner.is_active,
      is_deleted: true,
      image_url: partner.image_url,
    },
    token,
  );
}

export interface CorporateSearchParams {
  search?: string | null;
  filter_active?: boolean | null;
  start: number;
  max: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export interface CorporateTieUpAPI {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
  is_deleted: boolean;
  sector_name: string;
  created_date: string;
  updated_date: string;
}

export interface CorporateSearchResponse {
  corporates: CorporateTieUpAPI[];
  statics: {
    total_corporates: number;
    active_corporates: number;
    inactive_corporates: number;
  };
}

export interface CorporatePayload {
  id: string | null;
  name: string;
  sector_id: string;
  is_active: boolean;
  is_deleted: boolean;
  image_url: string;
}

export async function searchCorporateTieUps(
  params: CorporateSearchParams,
  token: string,
): Promise<CorporateSearchResponse> {
  const response = await fetch(`${SIMRAN_API_BASE}/corporate-tieup/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function saveCorporateTieUp(
  payload: CorporatePayload,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${SIMRAN_API_BASE}/corporate-tieup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function toggleCorporateActive(
  corporate: CorporateTieUpAPI,
  sectorId: string,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  return saveCorporateTieUp(
    {
      id: corporate.id,
      name: corporate.name,
      sector_id: sectorId,
      is_active: !corporate.is_active,
      is_deleted: corporate.is_deleted,
      image_url: corporate.image_url,
    },
    token,
  );
}

export async function deleteCorporateTieUp(
  corporate: CorporateTieUpAPI,
  sectorId: string,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  return saveCorporateTieUp(
    {
      id: corporate.id,
      name: corporate.name,
      sector_id: sectorId,
      is_active: corporate.is_active,
      is_deleted: true,
      image_url: corporate.image_url,
    },
    token,
  );
}
