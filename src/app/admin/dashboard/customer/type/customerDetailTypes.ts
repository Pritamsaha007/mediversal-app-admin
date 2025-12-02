export interface ConsultationOrder {
  id: string;
  consultation_date: string;
  consultation_time: string;
  patient_name: string;
  phone: string;
  email: string;
  total_amount: string;
  status: string;
  payment_status: string;
  doc_name: string;
  doc_specialization: { specialization: string };
  consultation_type: string;
  created_date: string;
}

export interface PharmacyOrder {
  id: string;
  customerid: string;
  customername: string;
  customeraddress: string;
  paymentstatus: string;
  paymentmethod: string;
  totalorderamount: string;
  deliverystatus: string;
  orderdate: string;
  order_items: Array<{
    productName: string;
    quantity: number;
    sellingPrice: number;
  }>;
  prescriptionurl: string | null;
}

export interface HomecareOrder {
  id: string;
  customer_id: string;
  homecare_service_name: string;
  order_total: string;
  order_status: string;
  order_date: string;
  payment_status: string;
  customer_name: string;
}

export interface LabTestBooking {
  id: string;
  customer_id: string;
  labtestnames: string[];
  patient_details: {
    patients_list: Array<{
      name: string;
      age: number;
      gender: string;
    }>;
  };
  status: string;
  payment_status: string;
  amount: string;
  booking_date: string;
  created_date: string;
}

export interface CustomerDetailResponse {
  success: boolean;
  consultations?: ConsultationOrder[];
  orders?: PharmacyOrder[] | HomecareOrder[] | LabTestBooking[];
  message?: string;
}

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
  birthday?: string;
  gender?: string;
  age?: {
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

export interface CustomerDetail extends Customer {
  age?: {
    years: number;
    months: number;
    days: number;
  };
  birthday?: string;
  gender?: string;
}
