import { CouponItem } from "@/app/types/auth.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllCoupons = async (): Promise<CouponItem[]> => {
  const response = await fetch(`${API_BASE_URL}/app/admin/coupons`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch coupons:", errorData);
    throw new Error(errorData?.message || "Failed to fetch coupons");
  }

  return await response.json();
};

export const createCoupon = async (coupon: CouponItem): Promise<CouponItem> => {
  const response = await fetch(`${API_BASE_URL}/app/admin/coupons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(coupon),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to create coupon:", errorData);
    throw new Error(errorData?.message || "Failed to create coupon");
  }

  return await response.json();
};
export const updateCoupon = async (coupon: CouponItem): Promise<CouponItem> => {
  const response = await fetch(
    `${API_BASE_URL}/app/admin/coupons/${coupon.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(coupon),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to update coupon:", errorData);
    throw new Error(errorData?.message || "Failed to update coupon");
  }

  return await response.json();
};

export const deleteCoupon = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/app/admin/coupons/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to delete coupon:", errorData);
    throw new Error(errorData?.message || "Failed to delete coupon");
  }
};
