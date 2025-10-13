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
  prescriptions: any[];
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
export interface OrderItem {
  orderItemId: string;
  productName?: string;
  productId: string;
  sku?: string;
  sellingPrice: string;
  prescriptionRequired: string;
  quantity: number;
  Category: string;
}

export interface Prescription {
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
