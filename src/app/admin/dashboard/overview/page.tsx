"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  TestTube,
  Video,
  Package,
  AlertTriangle,
  LogOut,
  User,
  ChevronRight,
  Users,
  Home,
} from "lucide-react";
import { useAdminStore } from "@/app/store/adminStore";
import { getProductsWithPaginationAPI } from "../pharmacy/product/services/ProductService";
import { Statistics } from "../pharmacy/product/types/product";
import StatsCard from "@/app/components/common/StatsCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

import { getConsultations } from "../consultations/consultation/service";
import { SearchLabTestBookingsPayload } from "../lab_tests/bookings/type";
import { searchLabTestBookings } from "../lab_tests/services";
import { getHomecareOrders } from "../home-care/booking/services";
import {
  ApiOrderResponse,
  GetOrdersResponse,
} from "../home-care/booking/types";
import { OrderService } from "../pharmacy/order/services";
import { Order } from "../pharmacy/order/types/types";
import CustomerService from "../customer/services/customerService";
import { getDoctors } from "../consultations/doctors/services";
import { CustomerMetrics } from "../customer/type/customerDetailTypes";
import UpcomingBookingCard from "./components/UpcomingBookingCard";
import { LabTestBooking } from "../lab_tests/bookings/type";
import {
  ConsultationAPI,
  GetConsultationsResponse,
} from "../consultations/consultation/types";

interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

interface ServiceDistribution {
  name: string;
  value: number;
  color: string;
}

type ServiceFilter = "pharmacy" | "homecare" | "consultations" | "labtests";

const COLORS = [
  "#0088B1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

export default function HealthcareDashboard() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { admin, logout, isLoggedIn, token } = useAdminStore();

  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("pharmacy");
  const [filterLoading, setFilterLoading] = useState(false);

  const [customerMetrics, setCustomerMetrics] =
    useState<CustomerMetrics | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [doctorCount, setDoctorCount] = useState(0);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [homecareBookings, setHomecareBookings] = useState<ApiOrderResponse[]>(
    [],
  );
  const [consultations, setConsultations] = useState<ConsultationAPI[]>([]);
  const [labBookings, setLabBookings] = useState<LabTestBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<MonthlyRevenue[]>([]);
  const [filteredChartData, setFilteredChartData] = useState<MonthlyRevenue[]>(
    [],
  );

  const [serviceDistribution, setServiceDistribution] = useState<
    ServiceDistribution[]
  >([]);

  const [loadingHomecare, setLoadingHomecare] = useState(false);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [loadingLab, setLoadingLab] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const getSortParams = (sortBy: string) => {
    switch (sortBy) {
      case "Order Date":
        return { sort_by: "orderdate", sort_order: "DESC" };
      case "Customer Name":
        return { sort_by: "customername", sort_order: "ASC" };
      case "Total Amount":
        return { sort_by: "totalorderamount", sort_order: "DESC" };
      default:
        return { sort_by: "orderdate", sort_order: "DESC" };
    }
  };

  const processMonthlyRevenue = (ordersData: Order[]): MonthlyRevenue[] => {
    const months: MonthlyRevenue[] = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthShort = date
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const year = date.getFullYear();

      months.push({
        month: `${monthShort} ${year}`,
        revenue: 0,
        bookings: 0,
      });
    }

    ordersData.forEach((order) => {
      if (!order.orderdate) return;

      const orderDate = new Date(order.orderdate);
      const orderMonth = orderDate
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const orderYear = orderDate.getFullYear();
      const monthYear = `${orderMonth} ${orderYear}`;

      const monthIndex = months.findIndex((m) => m.month === monthYear);

      if (monthIndex !== -1) {
        months[monthIndex].bookings += 1;

        const status = order.deliverystatus?.toLowerCase() || "";
        if (status !== "cancelled" && status !== "canceled") {
          months[monthIndex].revenue += parseFloat(order.totalorderamount) || 0;
        }
      }
    });

    return months;
  };

  const processHomecareRevenue = (
    bookings: ApiOrderResponse[],
  ): MonthlyRevenue[] => {
    const months: MonthlyRevenue[] = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthShort = date
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const year = date.getFullYear();

      months.push({
        month: `${monthShort} ${year}`,
        revenue: 0,
        bookings: 0,
      });
    }

    bookings.forEach((booking) => {
      if (!booking.order_date) return;

      const orderDate = new Date(booking.order_date);
      const orderMonth = orderDate
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const orderYear = orderDate.getFullYear();
      const monthYear = `${orderMonth} ${orderYear}`;

      const monthIndex = months.findIndex((m) => m.month === monthYear);

      if (monthIndex !== -1) {
        months[monthIndex].bookings += 1;
        months[monthIndex].revenue += parseFloat(booking.order_total) || 0;
      }
    });

    return months;
  };

  const processConsultationsRevenue = (
    consultationsData: ConsultationAPI[],
  ): MonthlyRevenue[] => {
    const months: MonthlyRevenue[] = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthShort = date
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const year = date.getFullYear();

      months.push({
        month: `${monthShort} ${year}`,
        revenue: 0,
        bookings: 0,
      });
    }

    consultationsData.forEach((consultation) => {
      const dateStr =
        consultation.consultation_date || consultation.created_date;
      if (!dateStr) return;

      const orderDate = new Date(dateStr);
      const orderMonth = orderDate
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const orderYear = orderDate.getFullYear();
      const monthYear = `${orderMonth} ${orderYear}`;

      const monthIndex = months.findIndex((m) => m.month === monthYear);

      if (monthIndex !== -1) {
        months[monthIndex].bookings += 1;
        months[monthIndex].revenue +=
          parseFloat(consultation.total_amount) || 0;
      }
    });

    return months;
  };

  const processLabTestsRevenue = (
    bookings: LabTestBooking[],
  ): MonthlyRevenue[] => {
    const months: MonthlyRevenue[] = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthShort = date
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const year = date.getFullYear();

      months.push({
        month: `${monthShort} ${year}`,
        revenue: 0,
        bookings: 0,
      });
    }

    bookings.forEach((booking) => {
      if (!booking.booking_date && !booking.created_date) return;

      const dateStr = booking.booking_date || booking.created_date;
      if (!dateStr) return;

      const orderDate = new Date(dateStr);
      const orderMonth = orderDate
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const orderYear = orderDate.getFullYear();
      const monthYear = `${orderMonth} ${orderYear}`;

      const monthIndex = months.findIndex((m) => m.month === monthYear);

      if (monthIndex !== -1) {
        months[monthIndex].bookings += 1;
        months[monthIndex].revenue += parseFloat(booking.amount) || 0;
      }
    });

    return months;
  };

  const fetchDataByFilter = useCallback(
    async (filter: ServiceFilter) => {
      if (!token) return;

      setFilterLoading(true);
      try {
        switch (filter) {
          case "pharmacy":
            setFilteredChartData(processMonthlyRevenue(orders));
            break;

          case "homecare": {
            const payload = {
              customer_id: null,
              search: null,
              filter_order_status: null,
            };
            const response: GetOrdersResponse = await getHomecareOrders(
              payload,
              token,
            );
            if (response.success && response.orders) {
              setFilteredChartData(processHomecareRevenue(response.orders));
            }
            break;
          }

          case "consultations": {
            const params = {
              start: 0,
              max: 2000,
              search_text: null,
              filter_status: null,
              is_online_consultation: null,
            };
            const response: GetConsultationsResponse = await getConsultations(
              params,
              token,
            );
            if (response.consultations) {
              setFilteredChartData(
                processConsultationsRevenue(response.consultations),
              );
            }
            break;
          }

          case "labtests": {
            const payload: SearchLabTestBookingsPayload = {
              start: 0,
              max: 2000,
              search_text: null,
              filter_status: null,
              sort_by: "created_date",
              sort_order: "DESC",
            };
            const response = await searchLabTestBookings(payload, token);
            if (response.success && response.labTestBookings) {
              setFilteredChartData(
                processLabTestsRevenue(response.labTestBookings),
              );
            }
            break;
          }

          default:
            setFilteredChartData(processMonthlyRevenue(orders));
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${filter} data:`, error);
      } finally {
        setFilterLoading(false);
      }
    },
    [token, orders],
  );

  const handleFilterChange = (filter: ServiceFilter) => {
    setServiceFilter(filter);
    fetchDataByFilter(filter);
  };

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingOrders(true);
      const params = {
        search: "",
        start: 0,
        max: 1000,
      };

      const response = await OrderService.fetchOrders(params);

      if (response.orders) {
        setOrders(response.orders);
        const monthlyData = processMonthlyRevenue(response.orders);
        setChartData(monthlyData);
        setFilteredChartData(monthlyData);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  const fetchCustomerMetrics = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingCustomers(true);
      const response = await CustomerService.getCustomerMetrics();
      if (response.success && response.metrics.length > 0) {
        const metrics = response.metrics[0];
        setCustomerMetrics({
          total_customers: metrics.total_customers,
          total_active_customers: metrics.total_active_customers,
          total_orders: metrics.total_orders,
          net_revenue: metrics.net_revenue,
        });
      }
    } catch (err) {
      console.error("Failed to fetch customer metrics:", err);
    } finally {
      setLoadingCustomers(false);
    }
  }, [token]);

  const fetchDoctors = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingDoctors(true);
      const params = {
        search: "",
        status: "All Status",
      };
      const response = await getDoctors(params, token);
      setDoctorCount(response.doctors?.length || 0);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoadingDoctors(false);
    }
  }, [token]);

  const sortByMostRecent = (orders: ApiOrderResponse[]): ApiOrderResponse[] => {
    return [...orders].sort((a, b) => {
      const dateA = a.order_date ? new Date(a.order_date).getTime() : 0;
      const dateB = b.order_date ? new Date(b.order_date).getTime() : 0;
      return dateB - dateA;
    });
  };

  const processServiceDistribution = (bookings: ApiOrderResponse[]) => {
    const distribution: Record<string, number> = {};

    bookings.forEach((booking) => {
      const serviceType = booking.homecare_service_name || "Other";
      distribution[serviceType] = (distribution[serviceType] || 0) + 1;
    });

    const sortedDistribution = Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const top5 = sortedDistribution.slice(0, 5);

    if (sortedDistribution.length > 5) {
      const othersValue = sortedDistribution
        .slice(5)
        .reduce((sum, item) => sum + item.value, 0);
      top5.push({ name: "Others", value: othersValue });
    }

    const distributionArray = top5.map((item, index) => ({
      name: item.name,
      value: item.value,
      color: COLORS[index % COLORS.length],
    }));

    setServiceDistribution(distributionArray);
  };

  const fetchHomecareOrders = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingHomecare(true);
      const payload = {
        customer_id: null,
        search: null,
        filter_order_status: null,
      };

      const response: GetOrdersResponse = await getHomecareOrders(
        payload,
        token,
      );

      if (response.success && response.orders) {
        const sortedOrders = sortByMostRecent(response.orders);
        setHomecareBookings(sortedOrders);
        processServiceDistribution(sortedOrders);
      }
    } catch (err) {
      console.error("Failed to fetch homecare orders:", err);
    } finally {
      setLoadingHomecare(false);
    }
  }, [token]);

  const fetchConsultations = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingConsultations(true);
      const params = {
        start: 0,
        max: 5,
        search_text: null,
        filter_status: null,
        is_online_consultation: null,
      };

      const response: GetConsultationsResponse = await getConsultations(
        params,
        token,
      );
      if (response.consultations) {
        setConsultations(response.consultations.slice(0, 5));
      }
    } catch (error) {
      console.error("Error loading consultations:", error);
    } finally {
      setLoadingConsultations(false);
    }
  }, [token]);

  const fetchLabBookings = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingLab(true);
      const payload: SearchLabTestBookingsPayload = {
        start: 0,
        max: 5,
        search_text: null,
        filter_status: null,
        sort_by: "created_date",
        sort_order: "DESC",
      };

      const response = await searchLabTestBookings(payload, token);
      if (response.success && response.labTestBookings) {
        setLabBookings(response.labTestBookings.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching lab bookings:", error);
    } finally {
      setLoadingLab(false);
    }
  }, [token]);

  const fetchData = async () => {
    if (!isLoggedIn) {
      setError("Please log in to view dashboard data");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getProductsWithPaginationAPI(0, 5, {});

      if (!response.success) {
        throw new Error("Failed to fetch statistics");
      }

      if (!response.statistics || response.statistics.length === 0) {
        throw new Error("No statistics data received");
      }

      const stats = response.statistics[0];

      const productStatistics: Statistics = {
        activeproducts: stats.activeproducts,
        inactiveproducts: stats.inactiveproducts,
        instockproducts: stats.instockproducts,
        outofstockproducts: stats.outofstockproducts,
        featuredproducts: stats.featuredproducts,
        nonfeaturedproducts: stats.nonfeaturedproducts,
        totalcategories: stats.totalcategories,
      };

      setStatistics(productStatistics);

      await Promise.all([
        fetchHomecareOrders(),
        fetchConsultations(),
        fetchLabBookings(),
        fetchOrders(),
        fetchCustomerMetrics(),
        fetchDoctors(),
      ]);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    } else {
      setError("Authentication required");
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const calculateTotals = () => {
    const totalRevenue = filteredChartData.reduce(
      (sum, month) => sum + month.revenue,
      0,
    );
    const totalOrders = filteredChartData.reduce(
      (sum, month) => sum + month.bookings,
      0,
    );

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue:
        totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    };
  };
  const totals = calculateTotals();

  const getGraphTitle = () => {
    switch (serviceFilter) {
      case "pharmacy":
        return "Pharmacy Revenue & Orders";
      case "homecare":
        return "Homecare Revenue & Bookings";
      case "consultations":
        return "Consultations Revenue & Bookings";
      case "labtests":
        return "Lab Tests Revenue & Bookings";
      default:
        return "Overall Revenue & Orders";
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to access the healthcare dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 ">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {admin.name || admin.email || "Admin"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {admin.name || "Admin"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 justify-between">
            <StatsCard
              title="Total Customers"
              icon={<Users className="w-5 h-5" />}
              subtitle="Active Customers in system"
              color="text-[#0088b1]"
              stats={customerMetrics ? customerMetrics.total_customers : 0}
            />
            <StatsCard
              title="Total Products"
              icon={<Package className="w-5 h-5" />}
              subtitle="Products in inventory"
              color="text-[#0088b1]"
              stats={statistics ? statistics.activeproducts : 0}
            />
            <StatsCard
              title="Total Doctors"
              icon={<User className="w-5 h-5" />}
              subtitle="Active doctors"
              color="text-[#0088b1]"
              stats={doctorCount > 0 ? doctorCount : 0}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Unable to load statistics
                </h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <button
                onClick={fetchData}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!error && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {getGraphTitle()}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Monthly insights into revenue flow and order growth
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 mr-4">
                      <button
                        onClick={() => handleFilterChange("pharmacy")}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          serviceFilter === "pharmacy"
                            ? "bg-[#0088B1] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Pharmacy
                      </button>
                      <button
                        onClick={() => handleFilterChange("homecare")}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          serviceFilter === "homecare"
                            ? "bg-[#0088B1] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Homecare
                      </button>
                      <button
                        onClick={() => handleFilterChange("consultations")}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          serviceFilter === "consultations"
                            ? "bg-[#0088B1] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Consultations
                      </button>
                      <button
                        onClick={() => handleFilterChange("labtests")}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          serviceFilter === "labtests"
                            ? "bg-[#0088B1] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Lab Tests
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-64">
                  {filterLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={filteredChartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#0088B1"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#0088B1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorBookings"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#22C55E"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#22C55E"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#E5E7EB"
                        />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6B7280" }}
                        />
                        <YAxis
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6B7280" }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6B7280" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value: any, name: string | undefined) => {
                            if (value === undefined || value === null)
                              return [
                                "0",
                                name === "revenue" ? "Revenue" : "Orders",
                              ];
                            if (name === "revenue") {
                              return [`₹${value.toLocaleString()}`, "Revenue"];
                            }
                            return [value.toString(), "Orders"];
                          }}
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#0088B1"
                          strokeWidth={2}
                          fill="url(#colorRevenue)"
                        />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="bookings"
                          stroke="#22C55E"
                          strokeWidth={2}
                          fill="url(#colorBookings)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex items-center justify-center space-x-6 mt-4">
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#0088B1] rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">Revenue (₹)</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#22C55E] rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">
                      {serviceFilter === "pharmacy" ? "Orders" : "Bookings"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{totals.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {serviceFilter === "pharmacy"
                        ? "Total Orders"
                        : "Total Bookings"}
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      {totals.totalOrders.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Order Value</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{totals.averageOrderValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  Top 5 Homecare Services
                </h3>
                {loadingHomecare ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                  </div>
                ) : serviceDistribution.length > 0 ? (
                  <>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={serviceDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {serviceDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {serviceDistribution.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: service.color }}
                            />
                            <span className="text-gray-600">
                              {service.name}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {service.value} bookings
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-12">
                    No homecare bookings data available
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-900">
                    Upcoming Consultations
                  </h3>
                  <Video className="w-5 h-5 text-[#0088B1]" />
                </div>
                {loadingConsultations ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                  </div>
                ) : consultations.length > 0 ? (
                  <div>
                    {consultations.map((consultation, index) => (
                      <UpcomingBookingCard
                        key={index}
                        id={consultation.id}
                        customerName={
                          consultation.patient_name ||
                          consultation.customer_name ||
                          "N/A"
                        }
                        serviceType={
                          consultation.consultation_type || "Consultation"
                        }
                        date={
                          consultation.consultation_date ||
                          consultation.created_date
                            ? new Date(
                                consultation.consultation_date ||
                                  consultation.created_date,
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"
                        }
                        time={
                          consultation.consultation_time
                            ? new Date(
                                `1970-01-01T${consultation.consultation_time}`,
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "N/A"
                        }
                        status={consultation.status || "Scheduled"}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No upcoming consultations
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                  <button
                    className="text-sm font-medium text-[#0088B1] hover:text-[#006690] inline-flex items-center"
                    onClick={() =>
                      (window.location.href =
                        "/admin/dashboard/consultations/consultation")
                    }
                  >
                    View All Consultations
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-900">
                    Upcoming Lab Tests
                  </h3>
                  <TestTube className="w-5 h-5 text-[#0088B1]" />
                </div>
                {loadingLab ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                  </div>
                ) : labBookings.length > 0 ? (
                  <div>
                    {labBookings.map((booking, index) => (
                      <UpcomingBookingCard
                        key={index}
                        id={booking.id}
                        customerName={booking.labtestnames?.[0] || "N/A"}
                        serviceType="Lab Test"
                        date={
                          booking.booking_date
                            ? new Date(booking.booking_date).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "N/A"
                        }
                        status={booking.status || "Scheduled"}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No upcoming lab tests
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                  <button
                    className="text-sm font-medium text-[#0088B1] hover:text-[#006690] inline-flex items-center"
                    onClick={() =>
                      (window.location.href =
                        "/admin/dashboard/lab_tests/bookings")
                    }
                  >
                    View All Lab Tests
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
