export interface PatientDetails {
  name: string;
  age: number;
  gender: string;
}

export interface PatientDetailsList {
  patients_list: PatientDetails[];
}

export interface LabTestBooking {
  id: string;
  customer_id: string | null;
  labtestnames: string[];
  patient_details: PatientDetailsList;
  status: string;
  payment_status: string;
  amount: string;
  booking_date: string;
  created_date: string;
  total_bookings_count?: string;
  total_revenue?: string;
  today_revenue?: string;
  total_order_amount?: string;
}

export interface SearchLabTestBookingsPayload {
  start: number;
  max: number | null;
  search_text?: string | null;
  filter_status?: string[] | null;
  filter_payment_status?: string[] | null;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export interface SearchLabTestBookingsResponse {
  success: boolean;
  labTestBookings: LabTestBooking[];
}
export interface UpdateLabTestBookingPayload {
  id: string;
  status_id?: string;
  customer_id?: string;
  lab_test_ids?: string[];
  health_package_ids?: string[];
  hospital_id?: string;
  price?: number;
  coupon_id?: string | null;
  medicash_wallet_used_total?: number;
  can_sample_collected_at_home?: boolean;
  patient_details?: {
    patients_list: Array<{
      name: string;
      age: number;
      gender: string;
    }>;
  };
  house_no?: string;
  area?: string;
  landmark?: string;
  pincode?: string;
  city?: string;
  state_id?: string;
  address_type_id?: string;
  address_line1?: string;
  address_line2?: string;
  recepient_name?: string;
  recepient_phone?: string;
  report_url?: string;
  report_received_date?: string;
  booking_date?: string;
  booking_time?: number;
  updated_by?: string;
  phlebotomist_id?: string;
}

export interface UpdateLabTestBookingResponse {
  success: boolean;
  message?: string;
}
export interface PhlebotomistSlot {
  phlebo_id: string;
  phlebo_name: string;
  specialization_name: string;
  rating: string;
  experience_in_yrs: number;
  slot_date: string;
  slot_day: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  available_count: number;
  status: string;
}

export interface AvailableSlotsResponse {
  success: boolean;
  slots: PhlebotomistSlot[];
}
export interface BookingDetailsResponse {
  success: boolean;
  booking: {
    id: string;
    customer_id: string;
    status: {
      id: string;
      value: string;
    };
    lab_tests: Array<{
      id: string;
      name: string;
      description: string;
      code: string;
      category: {
        id: string;
        value: string;
      };
      sample_types: any;
      report_time_hrs: number;
      cost_price: number;
      selling_price: number;
      is_fasting_reqd: boolean | null;
      is_featured_lab_test: boolean | null;
      is_home_collection_available: boolean;
      is_active: boolean;
      total_order_amount: number;
    }>;
    health_packages: any;
    hospital: any;
    coupon: any;
    state: any;
    address_type: any;
    phlebotomist: {
      id: string;
      name: string;
      service_city: {
        id: string;
        value: string;
      };
      license_no: string;
      is_home_collection_certified: boolean;
    } | null;
    price: string;
    payment_status: string;
    booking_date: string;
    booking_time: number;
    can_sample_collected_at_home: boolean;
    patient_details: {
      patients_list: Array<{
        name: string;
        age: number;
        gender: string;
      }>;
    };
    house_no: string;
    area: string;
    landmark: string;
    pincode: string;
    city: string;
    address_line1: string | null;
    address_line2: string | null;
    recepient_name: string;
    recepient_phone: string;
    report_url: string | null;
    report_received_date: string;
    created_date: string;
    updated_date: string;
    total_order_amount: string | undefined;
  };
}
