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
