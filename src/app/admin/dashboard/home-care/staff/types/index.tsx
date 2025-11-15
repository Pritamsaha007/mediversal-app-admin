export interface Staff {
  id: string;
  name: string;
  phone: string;
  address?: string;
  experience: string;
  rating: number;
  status: string;
  departments: string[];
  position: string;
  joinDate?: string;
  email: string;
  certifications: string[];
  activeOrders?: number;
  completedOrders?: number;

  profile_image_url?: string;
  role_id?: string;
}
export interface ApiStaff {
  id: string;
  name: string;
  mobile_number: string;
  role_name: string;
  email: string;
  experience_in_yrs: number;
  experience_in_months: number;
  experience_in_days: number;
  specializations: string[];
  certifications: string[];
  rating: string;
  profile_image_url: string;
  availability_status: string;
}

export interface StaffApiResponse {
  success: boolean;
  staffs: ApiStaff[];
}
export interface CreateUpdateStaffPayload {
  id?: string;
  name: string;
  mobile_number: string;
  role: string;
  email: string;
  experience_in_yrs: number;
  experience_in_months: number;
  experience_in_days: number;
  specializations: string[];
  certifications: string[];
  rating: number;
  profile_image_url?: string;
}
