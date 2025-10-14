import axios from "axios";
import {
  Order,
  ApiResponse,
  FilterOptions,
  SortOption,
  TrackingData,
} from "../types/types";
import { useAdminStore } from "@/app/store/adminStore";

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
  static async fetchOrders(): Promise<Order[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/order`, {
        headers: getAuthHeaders(),
      });

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to fetch orders: ${error.response?.status} ${error.response?.statusText}`
        );
      }
      throw new Error("Failed to fetch orders");
    }
  }

  static calculateTotalAmount(order: Order): number {
    if (
      order.TotalOrderAmount !== null &&
      order.TotalOrderAmount !== undefined
    ) {
      const amount = parseFloat(order.TotalOrderAmount);
      if (!isNaN(amount)) {
        return amount;
      }
    }

    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((total, item) => {
        const price = parseFloat(item.sellingPrice) || 0;
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
    return order.deliverystatus || "Not Provided";
  }

  static filterOrders(orders: Order[], filters: FilterOptions): Order[] {
    return orders.filter((order) => {
      // Search filter - with null/undefined checks
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          (order.id && order.id.toString().includes(searchLower)) ||
          (order.customerName &&
            order.customerName.toLowerCase().includes(searchLower)) ||
          (order.customerEmail &&
            order.customerEmail.toLowerCase().includes(searchLower)) ||
          (order.customerPhone && order.customerPhone.includes(searchLower));

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
        if (order.paymentStatus !== filters.payment) return false;
      }

      return true;
    });
  }

  static sortOrders(orders: Order[], sortBy: SortOption): Order[] {
    const sortedOrders = [...orders];

    switch (sortBy) {
      case "Order Total (Low to High)":
        return sortedOrders.sort(
          (a, b) => this.calculateTotalAmount(a) - this.calculateTotalAmount(b)
        );

      case "Order Total (High to Low)":
        return sortedOrders.sort(
          (a, b) => this.calculateTotalAmount(b) - this.calculateTotalAmount(a)
        );

      case "Order Date (Latest)":
        return sortedOrders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case "Order Date (Oldest)":
        return sortedOrders.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

      case "By Order Status":
        return sortedOrders.sort((a, b) =>
          this.getOrderStatus(a).localeCompare(this.getOrderStatus(b))
        );

      case "By Payment Status":
        return sortedOrders.sort((a, b) =>
          a.paymentStatus.localeCompare(b.paymentStatus)
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
        }
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
          `Delete failed - Status: ${status}, StatusText: ${statusText}, Message: ${errorMessage}`
        );

        if (error.code === "ERR_NETWORK") {
          throw new Error(
            "Network error: Unable to connect to the server. Please check your internet connection."
          );
        } else if (status === 404) {
          throw new Error(`Order ${orderId} not found`);
        } else if (status === 405) {
          throw new Error("Delete method not allowed on this endpoint");
        } else {
          throw new Error(
            `Failed to delete order: ${status} ${statusText} - ${errorMessage}`
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
        `Bulk delete completed: ${successful} successful, ${failed} failed`
      );

      if (failed > 0) {
        throw new Error(
          `Bulk delete partially failed: ${failed} orders could not be deleted`
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

    // Calculate total revenue with better error handling
    const totalRevenue = orders.reduce((sum, order) => {
      const orderAmount = Number(order.TotalOrderAmount);
      return sum + (isNaN(orderAmount) ? 0 : orderAmount);
    }, 0);

    // Count orders that are not delivered or cancelled
    const pendingDelivery = orders.filter((order) => {
      const status = this.getOrderStatus(order);
      return status !== "Delivered" && status !== "Cancelled";
    }).length;

    const prescriptionVerification = orders.filter(
      (order) =>
        order.items && Array.isArray(order.items) && order.items.length > 0
    ).length;

    return {
      totalOrders,
      totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
      pendingDelivery,
      prescriptionVerification,
    };
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
      }
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
      }
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
  requestData: CancelOrderRequest
): Promise<CancelOrderResponse> => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/v1/shiprocket/order`,
      requestData,
      {
        headers: getAuthHeaders(),
      }
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
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch tracking data: ${error}`);
  }
};
