export interface ServiceAPI {
  id: string;
  name: string;
  image_url: string;
  description: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  is_deleted?: boolean;
  created_date: string;
  updated_date: string;
  total_count: string;
}

export interface ServiceSearchParams {
  start: number;
  max: number;
  search?: string | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
}

export interface DepartmentAPI {
  id: string;
  simran_healthcare_service_id: string;
  service_name: string;
  name: string;
  description: string;
  symptoms: string[];
  is_active: boolean;
  is_deleted?: boolean;
  created_date: string;
  updated_date: string;
  total_count: string;
}

export interface DepartmentSearchParams {
  start: number;
  max: number;
  is_active?: boolean | null;
  service_id: string;
}

export interface ProcedureAPI {
  id: string;
  simran_healthcare_service_id: string;
  simran_healthcare_department_id: string;
  service_name: string;
  department_name: string;
  name: string;
  image_url: string;
  description: string;
  included: string[];
  min_cost: number;
  max_cost: number;
  procedure_duration: string;
  report_time: string;
  stay_in_hospital: string;
  recovery: string;
  procedure_inclusions: string[];
  pre_procedure_instructions: string[];
  is_active: boolean;
  is_deleted?: boolean;
  created_date: string;
  updated_date: string;
  total_count: string;
}

export interface ProcedureSearchParams {
  start: number;
  max: number;
  search?: string | null;
  is_active?: boolean | null;
  service_id: string;
  department_id: string;
}

export interface ServiceFormData {
  name: string;
  image_url: string;
  description: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
}

export interface DepartmentFormData {
  name: string;
  description: string;
  symptoms: string[];
  is_active: boolean;
}

export interface ProcedureFormData {
  name: string;
  image_url: string;
  description: string;
  included: string[];
  min_cost: number | string;
  max_cost: number | string;
  procedure_duration: string;
  report_time: string;
  stay_in_hospital: string;
  recovery: string;
  procedure_inclusions: string[];
  pre_procedure_instructions: string[];
  is_active: boolean;
}

export interface CreateUpdateServicePayload {
  id?: string;
  name: string;
  image_url: string;
  description: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  is_deleted: boolean;
}

export interface CreateUpdateDepartmentPayload {
  id?: string;
  simran_healthcare_service_id: string;
  name: string;
  description: string;
  symptoms: string[];
  is_active: boolean;
  is_deleted: boolean;
}

export interface CreateUpdateProcedurePayload {
  id?: string;
  simran_healthcare_service_id: string;
  simran_healthcare_department_id: string;
  name: string;
  image_url: string;
  description: string;
  included: string[];
  min_cost: number;
  max_cost: number;
  procedure_duration: string;
  report_time: string;
  stay_in_hospital: string;
  recovery: string;
  procedure_inclusions: string[];
  pre_procedure_instructions: string[];
  is_active: boolean;
  is_deleted: boolean;
}

export type ServiceModalTab = "specialty" | "sub-department" | "procedure";
export type ServiceModalMode = "add" | "edit";

export interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ServiceModalMode;
  initialTab?: ServiceModalTab;
  initialService?: ServiceAPI;
  initialDepartment?: DepartmentAPI;
  initialProcedure?: ProcedureAPI;
  onSuccess: () => void;
}
