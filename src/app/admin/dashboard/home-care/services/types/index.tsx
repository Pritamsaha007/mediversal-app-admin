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
  rating?: number;
  reviewCount?: number;
}

export interface Offering {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  duration_in_hrs: number;
  duration_type: string;
  duration_type_id?: string;
  staffRequirements: string[];
  equipmentIncluded: string[];
  features: string[];
  is_device: boolean;
  device_stock_count: number;
  status: "Available" | "Good" | "Excellent" | "Active" | "Inactive";
  service_id?: string;
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

export const transformOffering = (response: OfferingResponse): Offering => ({
  id: response.id,
  name: response.name,
  description: response.description,
  price: parseFloat(response.price),
  duration: `${response.duration_in_hrs} ${response.duration_type}`,
  duration_in_hrs: response.duration_in_hrs,
  duration_type: response.duration_type,
  staffRequirements: response.staff_requirements || [],
  equipmentIncluded: response.equipment_requirements || [],
  features: response.features || [],
  is_device: response.is_device,
  device_stock_count: response.device_stock_count || 0,
  status: response.status === "Active" ? "Available" : "Good",
  service_id: response.homecare_service_id,
});

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

export interface GetOfferingsParams {
  status?: string | null;
  service_id?: string | null;
  offering_name?: string | null;
}

export interface GetOfferingsResponse {
  success: boolean;
  offerings: OfferingResponse[];
}
