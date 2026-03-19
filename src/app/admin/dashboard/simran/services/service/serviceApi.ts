import {
  ServiceSearchParams,
  ServiceAPI,
  DepartmentSearchParams,
  DepartmentAPI,
  ProcedureSearchParams,
  ProcedureAPI,
  CreateUpdateServicePayload,
  CreateUpdateDepartmentPayload,
  CreateUpdateProcedurePayload,
} from "../types/serviceTypes";

const SIMRAN_API_BASE = process.env.NEXT_PUBLIC_SIMRAN_API_BASE_URL!;
const CLINIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      query.append(key, String(value));
    }
  });
  return query.toString();
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function uploadServiceImage(
  token: string,
  file: File,
  folder: string = "healthcare/services",
): Promise<string> {
  const fileUri = URL.createObjectURL(file);
  const base64Content = await fileToBase64(fileUri);

  const bucketName =
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_DEV
      : process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_PROD;

  if (!bucketName) throw new Error("AWS bucket name is not configured");

  const fileName = `${folder}/${Date.now()}-${file.name}`;

  const res = await fetch(`${CLINIC_API_BASE}/api/misc/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucketName,
      folderPath: folder,
      fileName: `${Date.now()}-${file.name}`,
      fileContent: base64Content,
    }),
  });

  const data = await handleResponse<{ success: boolean; result: string }>(res);
  if (!data.success) throw new Error("Image upload failed");
  return data.result;
}

async function fileToBase64(fileUri: string): Promise<string> {
  const response = await fetch(fileUri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (base64) resolve(base64);
      else reject(new Error("Failed to convert file to base64"));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function fetchServices(
  params: ServiceSearchParams,
  token: string,
): Promise<{ data: ServiceAPI[]; total: number }> {
  const query = buildQueryString(params);
  const res = await fetch(`${SIMRAN_API_BASE}/healthcare/services?${query}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await handleResponse<{ data: ServiceAPI[] }>(res);
  const total = data.data?.[0]
    ? parseInt(data.data[0].total_count || "0", 10)
    : 0;
  return { data: data.data || [], total };
}

export async function createOrUpdateService(
  payload: CreateUpdateServicePayload,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${SIMRAN_API_BASE}/admin/healthcare/service`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteService(
  service: ServiceAPI,
  token: string,
): Promise<{ success: boolean }> {
  return createOrUpdateService(
    {
      id: service.id,
      name: service.name,
      image_url: service.image_url,
      description: service.description,
      tags: service.tags,
      is_active: service.is_active,
      is_featured: service.is_featured,
      is_deleted: true,
    },
    token,
  );
}

export async function toggleServiceActive(
  service: ServiceAPI,
  token: string,
): Promise<{ success: boolean }> {
  return createOrUpdateService(
    {
      id: service.id,
      name: service.name,
      image_url: service.image_url,
      description: service.description,
      tags: service.tags,
      is_active: !service.is_active,
      is_featured: service.is_featured,
      is_deleted: false,
    },
    token,
  );
}

export async function fetchDepartments(
  params: DepartmentSearchParams,
  token: string,
): Promise<{ data: DepartmentAPI[]; total: number }> {
  const query = buildQueryString(params);
  const res = await fetch(
    `${SIMRAN_API_BASE}/healthcare/departments?${query}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const data = await handleResponse<{ data: DepartmentAPI[] }>(res);
  const total = data.data?.[0]
    ? parseInt(data.data[0].total_count || "0", 10)
    : 0;
  return { data: data.data || [], total };
}

export async function createOrUpdateDepartment(
  payload: CreateUpdateDepartmentPayload,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${SIMRAN_API_BASE}/admin/healthcare/department`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteDepartment(
  dept: DepartmentAPI,
  token: string,
): Promise<{ success: boolean }> {
  return createOrUpdateDepartment(
    {
      id: dept.id,
      simran_healthcare_service_id: dept.simran_healthcare_service_id,
      name: dept.name,
      description: dept.description,
      symptoms: dept.symptoms,
      is_active: dept.is_active,
      is_deleted: true,
    },
    token,
  );
}

export async function toggleDepartmentActive(
  dept: DepartmentAPI,
  token: string,
): Promise<{ success: boolean }> {
  return createOrUpdateDepartment(
    {
      id: dept.id,
      simran_healthcare_service_id: dept.simran_healthcare_service_id,
      name: dept.name,
      description: dept.description,
      symptoms: dept.symptoms,
      is_active: !dept.is_active,
      is_deleted: false,
    },
    token,
  );
}

export async function fetchProcedures(
  params: ProcedureSearchParams,
  token: string,
): Promise<{ data: ProcedureAPI[]; total: number }> {
  const query = buildQueryString(params);
  const res = await fetch(`${SIMRAN_API_BASE}/healthcare/procedures?${query}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await handleResponse<{ data: ProcedureAPI[] }>(res);
  const total = data.data?.[0]
    ? parseInt(data.data[0].total_count || "0", 10)
    : 0;
  return { data: data.data || [], total };
}

export async function createOrUpdateProcedure(
  payload: CreateUpdateProcedurePayload,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${SIMRAN_API_BASE}/admin/healthcare/procedure`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteProcedure(
  proc: ProcedureAPI,
  token: string,
): Promise<{ success: boolean }> {
  return createOrUpdateProcedure(
    {
      id: proc.id,
      simran_healthcare_service_id: proc.simran_healthcare_service_id,
      simran_healthcare_department_id: proc.simran_healthcare_department_id,
      name: proc.name,
      image_url: proc.image_url,
      description: proc.description,
      included: proc.included,
      min_cost: proc.min_cost,
      max_cost: proc.max_cost,
      procedure_duration: proc.procedure_duration,
      report_time: proc.report_time,
      stay_in_hospital: proc.stay_in_hospital,
      recovery: proc.recovery,
      procedure_inclusions: proc.procedure_inclusions,
      pre_procedure_instructions: proc.pre_procedure_instructions,
      is_active: proc.is_active,
      is_deleted: true,
    },
    token,
  );
}

export async function toggleProcedureActive(
  proc: ProcedureAPI,
  token: string,
): Promise<{ success: boolean }> {
  return createOrUpdateProcedure(
    {
      id: proc.id,
      simran_healthcare_service_id: proc.simran_healthcare_service_id,
      simran_healthcare_department_id: proc.simran_healthcare_department_id,
      name: proc.name,
      image_url: proc.image_url,
      description: proc.description,
      included: proc.included,
      min_cost: proc.min_cost,
      max_cost: proc.max_cost,
      procedure_duration: proc.procedure_duration,
      report_time: proc.report_time,
      stay_in_hospital: proc.stay_in_hospital,
      recovery: proc.recovery,
      procedure_inclusions: proc.procedure_inclusions,
      pre_procedure_instructions: proc.pre_procedure_instructions,
      is_active: !proc.is_active,
      is_deleted: false,
    },
    token,
  );
}
