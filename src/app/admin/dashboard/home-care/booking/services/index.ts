import {
  AssignStaffPayload,
  AssignStaffResponse,
  CreateOrderPayload,
  GetOfferingsParams,
  GetOfferingsResponse,
  GetOrdersResponse,
  GetStaffParams,
  GetStaffResponse,
  OrderDetailResponse,
  OrdersPayload,
  UnassignStaffPayload,
} from "../types";

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

export interface updateOrderPayload {
  id: string;
  customer_id: string;
  order_status: string;
}

export async function updateOrder(
  payload: updateOrderPayload,
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

export async function getOrderById(
  orderId: string,
  token: string
): Promise<OrderDetailResponse> {
  const response = await fetch(
    `${HOMECARE_API_BASE_URL}/api/homecare/orders/${orderId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
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

export async function unassignStaffFromOrder(
  payload: UnassignStaffPayload,
  token: string
): Promise<AssignStaffResponse> {
  console.log(
    "Making DELETE request to:",
    `${HOMECARE_API_BASE_URL}/api/homecare/order/staff`
  );
  console.log("Payload:", payload);
  console.log("Token:", token ? "Present" : "Missing");

  const response = await fetch(
    `${HOMECARE_API_BASE_URL}/api/homecare/order/staff`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  console.log("Response status:", response.status);
  console.log("Response ok:", response.ok);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      console.log("Error response data:", errorData);
    } catch (jsonError) {
      console.error("Failed to parse error response as JSON:", jsonError);
      errorData = {};
    }

    throw new Error(
      errorData?.message ||
        errorData?.error ||
        `HTTP error! status: ${response.status}`
    );
  }

  const result = await response.json();
  console.log("Success response:", result);
  return result;
}
