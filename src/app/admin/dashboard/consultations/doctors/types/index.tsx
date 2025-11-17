export interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
  maxPatientsPerSlot: string;
}

export interface DoctorSlot {
  id?: string;
  day?: string;
  day_id: string;
  start_time: string;
  end_time: string;
  slot_capacity: number;
}

export const formatTimeForDisplay = (time: string): string => {
  if (!time) return "";
  return time.substring(0, 5);
};

export interface Doctor {
  id: string;
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
  is_available: boolean;
  profile_image_url: string | File | null;
  hospitalNames?: string[];
  rating?: number;
  specializations?: string;
  availability: Record<string, TimeSlot[]>;
  hospitalNamesMap?: Record<string, string>;
  doctor_slots?: DoctorSlot[];
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
  hospital: Array<{
    id: string;
    name: string;
  }>;
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
  id?: string;
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
