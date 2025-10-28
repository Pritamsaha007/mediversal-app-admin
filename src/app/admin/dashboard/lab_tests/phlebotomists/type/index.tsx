export interface PhlebotomistAvailability {
  id?: string;
  day_id: string;
  start_time: string;
  end_time: string;
  slot_capacity: number;
}

export interface Phlebotomist {
  id: string;
  name: string;
  mobile_number: string;
  email: string;
  rating: number;
  experience_in_yrs: number;
  service_city: string;
  service_area: string;
  specialization_id: string;
  license_no: string;
  joining_date: string;
  is_home_collection_certified: boolean;
  is_available: boolean;
  is_deleted: boolean;
  availability: PhlebotomistAvailability[];
  created_by?: string;
  updated_by?: string;
}

export interface CreatePhlebotomistPayload {
  name: string;
  mobile_number: string;
  email: string;
  rating?: number;
  experience_in_yrs?: number;
  service_city: string;
  service_area: string;
  specialization_id: string;
  license_no: string;
  joining_date: string;
  is_home_collection_certified: boolean;
  is_available: boolean;
  is_deleted?: boolean;
  availability: PhlebotomistAvailability[];
}

export interface UpdatePhlebotomistPayload extends CreatePhlebotomistPayload {
  id: string;
}

export interface CreatePhlebotomistResponse {
  success: boolean;
  phleboId: string;
}
