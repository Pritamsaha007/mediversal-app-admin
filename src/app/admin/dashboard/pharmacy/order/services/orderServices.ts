import axios from "axios";
import { Order, ApiResponse, FilterOptions, SortOption } from "../types/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/app/api";

export class OrderService {
  static async fetchOrders(): Promise<Order[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/order`);
      console.log("Fetched orders:", response.data);

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
      order.TotalOrderAmount !== undefined &&
      !isNaN(order.TotalOrderAmount)
    ) {
      return order.TotalOrderAmount;
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
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          order.orderId.toString().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.customerEmail.toLowerCase().includes(searchLower) ||
          order.customerPhone.includes(searchLower);

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
      const response = await axios.delete(`${API_BASE_URL}/order/${orderId}`);
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
        console.error(
          `Delete failed - Status: ${status}, StatusText: ${statusText}`
        );
        throw new Error(`Failed to delete order: ${status} ${statusText}`);
      }
      throw new Error("Failed to delete order");
    }
  }

  static async bulkDeleteOrders(orderIds: number[]): Promise<void> {
    try {
      const deletePromises = orderIds.map((id) =>
        axios.delete(`${API_BASE_URL}/order/${id}`)
      );
      await Promise.all(deletePromises);
      console.log("Bulk delete completed for orders:", orderIds);
    } catch (error) {
      console.error("Error bulk deleting orders:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to bulk delete orders: ${error.response?.status} ${error.response?.statusText}`
        );
      }
      throw new Error("Failed to bulk delete orders");
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
