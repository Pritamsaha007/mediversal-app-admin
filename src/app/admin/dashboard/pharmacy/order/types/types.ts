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

export interface Order {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customerId: number;
  createdAt: string;
  TotalOrderAmount: string;
  deliverystatus: string;
  paymentStatus: string;
  paymentMethod: string;
  rapidshypAwb?: string;
  applied_discount_value: string;
  items: OrderItem[];
  prescriptions: Prescription[];
}

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
