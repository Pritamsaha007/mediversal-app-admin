import axios, { AxiosInstance, AxiosError } from "axios";
import { useAdminStore } from "@/app/store/adminStore";
import {
  ConsultationOrder,
  CustomerDetailResponse,
  HomecareOrder,
  LabTestBooking,
  PharmacyOrder,
  SearchCustomersRequest,
  SearchCustomersResponse,
  CustomerMetricsResponse,
  Customer,
  CreateCustomerRequest,
  CreateCustomerResponse,
  CustomerDetail,
} from "../type/customerDetailTypes";

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
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  client.interceptors.request.use(
    (config) => {
      const headers = getAuthHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        config.headers.set(key, value);
      });
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        console.error("API Error:", error.response.data);
      } else if (error.request) {
        console.error("Network Error:", error.request);
      } else {
        console.error("Error:", error.message);
      }
      return Promise.reject(error);
    }
  );

  return client;
};
export class CustomerService {
  static async searchCustomers(
    search: string = "",
    start: number = 0,
    max: number = 20,
    retries: number = 2
  ): Promise<SearchCustomersResponse> {
    try {
      const apiClient = createApiClient();
      const requestBody: SearchCustomersRequest = {
        search: search.trim(),
        start,
        max,
      };
      const response = await apiClient.post<SearchCustomersResponse>(
        "/api/customer/search",
        requestBody
      );
      const sanitizedCustomers = response.data.customers.map((customer) => ({
        ...customer,
        email: customer.email ?? "",
        phone_number: customer.phone_number ?? "",
        city: customer.city ?? "",
        state: customer.state ?? "",
        country: customer.country ?? "",
        total_spent: customer.total_spent ?? 0,
        total_orders: customer.total_orders ?? "0",
        status: customer.status ?? "Inactive",
      }));
      return {
        success: response.data.success,
        customers: sanitizedCustomers,
        total_count: response.data.total_count || 0,
      };
    } catch (error) {
      if (retries > 0 && axios.isAxiosError(error) && !error.response) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.searchCustomers(search, start, max, retries - 1);
      }
      throw new Error("An unexpected error occurred while fetching customers");
    }
  }
  static async getCustomerMetrics(): Promise<CustomerMetricsResponse> {
    try {
      const apiClient = createApiClient();

      const response = await apiClient.get<CustomerMetricsResponse>(
        "/api/customer/metrics"
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch customer metrics");
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch customer metrics";
        console.error("Failed to fetch customer metrics:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          error: error.response?.data,
        });
        throw new Error(errorMessage);
      }
      throw new Error("An unexpected error occurred while fetching metrics");
    }
  }
  static formatCurrency(amount: number | null): string {
    if (amount === null || amount === undefined) {
      return "₹ 0.00";
    }

    return `₹ ${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  static formatDate(dateString: string): string {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  }
  static getFullName(customer: Customer): string {
    const firstName = customer.first_name || "";
    const lastName = customer.last_name || "";
    return `${firstName} ${lastName}`.trim() || "Unknown Customer";
  }
  static isActive(customer: Customer): boolean {
    return customer.status?.toLowerCase() === "active";
  }
  static getLifetimeValue(customer: Customer): number {
    return customer.total_spent ?? 0;
  }
  static exportToCSV(customers: Customer[]): void {
    if (customers.length === 0) {
      alert("No customers to export");
      return;
    }

    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "City",
      "State",
      "Country",
      "Status",
      "Total Spent",
      "Total Orders",
      "Membership Date",
    ];

    const csvContent = [
      headers.join(","),
      ...customers.map((customer) =>
        [
          customer.id,
          customer.first_name,
          customer.last_name,
          customer.email,
          customer.phone_number,
          customer.city,
          customer.state,
          customer.country,
          customer.status,
          customer.total_spent ?? 0,
          customer.total_orders,
          this.formatDate(customer.membership_date),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `customers_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  static async createCustomer(
    data: Partial<CreateCustomerRequest>
  ): Promise<CreateCustomerResponse> {
    try {
      const apiClient = createApiClient();
      const requestBody: CreateCustomerRequest = {
        id: "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        birthday: data.birthday || "",
        is_enabled: true,
        profile_pic_url: "",
        last_logged_in_at: new Date().toISOString(),
        blood_grp: "",
        gender: data.gender || "",
      };

      const response = await apiClient.post<CreateCustomerResponse>(
        "/api/customer",
        requestBody
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to create customer";
        console.error("Failed to create customer:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          error: error.response?.data,
        });
        throw new Error(errorMessage);
      }
      throw new Error("An unexpected error occurred while creating customer");
    }
  }
  static async getConsultationOrders(
    customerId: string
  ): Promise<ConsultationOrder[]> {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.post<CustomerDetailResponse>(
        "/api/clinic/consultations",
        { customer_id: customerId }
      );

      return response.data.consultations || [];
    } catch (error) {
      console.error("Failed to fetch consultation orders:", error);
      return [];
    }
  }
  static async getPharmacyOrders(customerId: string): Promise<PharmacyOrder[]> {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.post<CustomerDetailResponse>(
        "/api/order/CustomerId",
        { customerId: customerId }
      );

      return (response.data.orders as PharmacyOrder[]) || [];
    } catch (error) {
      console.error("Failed to fetch pharmacy orders:", error);
      return [];
    }
  }
  static async getHomecareOrders(customerId: string): Promise<HomecareOrder[]> {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.post<CustomerDetailResponse>(
        "/api/homecare/orders",
        { customer_id: customerId }
      );

      return (response.data.orders as HomecareOrder[]) || [];
    } catch (error) {
      console.error("Failed to fetch homecare orders:", error);
      return [];
    }
  }
  static async getLabTestBookings(
    customerId: string
  ): Promise<LabTestBooking[]> {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.post<CustomerDetailResponse>(
        "/api/labtest/booking/search",
        { customer_id: customerId }
      );

      return (response.data.orders as LabTestBooking[]) || [];
    } catch (error) {
      console.error("Failed to fetch lab test bookings:", error);
      return [];
    }
  }
  static async getAllCustomerOrders(customerId: string) {
    const [consultations, pharmacy, homecare, labTests] = await Promise.all([
      this.getConsultationOrders(customerId),
      this.getPharmacyOrders(customerId),
      this.getHomecareOrders(customerId),
      this.getLabTestBookings(customerId),
    ]);

    return {
      consultations,
      pharmacy,
      homecare,
      labTests,
    };
  }
  static formatAge(age?: {
    years?: number;
    months?: number;
    days?: number;
  }): string {
    if (!age || age.years === undefined || age.months === undefined) {
      return "N/A";
    }

    return `${age.years} yrs. | ${age.months} months`;
  }
  static getMedicalHistory(customer: CustomerDetail): string[] {
    return [];
  }
}

export default CustomerService;
