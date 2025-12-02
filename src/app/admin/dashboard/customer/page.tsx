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
import { Customer, CustomerMetrics } from "./type/customerTypes";
import { CustomerService } from "./services/customerService";
import toast, { Toaster } from "react-hot-toast";
import CreateCustomerModal from "./components/CreateCustomerModal";

const StatsCard: React.FC<{
  title: string;
  stats: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, stats, icon, color }) => (
  <div className="bg-white rounded-lg border border-[#E5E8E9] p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[12px] text-[#899193] mb-1">{title}</p>
        <p className="text-[20px] font-semibold text-[#161D1F]">{stats}</p>
      </div>
      <div className={`${color} bg-opacity-10 p-3 rounded-lg`}>{icon}</div>
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const itemsPerPage = 20;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      const response = await CustomerService.getCustomerMetrics();
      if (response.success && response.metrics.length > 0) {
        setMetrics(response.metrics[0]);
      }
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
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

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(0);
      fetchCustomers(searchTerm.trim(), 0);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchCustomers]);

  useEffect(() => {
    if (currentPage > 0) {
      fetchCustomers(searchTerm.trim(), currentPage * itemsPerPage);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(customers.map((c) => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

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
  console.log("hasMore Debug:", {
    currentPage,
    itemsPerPage,
    totalCount,
    calculation: (currentPage + 1) * itemsPerPage,
    hasMore,
    customersLength: customers.length,
  });
  const hasPrevious = currentPage > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Customer Catalog
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0088B1] text-white text-xs px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#006f8e]"
          >
            + New Customer
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
          <StatsCard
            title="Total Customers"
            stats={metricsLoading ? "..." : metrics?.total_customers || "0"}
            icon={<Users className="w-5 h-5" />}
            color="text-blue-500"
          />
          <StatsCard
            title="Active Customers"
            stats={
              metricsLoading ? "..." : metrics?.total_active_customers || "0"
            }
            icon={<UserCheck className="w-5 h-5" />}
            color="text-green-500"
          />
          <StatsCard
            title="Total Orders"
            stats={metricsLoading ? "..." : metrics?.total_orders || "0"}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="text-purple-500"
          />
          <StatsCard
            title="Total Spend YTD"
            stats={
              metricsLoading
                ? "..."
                : CustomerService.formatCurrency(
                    parseFloat(metrics?.net_revenue || "0")
                  )
            }
            icon={<DollarSign className="w-5 h-5" />}
            color="text-emerald-500"
          />
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#899193]" />
            <input
              type="text"
              placeholder="Search by customers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm text-[#161D1F] placeholder:text-[#B0B6B8]"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-sm text-[#161D1F] hover:bg-gray-50">
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-sm text-[#161D1F] hover:bg-gray-50"
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
              <span className="text-red-800 text-sm">{error}</span>
              <button
                onClick={() => {
                  setError(null);
                  fetchCustomers(searchTerm, currentPage * itemsPerPage);
                }}
                className="text-red-600 hover:text-red-800 underline text-sm"
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
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {totalCount} customers found
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#161D1F]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                      checked={
                        customers.length > 0 &&
                        selectedCustomers.length === customers.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
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
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088B1] mx-auto"></div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-[#899193] text-sm"
                    >
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={(e) =>
                            handleSelectCustomer(customer.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#161D1F]">
                          {CustomerService.getFullName(customer)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#161D1F]">
                          {customer.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#161D1F]">
                          {customer.phone_number || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={customer.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#161D1F]">
                          {CustomerService.formatCurrency(customer.total_spent)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {!loading && customers.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-[#899193]">
                  Showing {Math.min(currentPage * itemsPerPage + 1, totalCount)}{" "}
                  to {Math.min((currentPage + 1) * itemsPerPage, totalCount)} of{" "}
                  {totalCount} customers
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={!hasPrevious}
                    className={`px-4 py-2 text-sm border border-[#E5E8E9] rounded-lg ${
                      hasPrevious
                        ? "text-[#161D1F] hover:bg-gray-50"
                        : "text-[#B0B6B8] cursor-not-allowed"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={!hasMore}
                    className={`px-4 py-2 text-sm border border-[#E5E8E9] rounded-lg ${
                      hasMore
                        ? "text-[#161D1F] hover:bg-gray-50"
                        : "text-[#B0B6B8] cursor-not-allowed"
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
  );
};

export default CustomerCatalog;
