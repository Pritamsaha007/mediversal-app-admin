const SIMRAN_API_BASE = process.env.NEXT_PUBLIC_SIMRAN_API_BASE_URL!;
const HOMECARE_API_BASE = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL!;

export interface LeadSearchParams {
  start: number | null;
  max: number | null;
  search: string | null;
  filter_lead_status: string | null;
  sort_by: string;
  sort_order: "ASC" | "DESC";
}

export interface UpdateLeadStatusPayload {
  id: string;
  lead_status_id: string;
}

export interface LeadAPIItem {
  id: string;
  patient_name: string;
  dob: string | null;
  mobile_number: string;
  email: string;
  visit_type: string | null;
  slot_date: string | null;
  slot_time: string | null;
  created_date: string;
  updated_date: string;
  is_deleted: boolean;
  lead_status: string;
  lead_type: string | null;
  doctor_name: string | null;
  doc_qualifications: string | null;
  doc_certfications: string[] | string | null;
  consultation_price: number | null;
  procedure_name: string | null;
  min_cost: number | null;
  max_cost: number | null;
  service_name: string | null;
  department_name: string | null;
  package_name: string | null;
  selling_price: number | null;
  cost_price: number | null;
}

export interface LeadStatics {
  total_leads: number;
  total_new_leads: number;
  total_FollowUp_leads: number;
  total_InProgress_leads: number;
  total_Closed_leads: number;
  total_Completed_leads: number;
}

export interface LeadSearchResponse {
  leads: LeadAPIItem[];
  statics: LeadStatics;
}

export interface LeadStatusEnumItem {
  id: string;
  slno: number;
  code: string;
  value: string;
  description: string | null;
  metadata: any | null;
}

export interface LeadStatusEnumResponse {
  success: boolean;
  roles: LeadStatusEnumItem[];
}

export interface UpdateLeadStatusResponse {
  success: boolean;
  message?: string;
}

export async function searchLeads(
  params: LeadSearchParams,
  token: string,
): Promise<LeadSearchResponse> {
  const response = await fetch(`${SIMRAN_API_BASE}/booking-leads/search`, {
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

export async function fetchLeadStatusEnums(
  token: string,
): Promise<LeadStatusEnumResponse> {
  const response = await fetch(`${HOMECARE_API_BASE}/api/lookup/enums`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: "SIMIRAN_LEAD_STATUS" }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function updateLeadStatus(
  payload: UpdateLeadStatusPayload,
  token: string,
): Promise<UpdateLeadStatusResponse> {
  const response = await fetch(`${SIMRAN_API_BASE}/booking-leads`, {
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
