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

// Updated Order interface to match API response
export interface Order {
  orderId: number;
  customerId: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentTime: string;
  transactionId: string;
  createdAt: string;
  TotalOrderAmount: number | null;
  deliverystatus: OrderStatus | null;
  items: OrderItem[];
}

// Updated OrderItem interface to match API response
export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  sellingPrice: string;
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
