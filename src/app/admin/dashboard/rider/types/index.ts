export default interface DeliveryOrder {
  id: string;
  items: OrderItem[];
  amount: string;
  billing_city: string | null;
  billing_state: string | null;
  customer_phone: string;
  billing_country: string | null;
  billing_pincode: string | null;
  billing_address_1: string;
  billing_address_2: string | null;
  billing_last_name: string | null;
  billing_first_name: string;
  rider_delivery_status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  isDeliveryStarted?: boolean;
}

export interface RiderStats {
  total_earning: number;
  total_assign_orders: number;
  total_completed_delivery: number;
  total_pending_delivery: number;
  total_in_progress_delivery: number;
}
export interface RidersStats {
  totalRiders: number;
  activeRiders: number;
  verifiedRiders: number;
}

export interface Rider {
  id: string;
  name: string;
  stats: RiderStats;
  orders: DeliveryOrder[];
}
export interface DeliveryRider {
  id: string;
  name: string;
  email: string;
  is_deleted: boolean;
  license_no: string;
  pin_codes: string[];
  joining_date: string;
  vehicle_name: string;
  aadhar_number: string;
  mobile_number: string;

  service_city_id: string;
  vehicle_type_id: string;
  license_image_url: string;
  profile_image_url: string;
  service_city_name: string;
  is_available_status: string;
  is_poi_verified_status: string;
}
export interface CreateRiderPayload {
  id?: string;
  name: string;
  email: string;
  mobile_number: string;
  vehicle_type_id: string;
  license_no: string;
  license_image_url: string;
  profile_image_url: string;
  aadhar_number: string;
  service_city: string;
  pin_code: string[];
  is_POI_verified?: boolean;
  is_available?: boolean;
  joining_date: string;
  is_deleted?: boolean;
  created_by?: string;
  updated_by?: string;
}
export interface Pincode {
  id: string;
  pincode: string;
  district: string;
  state: string;
}

export interface PincodeSearchPayload {
  search_city?: string;
  search_pincode?: string;
  start?: number;
  max?: number;
}

export interface PincodeSearchResponse {
  success: boolean;
  pincodes: Pincode[];
}
export interface SearchRidersPayload {
  start: number;
  max: number;
  search?: string | null;
  search_city_name?: string | null;
  search_pincodes?: string[] | null;
  filter_active?: boolean | null;
  filter_verified?: boolean | null;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}
export interface CreateRiderResponse {
  success: boolean;
  riderId: string;
}
export interface OrderItem {
  qty: number;
  name: string;
}

export interface RiderOrder {
  id: string;
  items: OrderItem[];
  amount: number;
  billing_city: string | null;
  billing_state: string | null;
  customer_phone: string;
  billing_country: string | null;
  billing_pincode: string | null;
  billing_address_1: string;
  billing_address_2: string | null;
  billing_last_name: string | null;
  billing_first_name: string;
  rider_delivery_status: "Pending" | "InProgress" | "Completed" | string;
}

export interface RiderStats {
  total_earning: number;
  total_assign_orders: number;
  total_completed_delivery: number;
  total_pending_delivery: number;
  total_in_progress_delivery: number;
}

export interface RiderOverviewPayload {
  rider_id: string;
  start: number;
  max: number;
  search: string | null;
  filter_status: "pending" | "inprogress" | "completed" | null;
}

export interface RiderOverviewResponse {
  success: boolean;
  orders: RiderOrder[];
  stats: RiderStats;
}
export interface UpdateRiderInfoPayload {
  id: string;
  order_status?: string;
  rider_staff_id: string;
  rider_delivery_status_id: string;
  cancellation_reason?: string;
}

export interface UpdateRiderInfoResponse {
  success: boolean;
  message?: string;
  order?: any;
}
