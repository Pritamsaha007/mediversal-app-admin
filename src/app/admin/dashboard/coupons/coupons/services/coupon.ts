import { useAdminStore } from "@/app/store/adminStore";
import { CouponItem } from "@/app/types/auth.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
  const { token } = useAdminStore.getState();
  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

export const getAllCoupons = async (): Promise<CouponItem[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch coupons:", errorData);
    throw new Error(errorData?.message || "Failed to fetch coupons");
  }

  return await response.json();
};

export const createCoupon = async (coupon: CouponItem): Promise<CouponItem> => {
  const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(coupon),
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    console.error("❌ Failed to create coupon:", {
      status: response.status,
      statusText: response.statusText,
      body: coupon,
      error: errorData,
    });

    throw new Error(
      errorData?.message ||
        `Failed to create coupon (status: ${response.status})`
    );
  }

  return await response.json();
};

export const updateCoupon = async (coupon: CouponItem): Promise<CouponItem> => {
  const response = await fetch(`${API_BASE_URL}/admin/coupons/${coupon.id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(coupon),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to update coupon:", errorData);
    throw new Error(errorData?.message || "Failed to update coupon");
  }

  return await response.json();
};

export const deleteCoupon = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to delete coupon:", errorData);
    throw new Error(errorData?.message || "Failed to delete coupon");
  }
};
