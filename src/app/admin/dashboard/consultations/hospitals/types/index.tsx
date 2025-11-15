export interface OperatingHours {
  [key: string]: {
    id?: string;
    startTime: string;
    endTime: string;
  };
}

export interface Hospital {
  id: string;
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
    landmark?: string;
  };
  contact: {
    phone: string[];
    email: string[];
    website?: string;
  };
  description: string;
  departments: string[];
  lab_test_ids: string[];
  health_package_ids: string[];
  operatingHours: OperatingHours;
  emergencyServices: boolean;
  image?: File | string | null;
  created_by?: string;
  updated_by?: string;
}
export interface HospitalAPI {
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
  lab_test_ids: string[];
  health_package_ids: string[];
  operating_hours: {
    day: string;
    end_time: string;
    start_time: string;
  }[];
}

export interface GetHospitalsResponse {
  success?: boolean;
  hospitals: HospitalAPI[];
}

export interface GetHospitalsParams {
  search_text?: string | null;
  filter_department?: string[] | null;
  filter_operating_hrs_start_time?: string | null;
  filter_operating_hrs_end_time?: string | null;
  sort_by?: string;
  sort_order?: string;
}

export interface EnumItem {
  id: string;
  slno: number;
  code: string;
  value: string;
  description: string | null;
  metadata: string | null;
}

export interface HospitalFormData {
  id?: string;
  name: string;
  description: string;
  display_pic?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  landmark?: string;
  state_id: string;
  pincode: string;
  country: string;
  is_available_24_7: boolean;
  contact: string;
  email: string;
  website?: string;
  departments: string[];
  lab_test_ids: string[];
  health_package_ids: string[];
  operating_hrs: {
    id?: string;
    day_id: string;
    start_time: string;
    end_time: string;
  }[];
}
