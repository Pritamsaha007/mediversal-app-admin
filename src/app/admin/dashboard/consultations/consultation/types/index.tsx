export interface ConsultationAPI {
  id: string;
  consultation_date: string;
  consultation_time: string;
  session_duration_in_mins: number;
  patient_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  hospital_id: string;
  symptoms_desc: string;
  payment_mode: string;
  total_amount: string;
  service_fee_tax_amount: string;
  paid_amount: string;
  applied_coupons: string[];
  status: string;
  aadhar_id: string;
  consultation_language: string;
  is_deleted: boolean;
  created_date: string;
  updated_date: string;
  doc_id: string;
  doc_name: string;
  is_available_online: boolean | null;
  is_available_in_person: boolean | null;
  consultation_type: string;
  payment_status: string;
  customer_id: string | null;
  customer_name: string | null;
  total_doc_consultations: string;
  total_in_person_consultations: string;
  total_online_consultations: string;
  receipt_url: string | null;
  hospital_name: string;
}

export interface GetConsultationsResponse {
  success?: boolean;
  consultations: ConsultationAPI[];
}

export interface GetConsultationsParams {
  start?: number;
  max?: number;
  customer_id?: string | null;
  search_text?: string | null;
  is_online_consultation?: boolean | null;
  filter_status?: string | null;
}

export interface CreateConsultationRequest {
  id?: string;
  date: string;
  time: string;
  session_duration_in_mins: number;
  customer_id?: string | null;
  patient_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  hospital_id?: string;
  symptoms_desc: string;
  payment_mode: string;
  total_amount: number;
  service_fee_tax_amount: number;
  paid_amount: number;
  applied_coupons: string[] | null;
  status: string;
  aadhar_id?: string;
  consultation_language_id: string;
  staff_id: string;
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

export interface DoctorSearchResponse {
  success: boolean;
  doctors: Array<{
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
    doctor_slots: any[];
  }>;
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
  roles: EnumItem[];
}
export interface RTCTokenResponse {
  success: boolean;
  data: {
    token: string;
    channelName: string;
    expireAt: number;
  };
}
