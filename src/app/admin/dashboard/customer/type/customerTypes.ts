export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  city: string;
  state: string;
  country: string;
  last_logged_in_at: string;
  membership_date: string;
  gender: string;
  birthday: string;
  age: {
    years: number;
    months: number;
    days: number;
  };
  status: string;
  total_spent: number | null;
  total_orders: string;
}

export interface CustomerMetrics {
  total_customers: string;
  total_active_customers: string;
  total_orders: string;
  net_revenue: string;
}

export interface SearchCustomersRequest {
  search: string;
  start: number;
  max: number;
}

export interface SearchCustomersResponse {
  success: boolean;
  customers: Customer[];
  total_count: number;
}

export interface CustomerMetricsResponse {
  success: boolean;
  metrics: CustomerMetrics[];
}

export interface CreateCustomerRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  birthday: string;
  is_enabled: boolean;
  profile_pic_url: string;
  last_logged_in_at: string;
  blood_grp: string;
  gender: string;
}

export interface CreateCustomerResponse {
  success: boolean;
  message?: string;
  customer?: Customer;
}
