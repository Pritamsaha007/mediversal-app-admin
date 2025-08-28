const HOMECARE_API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;

export interface OrderStatusResponse {
  success: boolean;
  roles: Array<{
    id: string;
    value: string;
    code: string;
    slno: number;
  }>;
}

export async function getOrderStatus(
  token: string
): Promise<OrderStatusResponse> {
  const response = await fetch(`${HOMECARE_API_BASE_URL}/api/lookup/enums`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: null,
      code: "ORDER_STATUS",
      value: null,
      sort_by: null,
      sort_order: null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
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
    };
  };
}

export async function createOrder(
  payload: CreateOrderPayload,
  token: string
): Promise<{ success: boolean; order?: any; message?: string }> {
  const response = await fetch(`${HOMECARE_API_BASE_URL}/api/homecare/order`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
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

export async function getHomecareOfferings(
  params: GetOfferingsParams = {},
  token: string
): Promise<GetOfferingsResponse> {
  const { status = null, service_id = null, offering_name = null } = params;

  const url = new URL(`${HOMECARE_API_BASE_URL}/api/homecare/offerings`);
  url.searchParams.append("status", status?.toString() || "null");
  url.searchParams.append("service_id", service_id?.toString() || "null");
  url.searchParams.append("offering_name", offering_name?.toString() || "null");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
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

export async function getHomecareStaff(
  params: GetStaffParams = {},
  token: string
): Promise<GetStaffResponse> {
  const { search = null, start = null, max = null } = params;

  const url = new URL(`${HOMECARE_API_BASE_URL}/api/homecare/staff`);
  url.searchParams.append("search", search?.toString() || "null");
  url.searchParams.append("start", start?.toString() || "null");
  url.searchParams.append("max", max?.toString() || "null");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
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

export async function assignStaffToOrder(
  payload: AssignStaffPayload,
  token: string
): Promise<AssignStaffResponse> {
  const response = await fetch(
    `${HOMECARE_API_BASE_URL}/api/homecare/order/staff`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
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

export async function getHomecareOrders(
  payload: OrdersPayload,
  token: string
): Promise<GetOrdersResponse> {
  const response = await fetch(`${HOMECARE_API_BASE_URL}/api/homecare/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}
