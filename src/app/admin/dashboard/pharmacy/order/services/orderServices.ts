import { Order, ApiResponse, FilterOptions, SortOption } from "../types/types";

const API_BASE_URL =
  "https://3st0jw58p8.execute-api.ap-south-1.amazonaws.com/app/api";

export class OrderService {
  static async fetchOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/order`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched ordershhhhhhhh:", data);

      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw new Error("Failed to fetch orders");
    }
  }

  static calculateTotalAmount(order: Order): number {
    if (order.TotalOrderAmount !== null) {
      return order.TotalOrderAmount;
    }

    // Calculate from items if TotalOrderAmount is null
    return order.items.reduce((total, item) => {
      return total + parseFloat(item.sellingPrice) * item.quantity;
    }, 0);
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
    return order.deliverystatus || "Pending";
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

      // Status filter
      if (filters.status !== "All Statuses") {
        const orderStatus = this.getOrderStatus(order);
        if (orderStatus !== filters.status) return false;
      }

      // Payment filter
      if (filters.payment !== "All Payments") {
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
      const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      throw new Error("Failed to delete order");
    }
  }

  static async cancelOrder(orderId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/order/${orderId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Cancelled" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw new Error("Failed to cancel order");
    }
  }

  static generateOrderStats(orders: Order[]) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + this.calculateTotalAmount(order),
      0
    );
    const pendingDelivery = orders.filter(
      (order) =>
        this.getOrderStatus(order) !== "Delivered" &&
        this.getOrderStatus(order) !== "Cancelled"
    ).length;
    const prescriptionVerification = orders.filter(
      (order) => order.items.some((item) => item.productId) // Assuming prescription verification logic
    ).length;

    return {
      totalOrders,
      totalRevenue,
      pendingDelivery,
      prescriptionVerification,
    };
  }
}
