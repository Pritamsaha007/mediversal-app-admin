export interface Status {
  label: string;
  value: number | string;
}

export interface StatsCardData {
  title: string;
  stats: Status[];
  icon?: React.ReactNode;
  color?: string;
}

export type Order = {
  Awb: string | null;
  ShipmentId: string | null;
  TotalOrderAmount: string;
  applied_discount_value: string | number | null;
  billing_address_2: string | null;
  billing_city: string;
  billing_country: string;
  billing_last_name: string | null;
  billing_pincode: string;
  billing_state: string;
  cancellationReason: string | null;
  comment: string;
  coupon_id: number | null;
  createdAt: string;
  created_date: string;
  customerAddress: string;
  customerEmail: string | null;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliverystatus: string;
  giftwrap_charges: string;
  id: string;
  is_cancel_clicked: boolean;
  is_return_clicked: boolean;
  items: any[];
  labelUrl: string | null;
  manifestUrl: string | null;
  orderDate: string;
  parent_order_id: string | null;
  paymentMethod: string;
  paymentStatus: string;
  paymentTime: string;
  prescriptions: prescription[];
  rapidshypAwb: string | null;
  rapidshypShipmentId: number | null;
  shipping_charges: string;
  shiprocket_order_id: string;
  shiprocket_order_status: string;
  total_discount: string;
  transaction_charges: string;
  transactionId: string | null;
  updated_date: string;
};

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  sku: string;
  tax: number;
  discount: number;
  hsn: number;
  productLength: number;
  productBreadth: number;
  productHeight: number;
  productWeight: number;
};
export interface prescription {
  prescription_id: string;
  prescriptionURL: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus = "Pending" | "Failed" | "Paid" | "Refund";

export type SortOption =
  | "Sort"
  | "Order Total (Low to High)"
  | "Order Total (High to Low)"
  | "Order Date (Latest)"
  | "Order Date (Oldest)"
  | "By Order Status"
  | "By Payment Status";

export interface FilterOptions {
  status: string;
  payment: string;
  sortBy: string;
  searchTerm: string;
}

// API Response interface
export interface ApiResponse {
  success: boolean;
  data: Order[];
  message?: string;
}

// Action types for order actions
export interface OrderAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  onClick: (order: Order) => void;
}
export interface ShipmentTrack {
  id: number;
  awb_code: string;
  courier_company_id: number;
  shipment_id: number;
  order_id: number;
  pickup_date: string;
  delivered_date: string;
  weight: string;
  packages: number;
  current_status: string;
  delivered_to: string;
  destination: string;
  consignee_name: string;
  origin: string;
  courier_agent_details: any | null;
  courier_name: string;
  edd: string;
  pod: string;
  pod_status: string;
  rto_delivered_date: string;
  return_awb_code: string;
  updated_time_stamp: string;
}

export interface ShipmentTrackActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
  "sr-status": string | number;
  "sr-status-label": string;
}

export interface TrackingData {
  track_status: number;
  shipment_status: number;
  shipment_track: ShipmentTrack[];
  shipment_track_activities: ShipmentTrackActivity[];
  track_url: string;
  etd: string;
  qc_response: string;
  is_return: boolean;
  order_tag: string;
}
export interface Product {
  productId: string;
  ProductName: string;
  description: string;
  quantity: number;
  delivery: string;
  CostPrice: number;
  SellingPrice: number;
  discountPercentage: number;
  Category: string;
  Composition: string;
  Subcategory: string;
  manufacturer_name: string;
  type: string;
  PrescriptionRequired: string;
  ProductStrength: string;
  PackageSize: string;
  StockAvailableInInventory: number;
  featuredProduct: boolean | number;
  active: boolean | number;
  DiscountedPrice?: string | number;
  Type?: string;
  ColdChain?: string;
  ManufacturerName?: string;
  ProductInformation?: string;
  SafetyAdvices?: string;
  StorageInstructions?: string;
  GST?: string | number;
  Coupons?: string | number;
  InventoryUpdated?: any;
  InventoryUpdatedBy?: number;
  DiscountedPercentage?: string | number;
  updated_by?: number;
  archivedProduct?: number;
  HSN_Code?: string;
  SKU?: string;
  productLength?: string | number;
  productBreadth?: string | number;
  productHeight?: string | number;
  productWeight?: string | number;
  tax?: any;
  imageUrls?: string[];
  similarProducts?: any;
  substitutes?: any;
}
export interface PaymentDetails {
  acquirer_data: {
    rrn: string | null;
  };
  amount: number;
  amount_captured: number | null;
  amount_refunded: number;
  bank: string | null;
  captured: boolean;
  card_id: string | null;
  contact: string;
  created_at: number;
  currency: string;
  description: string;
  email: string;
  entity: string;
  error_code: string | null;
  error_description: string | null;
  error_reason: string | null;
  error_source: string | null;
  error_step: string | null;
  fee: number | null;
  id: string;
  international: boolean;
  invoice_id: string | null;
  method: string;
  notes: any[];
  order_id: string;
  provider: string | null;
  refund_status: string | null;
  reward: any | null;
  status: string;
  tax: number | null;
  upi: {
    vpa: string | null;
  };
  vpa: string | null;
  wallet: string | null;
}

// ShipRocket Serviceability Types
export interface ServiceabilityRequest {
  pickup_postcode: string;
  delivery_postcode: string;
  cod: number;
  weight: number;
}

export interface CovidZones {
  delivery_zone: string | null;
  pickup_zone: string | null;
}

export interface EddFallback {
  bi: string;
}

export interface SuppressionDates {
  action_on: string;
  blocked_fm: string;
  blocked_lm: string;
}

export interface CourierCompany {
  air_max_weight: string;
  api_edd: number;
  assured_amount: number;
  base_courier_id: number | null;
  base_weight: string;
  blocked: number;
  call_before_delivery: string;
  charge_weight: number;
  city: string;
  cod: number;
  cod_charges: number;
  cod_multiplier: number;
  cost: string;
  courier_company_id: number;
  courier_name: string;
  courier_type: string;
  coverage_charges: number;
  cutoff_time: string;
  delivery_boy_contact: string;
  delivery_delay?: boolean;
  delivery_performance: number;
  description: string;
  edd: string;
  edd_fallback: EddFallback;
  entry_tax: number;
  estimated_delivery_days: string;
  etd: string;
  etd_hours: number;
  freight_charge: number;
  id: number;
  is_custom_rate: number;
  is_hyperlocal: boolean;
  is_international: number;
  is_rto_address_available: boolean;
  is_surface: boolean;
  local_region: number;
  metro: number;
  min_weight: number;
  mode: number;
  new_edd: number;
  odablock: boolean;
  other_charges: number;
  others: string;
  pickup_availability: string;
  pickup_performance: number;
  pickup_priority: string;
  pickup_supress_hours: number;
  pod_available: string;
  postcode: string;
  qc_courier: number;
  rank: string;
  rate: number;
  rating: number;
  realtime_tracking: string;
  region: number;
  rto_charges: number;
  rto_performance: number;
  seconds_left_for_pickup: number;
  secure_shipment_disabled: boolean;
  ship_type: number;
  state: string;
  suppress_date: string;
  suppress_text: string;
  suppression_dates: SuppressionDates | null;
  surface_max_weight: string;
  tracking_performance: number;
  volumetric_max_weight: number | null;
  weight_cases: number;
  zone: string;
}

export interface RecommendedBy {
  id: number;
  title: string;
}

export interface ServiceabilityData {
  available_courier_companies: CourierCompany[];
  child_courier_id: number | null;
  is_recommendation_enabled: number;
  promise_recommended_courier_company_id: number | null;
  recommendation_advance_rule: number;
  recommendation_level: string;
  recommended_by: RecommendedBy;
  recommended_courier_company_id: number;
  shiprocket_recommended_courier_id: number;
}

export interface ServiceabilityResponse {
  company_auto_shipment_insurance_setting: boolean;
  covid_zones: CovidZones;
  currency: string;
  data: ServiceabilityData;
  dg_courier: number;
  eligible_for_insurance: number;
  insurace_opted_at_order_creation: boolean;
  is_allow_templatized_pricing: boolean;
  is_latlong: number;
  is_old_zone_opted: boolean;
  is_zone_from_mongo: boolean;
  label_generate_type: number;
  on_new_zone: number;
  seller_address: any[];
  status: number;
  user_insurance_manadatory: boolean;
}

export interface CreateOrderRequest {
  id: string | null;
  orderDate: string;
  comment: string;
  customerId: string | null;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_phone: string;
  billing_email: string;
  payment_status: string;
  payment_method: string;
  payment_time: string;
  transaction_id: string;
  sub_total: number;
  shipping_charges: number;
  giftwrap_charges: number;
  transaction_charges: number;
  total_discount: number;
  delivery_status: string;
  rapidshypShipmentId: string | null;
  rapidshypAwb: string | null;
  labelUrl: string | null;
  manifestUrl: string | null;
  coupon_id: string | null;
  applied_discount_value: number | null;
  cancellationReason: string | null;
  prescription_url?: string | null;
  prescription_id?: number;
  order_items: OrderItem[];
}

export interface CreateOrderResponse {
  orderId: string;
  messageResData: {
    $metadata: {
      httpStatusCode: number;
      requestId: string;
      attempts: number;
      totalRetryDelay: number;
    };
    MD5OfMessageBody: string;
    MessageId: string;
    SequenceNumber: string;
  };
}
export interface CancelOrderRequest {
  orderId: string;
  orderStatus: "Return Requested" | "Cancelled";
  reason: string;
}

export interface CancelOrderResponse {
  messageResData: {
    $metadata: {
      httpStatusCode: number;
      requestId: string;
      attempts: number;
      totalRetryDelay: number;
    };
    MD5OfMessageBody: string;
    MessageId: string;
    SequenceNumber: string;
  };
}
export interface ShipmentTrack {
  id: number;
  awb_code: string;
  courier_company_id: number;
  shipment_id: number;
  order_id: number;
  pickup_date: string;
  delivered_date: string;
  weight: string;
  packages: number;
  current_status: string;
  delivered_to: string;
  destination: string;
  consignee_name: string;
  origin: string;
  courier_agent_details: any | null;
  courier_name: string;
  edd: string;
  pod: string;
  pod_status: string;
  rto_delivered_date: string;
  return_awb_code: string;
  updated_time_stamp: string;
}

export interface ShipmentTrackActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
  "sr-status": string | number;
  "sr-status-label": string;
}

export interface TrackingData {
  track_status: number;
  shipment_status: number;
  shipment_track: ShipmentTrack[];
  shipment_track_activities: ShipmentTrackActivity[];
  track_url: string;
  etd: string;
  qc_response: string;
  is_return: boolean;
  order_tag: string;
}
