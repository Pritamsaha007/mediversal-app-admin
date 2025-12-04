"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Download,
  ArrowUpDown,
  Users,
  UserCheck,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { CustomerService } from "./services/customerService";
import CreateCustomerModal from "./components/CreateCustomerModal";
import CustomerDetailView from "./components/CustomerDetailView";
import { Customer, CustomerDetail } from "./type/customerDetailTypes";
import { useCustomerStore } from "./store/customerStore";
import TableSkeleton from "./components/TableSkeleton";
import CustomerRow from "./components/CustomerRow";

const StatsCard: React.FC<{
  title: string;
  stats: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, stats, icon, color }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[12px] shadow-2xs text-[#899193] mb-1">{title}</p>
        <p className="text-[12px] font-semibold text-[#161D1F]">{stats}</p>
      </div>
      <div className={`${color}`}>{icon}</div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isActive = status?.toLowerCase() === "active";
  return (
    <span
      className={`inline-flex items-center px-4 py-1 rounded text-[10px] font-medium ${
        isActive ? "bg-[#34C759] text-white" : "bg-[#EB5757] text-white"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

const CustomerCatalog: React.FC = () => {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const itemsPerPage = 20;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDetail | null>(null);
  const [apiError, setApiError] = useState<{
    type: "metrics" | "customers" | null;
    message: string;
  }>({ type: null, message: "" });
  const {
    customers,
    setCustomers,
    metrics,
    setMetrics,
    currentPage,
    setCurrentPage,
    totalCount,
    setTotalCount,
    searchTerm,
    setSearchTerm,
    loading,
    setLoading,
    metricsLoading,
    setMetricsLoading,
    error,
    setError,
    resetPagination,
  } = useCustomerStore();

  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      setApiError({ type: null, message: "" });
      const response = await CustomerService.getCustomerMetrics();
      if (response.success && response.metrics.length > 0) {
        setMetrics(response.metrics[0]);
      } else {
        setApiError({
          type: "metrics",
          message: "Unable to load customer metrics. Showing default values.",
        });
      }
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
      setApiError({
        type: "metrics",
        message: "Failed to connect to server. Please check your connection.",
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  const fetchCustomers = useCallback(async (search: string, start: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CustomerService.searchCustomers(
        search,
        start,
        itemsPerPage
      );

      if (response.success) {
        console.log("API Response:", {
          customers_returned: response.customers.length,
          total_count: response.total_count,
          start: start,
          max: itemsPerPage,
        });
        setCustomers(response.customers);
        setTotalCount(response.total_count);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch customers"
      );
      setCustomers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCustomerClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer as CustomerDetail);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      resetPagination();
      fetchCustomers(searchTerm.trim(), 0);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchCustomers, resetPagination]);

  useEffect(() => {
    if (currentPage > 0) {
      fetchCustomers(searchTerm.trim(), currentPage * itemsPerPage);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleExport = () => {
    if (customers.length === 0) {
      alert("No customers to export");
      return;
    }
    CustomerService.exportToCSV(customers);
  };

  const hasMore =
    totalCount > (currentPage + 1) * itemsPerPage ||
    (totalCount === 0 && customers.length === itemsPerPage);
  const hasPrevious = currentPage > 0;

  return (
    <>
      {selectedCustomer ? (
        <CustomerDetailView
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      ) : (
        <div className="min-h-screen bg-gray-50 p-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-[20px] font-semibold text-[#161D1F]">
                User Management & Order Analytics
              </h1>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#0088B1] text-white text-[10px] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#006f8e]"
              >
                + New Customer
              </button>
            </div>
            {apiError.type && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-[12px]">
                  {apiError.message}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
              <StatsCard
                title="Total Customers"
                stats={metricsLoading ? "..." : metrics?.total_customers ?? "0"}
                icon={<Users className="w-4 h-4" />}
                color="text-[#0088b1]"
              />
              <StatsCard
                title="Active Customers"
                stats={
                  metricsLoading
                    ? "..."
                    : metrics?.total_active_customers ?? "0"
                }
                icon={<UserCheck className="w-4 h-4" />}
                color="text-[#0088b1]"
              />
              <StatsCard
                title="Total Orders"
                stats={metricsLoading ? "..." : metrics?.total_orders ?? "0"}
                icon={<ShoppingCart className="w-4 h-4" />}
                color="text-[#0088b1]"
              />
              <StatsCard
                title="Total Revenue"
                stats={
                  metricsLoading
                    ? "..."
                    : CustomerService.formatCurrency(
                        parseFloat(metrics?.net_revenue ?? "0")
                      )
                }
                icon={<DollarSign className="w-4 h-4" />}
                color="text-[#0088b1]"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#899193]" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-[12px] text-[#161D1F] placeholder:text-[#B0B6B8]"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-red-800 text-[12px]">{error}</span>
                  <button
                    onClick={() => {
                      setError(null);
                      fetchCustomers(searchTerm, currentPage * itemsPerPage);
                    }}
                    className="text-red-600 hover:text-red-800 underline text-[12px]"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Customer Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-[16px] font-medium text-[#161D1F]">
                  All Customers
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]">
                        Spend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <TableSkeleton rows={5} columns={5} />
                    ) : customers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Users className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-[14px] font-medium text-[#161D1F] mb-1">
                              No Customers Found
                            </p>
                            <p className="text-[12px] text-[#899193]">
                              {searchTerm
                                ? "Try adjusting your search criteria"
                                : "Start by adding your first customer"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer) => (
                        <CustomerRow
                          key={customer.id}
                          customer={customer}
                          onClick={() => handleCustomerClick(customer)}
                        />
                      ))
                    )}
                  </tbody>
                </table>

                {!loading && customers.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="text-[12px] text-[#899193]">
                      Showing{" "}
                      {customers.length === 0
                        ? 0
                        : currentPage * itemsPerPage + 1}{" "}
                      to{" "}
                      {Math.min((currentPage + 1) * itemsPerPage, totalCount)}{" "}
                      of {totalCount} customers
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(0, prev - 1))
                        }
                        disabled={!hasPrevious}
                        className={`px-4 py-2 text-[12px] border border-[#E5E8E9] rounded-lg transition-colors ${
                          hasPrevious
                            ? "text-[#161D1F] hover:bg-gray-50"
                            : "text-[#B0B6B8] cursor-not-allowed bg-gray-50"
                        }`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={!hasMore}
                        className={`px-4 py-2 text-[12px] border border-[#E5E8E9] rounded-lg transition-colors ${
                          hasMore
                            ? "text-[#161D1F] hover:bg-gray-50"
                            : "text-[#B0B6B8] cursor-not-allowed bg-gray-50"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <CreateCustomerModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              fetchCustomers(searchTerm, 0);
              fetchMetrics();
            }}
          />
        </div>
      )}
    </>
  );
};

export default CustomerCatalog;
