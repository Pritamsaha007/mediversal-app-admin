import axios from "axios";
import {
  Order,
  ApiResponse,
  FilterOptions,
  SortOption,
  TrackingData,
  CreateOrderRequest,
  CreateOrderResponse,
  ServiceabilityRequest,
  ServiceabilityResponse,
} from "../types/types";
import { useAdminStore } from "@/app/store/adminStore";
import { updateOrderRiderInfo } from "../../../rider/services";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const RAPID_SHYP_API_URL = process.env.NEXT_PUBLIC_RAPID_SHYP_API_URL;
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_RAPID_SHYP_ACCESS_TOKEN;

const getAuthHeaders = () => {
  const { token } = useAdminStore.getState();
  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

export class OrderService {
  static checkAllowedMethods(Id: number) {
    throw new Error("Method not implemented.");
  }

  // In your OrderService class
  static async fetchOrders(params?: {
    search?: string;
    start?: number;
    max?: number;
    sort_by?: string;
    sort_order?: string;
    status?: string;
    payment?: string;
  }): Promise<{ orders: Order[]; totalCount: number }> {
    try {
      const { token } = useAdminStore.getState();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const requestBody = {
        search: params?.search || "",
        max: params?.max || 200,
        start: params?.start || 0,
        sort_by: params?.sort_by || "created_date",
        sort_order: params?.sort_order || "ASC",
        status: params?.status || "",
        payment: params?.payment || "",
      };

      console.log("Request body:", requestBody);

      const response = await axios.post(
        `${API_BASE_URL}/api/order`,
        requestBody,
        {
          headers: getAuthHeaders(),
        },
      );

      console.log("API Response:", response.data);

      let orders: Order[] = [];
      let totalCount = 0;

      if (Array.isArray(response.data)) {
        orders = response.data;
        totalCount = response.data.length;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        orders = response.data.data;
        totalCount = response.data.data.length;
      } else if (response.data.orders && Array.isArray(response.data.orders)) {
        orders = response.data.orders;
        totalCount = response.data.orders.length;
        // If the API provides total count separately, use it
        if (response.data.totalCount !== undefined) {
          totalCount = response.data.totalCount;
        } else if (response.data.total !== undefined) {
          totalCount = response.data.total;
        }
      } else {
        throw new Error("Invalid response format");
      }

      return { orders, totalCount };
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
        throw new Error(
          `Failed to fetch orders: ${error.response?.status} ${error.response?.statusText} - ${error.response?.data?.message}`,
        );
      }
      throw new Error("Failed to fetch orders");
    }
  }

  static calculateTotalAmount(order: Order): number {
    if (
      order.totalorderamount !== null &&
      order.totalorderamount !== undefined
    ) {
      const amount = parseFloat(order.totalorderamount);
      if (!isNaN(amount)) {
        return amount;
      }
    }

    if (order.order_items && Array.isArray(order.order_items)) {
      return order.order_items.reduce((total, item) => {
        const price = item.sellingPrice;
        const quantity = item.quantity || 0;
        return total + price * quantity;
      }, 0);
    }

    return 0;
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  static getOrderStatus(order: Order): string {
    if (order.is_cancel_clicked == true) {
      return "CANCELLED";
    } else {
      return order.deliverystatus || "Not Provided";
    }
  }
  static requiresRiderDropdown(order: Order): boolean {
    const city = order.billing_city?.trim().toLowerCase();
    return ["patna", "begusarai"].includes(city || "");
  }
  static async updateRiderDeliveryStatus(
    orderId: string,
    status: string,
    token: string,
  ): Promise<void> {
    try {
      const payload = {
        id: orderId,
        order_status: status,
        rider_staff_id: "",
        rider_delivery_status_id: "",
      };
      await updateOrderRiderInfo(payload, token);
    } catch (error) {
      console.error("Failed to update rider delivery status:", error);
      throw error;
    }
  }
  static filterOrders(orders: Order[], filters: FilterOptions): Order[] {
    return orders.filter((order) => {
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          (order.id && order.id.toString().includes(searchLower)) ||
          (order.customername &&
            order.customername.toLowerCase().includes(searchLower)) ||
          (order.customeremail &&
            order.customeremail.toLowerCase().includes(searchLower)) ||
          (order.customerphone && order.customerphone.includes(searchLower));

        if (!matchesSearch) return false;
      }

      // Status filter - fixed logic
      if (filters.status && filters.status !== "All Statuses") {
        const orderStatus = this.getOrderStatus(order);
        if (orderStatus !== filters.status) return false;
      }

      // Payment filter - fixed logic
      if (filters.payment && filters.payment !== "All Payments") {
        // Make sure we're comparing the correct payment status
        if (order.paymentstatus !== filters.payment) return false;
      }

      return true;
    });
  }

  static sortOrders(orders: Order[], sortBy: SortOption): Order[] {
    const sortedOrders = [...orders];

    switch (sortBy) {
      case "Order Total (Low to High)":
        return sortedOrders.sort(
          (a, b) => this.calculateTotalAmount(a) - this.calculateTotalAmount(b),
        );

      case "Order Total (High to Low)":
        return sortedOrders.sort(
          (a, b) => this.calculateTotalAmount(b) - this.calculateTotalAmount(a),
        );

      case "Order Date (Latest)":
        return sortedOrders.sort(
          (a, b) =>
            new Date(b.created_date).getTime() -
            new Date(a.created_date).getTime(),
        );

      case "Order Date (Oldest)":
        return sortedOrders.sort(
          (a, b) =>
            new Date(a.created_date).getTime() -
            new Date(b.created_date).getTime(),
        );

      case "By Order Status":
        return sortedOrders.sort((a, b) =>
          this.getOrderStatus(a).localeCompare(this.getOrderStatus(b)),
        );

      case "By Payment Status":
        return sortedOrders.sort((a, b) =>
          a.paymentstatus.localeCompare(b.paymentstatus),
        );

      default:
        return sortedOrders;
    }
  }

  static async deleteOrder(orderId: number): Promise<void> {
    try {
      console.log(`Attempting to delete order: ${orderId}`);
      const response = await axios.delete(
        `${API_BASE_URL}/api/order/${orderId}`,
        {
          headers: getAuthHeaders(),
          timeout: 10000, // 10 second timeout
        },
      );
      console.log("Delete response:", response.status, response.data);

      if (response.status === 200 || response.status === 204) {
        console.log(`Order ${orderId} deleted successfully`);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;
        const errorMessage = error.response?.data?.message || error.message;
        console.error(
          `Delete failed - Status: ${status}, StatusText: ${statusText}, Message: ${errorMessage}`,
        );

        if (error.code === "ERR_NETWORK") {
          throw new Error(
            "Network error: Unable to connect to the server. Please check your internet connection.",
          );
        } else if (status === 404) {
          throw new Error(`Order ${orderId} not found`);
        } else if (status === 405) {
          throw new Error("Delete method not allowed on this endpoint");
        } else {
          throw new Error(
            `Failed to delete order: ${status} ${statusText} - ${errorMessage}`,
          );
        }
      }
      throw new Error("Failed to delete order");
    }
  }

  static async bulkDeleteOrders(orderIds: number[]): Promise<void> {
    try {
      console.log("Starting bulk delete for orders:", orderIds);

      // Process deletions one by one to better handle errors
      const results = [];
      for (const orderId of orderIds) {
        try {
          await this.deleteOrder(orderId);
          results.push({ orderId, success: true });
        } catch (error) {
          console.error(`Failed to delete order ${orderId}:`, error);
          results.push({ orderId, success: false, error });
        }
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      console.log(
        `Bulk delete completed: ${successful} successful, ${failed} failed`,
      );

      if (failed > 0) {
        throw new Error(
          `Bulk delete partially failed: ${failed} orders could not be deleted`,
        );
      }
    } catch (error) {
      console.error("Error bulk deleting orders:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to bulk delete orders");
    }
  }

  static generateOrderStats(orders: Order[]) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = Number(order.totalorderamount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const cancelledAmount = orders.reduce((sum, order) => {
      if (order.deliverystatus?.toUpperCase() === "CANCELLED") {
        const amount = Number(order.totalorderamount);
        return sum + (isNaN(amount) ? 0 : amount);
      }
      return sum;
    }, 0);

    const finalRevenue = totalRevenue - cancelledAmount;

    const pendingDelivery = orders.filter((order) => {
      const status = this.getOrderStatus(order);
      return (
        status.toLowerCase() !== "completed" &&
        status.toLowerCase() !== "cancelled" &&
        status.toLowerCase() != "delivered"
      );
    }).length;

    const prescriptionVerification = orders.filter(
      (order) => order.prescriptionurl !== null,
    ).length;

    return {
      totalOrders,
      totalRevenue: isNaN(finalRevenue) ? 0 : finalRevenue,
      pendingDelivery,
      prescriptionVerification,
    };
  }
  static exportToCSV(orders: Order[]): void {
    if (orders.length === 0) {
      alert("No orders to export");
      return;
    }

    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Total Amount",
      "Payment Status",
      "Payment Method",
      "Order Status",
      "Billing Address",
      "Billing City",
      "Billing State",
      "Billing Pincode",
      "Assigned Rider",
    ];

    const csvContent = [
      headers.join(","),
      ...orders.map((order) =>
        [
          order.id?.slice(0, 6).toUpperCase() || "",
          `"${order.customername || "Guest User"}"`,
          order.customeremail || "",
          order.customerphone || "",
          this.calculateTotalAmount(order),
          order.paymentstatus || "",
          order.paymentmethod || "",
          order.deliverystatus || "",
          `"${order.billing_address_2 || ""}"`,
          order.billing_city || "",
          order.billing_state || "",
          order.billing_pincode || "",
          `"${order.rider_staff_name || "Not Assigned"}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const trackOrders = async (seller_order_id: number, awb: string) => {
  try {
    const response = await axios.post(
      `${RAPID_SHYP_API_URL}/track_order`,
      {
        seller_order_id,
        awb,
      },
      {
        headers: {
          "content-type": "application/json",
          "rapidshyp-token": ACCESS_TOKEN,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Tracking failed:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};
export const cancelOrder = async (orderId: string, reason: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/order/cancel-order`,
      {
        orderId: orderId,
        storeName: "DEFAULT",
        reason: reason,
      },
      {
        headers: getAuthHeaders(),
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Order cancellation failed:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};
export interface CancelOrderRequest {
  orderId: string;
  orderStatus: "Return Requested" | "Cancelled";
  reason: string;
}

export interface CancelOrderResponse {
  messageResData: {
    $metadata: {
      httpStatusCode: number;
      requestId: string;
      attempts: number;
      totalRetryDelay: number;
    };
    MD5OfMessageBody: string;
    MessageId: string;
    SequenceNumber: string;
  };
}

export const cancelShiprocketOrder = async (
  requestData: CancelOrderRequest,
): Promise<CancelOrderResponse> => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/v1/shiprocket/order`,
      requestData,
      {
        headers: getAuthHeaders(),
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error in cancelling Shiprocket order:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("API Error Status:", error.response.status);
        console.error("API Error Data:", error.response.data);
      }
    }

    throw error;
  }
};

export interface TrackingResponse {
  tracking_data: TrackingData;
}

export const getTracking = async (awb: string): Promise<TrackingResponse> => {
  try {
    const response = await axios.get<TrackingResponse>(
      `${API_BASE_URL}/api/v1/shiprocket/order/tracking?awb=${awb}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch tracking data: ${error}`);
  }
};
export const checkServiceability = async (
  token: string | undefined,
  requestData: ServiceabilityRequest,
): Promise<ServiceabilityResponse> => {
  try {
    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams({
      pickup_postcode: requestData.pickup_postcode,
      delivery_postcode: requestData.delivery_postcode,
      cod: requestData.cod.toString(),
      weight: requestData.weight.toString(),
    }).toString();

    const response = await axios.get(
      `${API_BASE_URL}/api/v1/shiprocket/serviceability?${queryParams}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error in checking serviceability:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("API Error Status:", error.response.status);
        console.error("API Error Data:", error.response.data);
      }
    }

    throw error;
  }
};

export const createShiprocketOrder = async (
  token: string | undefined,
  isRequired: boolean,
  requestData: CreateOrderRequest,
): Promise<CreateOrderResponse> => {
  try {
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/shiprocket/order?isShiprocketOrderReqd=${isRequired}`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error in creating Shiprocket order:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("API Error Status:", error.response.status);
        console.error("API Error Data:", error.response.data);
      } else if (error.request) {
        console.error("Network Error - No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
    }

    throw error;
  }
};
export const BookingForPatna = async (
  token: string | undefined,
  pincode: number | undefined,
) => {
  try {
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/shiprocket/order/ispatna/${pincode}`,

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error in creating Patna booking:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("API Error Status:", error.response.status);
        console.error("API Error Data:", error.response.data);
      }
    }

    throw error;
  }
};
