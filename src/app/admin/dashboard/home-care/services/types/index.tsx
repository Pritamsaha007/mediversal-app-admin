export interface HomecareService {
  id: string;
  name: string;
  description: string;
  display_pic_url: string;
  service_tags: string[];
  display_sections: string[];
  custom_medical_info: any;
  status: "Active" | "Inactive";
  consents?: Array<{
    id: string;
    consent: string;
    is_active: boolean;
    consent_category_id: string;
  }>;
}

export interface GetServicesResponse {
  success: boolean;
  services: HomecareService[];
}

export interface GetServicesParams {
  status?: string | null;
  search?: string | null;
  start?: number | null;
  max?: number | null;
}
export interface CreateUpdateServicePayload {
  id?: string;
  name: string;
  description: string;
  is_active: boolean;
  display_pic_url?: string;
  service_tags: string[];
  display_sections: string[];
  custom_medical_info?: any;
  consents?: Array<{
    id: string | null;
    consent: string;
  }>;
}
export interface CreateUpdateOfferingPayload {
  id?: string;
  homecare_service_id: string;
  name: string;
  price: number;
  duration_in_hrs: number;
  duration_type_id: string;
  description: string;
  staff_requirements: string[];
  equipment_requirements: string[];
  features: string[];
  is_device: boolean;
  device_stock_count: number;
  is_active: boolean;
}
export interface GetOfferingsParams {
  status?: string | null;
  service_id?: string | null;
  offering_name?: string | null;
}

export interface OfferingResponse {
  id: string;
  homecare_service_id: string;
  name: string;
  price: string;
  duration_in_hrs: number;
  duration_type: string;
  description: string;
  staff_requirements: string[];
  equipment_requirements: string[];
  features: string[];
  is_device: boolean;
  device_stock_count: number;
  status: string;
  homecare_service_name: string;
}

export interface GetOfferingsResponse {
  success: boolean;
  offerings: OfferingResponse[];
}
export interface Offering {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  duration_in_hrs: number;
  duration_type: string; // Add this - this comes from API
  duration_type_id?: string; // This will be populated by matching
  staffRequirements: string[];
  equipmentIncluded: string[];
  features: string[];
  is_device: boolean;
  device_stock_count: number;
  status: "Active" | "Inactive" | "Available" | "Good" | "Excellent";
}
