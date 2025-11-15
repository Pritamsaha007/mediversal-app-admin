export interface DetailedBooking {
  id: string;
  actualOrderId: string;
  bookingId: string;
  date: string;
  customer: {
    name: string;
    customer_id: string;
    location: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    address: string;
  };
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  payment: "Partial Payment" | "Paid" | "Refunded";
  service: string;
  serviceDetails: {
    name: string;
    description: string;
    pricePerDay: number;
  };
  total: number;
  gst: number;
  priority: "High Priority" | "Medium Priority" | "Low Priority";
  scheduled: string;
  duration: string;
  currentMedication: string;
  medicalCondition: string;
  emergencyContact: {
    name: string;
    number: string;
  };
  assignedStaff: string | null;
  rawDate: Date;
  recipt_url: string;
}
export interface CreateOrderPayload {
  customer_id: string;
  homecare_service_offering_id: string;
  order_total: string;
  order_status: string;
  schedule_in_days: string;
  schedule_in_hours: string;
  order_details: {
    Patient_name: string;
    Age: string;
    "Medical Information": {
      [key: string]: string;
    };
    "Contact & Location": {
      "Service Address": string;
      "Contact Person Name": string;
      "Contact Number": string;
      "Emergency Contact": string;
      "Date & Time": string;
      Email: string;
    };
  };
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

export interface GetOfferingsParams {
  status?: string | null;
  service_id?: string | null;
  offering_name?: string | null;
}
export interface StaffResponse {
  id: string;
  name: string;
  mobile_number: string;
  role_name: string;
  email: string;
  experience_in_yrs: number;
  experience_in_months: number;
  experience_in_days: number;
  specializations: string[];
  certifications: string[];
  rating: string;
  profile_image_url: string;
  availability_status: string;
}

export interface GetStaffResponse {
  success: boolean;
  staffs: StaffResponse[];
}

export interface GetStaffParams {
  search?: string | null;
  start?: string | null;
  max?: string | null;
}

export interface AssignStaffPayload {
  orderId: string;
  staffId: string;
  userId: string | null;
}

export interface AssignStaffResponse {
  success: boolean;
  message?: string;
}
export interface OrdersPayload {
  customer_id: string | null;
  serach: string | null;
  filter_order_status: string | null;
}

export interface ApiOrderResponse {
  id: string;
  customer_id: string;
  homecare_service_id: string;
  schedule_in_days: number;
  schedule_in_hours: number;
  order_total: string;
  paid_amount: string;
  order_status: string;
  order_date: string | null;
  order_time: string | null;
  payment_status: string;
  order_status_name: string;
  homecare_service_name: string;
  customer_name: string;
  recipt_url: string;
  customer_details: {
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  };
}

export interface GetOrdersResponse {
  success: boolean;
  orders: ApiOrderResponse[];
}
export interface OrderDetailResponse {
  success: boolean;
  order: {
    id: string;
    customer_id: string;
    schedule_in_days: number;
    schedule_in_hours: number;
    order_details: string;
    order_total: string;
    paid_amount: string;
    order_date: string;
    order_time: string;
    payment_status: string;
    order_status: string;
    staff_details: any[];
    service_details: {
      homecare_service_id: string;
      homecare_service_name: string;
      homecare_service_description: string;
      homecare_service_offering_name: string;
      homecare_service_offering_price: number;
      duration_in_hrs: number;
      duration_type: string;
      description: string;
      staff_requirements: string[];
      equipment_requirements: string[];
      features: string[];
      is_device: boolean;
      device_stock_count: number | null;
    };
    customer_details: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string | null;
      address_line1: string | null;
      address_line2: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      country: string | null;
      registration_date: string;
      birthday: string | null;
      created_date: string;
      updated_date: string;
      is_deleted: boolean;
    };
  };
}
export interface UnassignStaffPayload {
  orderId: string;
  staffId: string;
}
