const API_BASE_URL = process.env.NEXT_PUBLIC_HOMECARE_API_BASE_URL;
export enum EnumCodes {
  LAB_TEST_BODY_PARTS = "LAB_TEST_BODY_PARTS",
  LAB_TEST_SAMPLE = "LAB_TEST_SAMPLE",
  LAB_TEST_CATEGORY = "LAB_TEST_CATEGORY",
  LAB_TEST_MODALITY = "LAB_TEST_MODALITY",
  DAYS_IN_WEEK = "DAYS_IN_WEEK",
  PHLEBO_SPECIALIZATION = "PHLEBO_SPECIALIZATION",
  SERVICE_CITY = "SERVICE_CITY",
  SERVICE_AREA = "SERVICE_AREA",
  DELIVERY_VEHICLE_TYPE = "DELIVERY_VEHICLE_TYPE",
  RIDER_DELIVERY_STATUS = "RIDER_DELIVERY_STATUS",
  PRODUCT_RELATION_TYPE = "PRODUCT_RELATION_TYPE",
  PAYMENT_MODE = "PAYMENT_MODE",
  PAYMENT_STATUS = "PAYMENT_STATUS",
  INDIAN_LANGUAGE = "INDIAN_LANGUAGE",
  ORDER_STATUS = "ORDER_STATUS",
}
export interface EnumItem {
  id: string;
  slno: number;
  code: string;
  value: string;
  description: string | null;
  metadata: any | null;
}

export interface EnumResponse {
  success: boolean;
  roles: EnumItem[];
}

export async function fetchEnums(
  code: EnumCodes,
  token: string
): Promise<EnumResponse> {
  const response = await fetch(`${API_BASE_URL}/api/lookup/enums`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}
