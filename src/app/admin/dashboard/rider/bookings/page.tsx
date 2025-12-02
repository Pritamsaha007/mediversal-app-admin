"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAdminStore } from "@/app/store/adminStore";
import StatusBadge from "../../home-care/components/StatusBadge";
import StatsCard from "../../home-care/components/StatsCard";
import {
  Search,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Bike,
  Box,
  Package,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  User,
  BadgeIndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "@/app/components/common/pagination";
import DeliveryOrder, {
  Rider,
  RiderOrder,
  SearchRidersPayload,
} from "../types";
import {
  getRiderOverview,
  updateOrderRiderInfo,
  fetchRiderStatus,
  searchRider,
} from "../services";

const RiderBooking: React.FC = () => {
  const [selectedRider, setSelectedRider] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [riders, setRiders] = useState<Rider[]>([]);
  const [allRiders, setAllRiders] = useState<Rider[]>([]);
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<null | "status" | "rider">(
    null
  );
  const [riderStatuses, setRiderStatuses] = useState<any[]>([]);
  const [riderSearch, setRiderSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);

  const statusOptions = [
    "All Status",
    "Pending",
    "In Progress",
    "Completed",
    "Cancelled",
  ];

  const { token } = useAdminStore();

  // Debounce function for search
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Fetch all riders on component mount
  useEffect(() => {
    if (token) {
      fetchAllRiders();
      fetchRiderDeliveryStatuses();
    }
  }, [token]);

  // Search orders when searchTerm changes (with debounce)
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (selectedRider && token) {
        fetchRiderOrders(selectedRider, true);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimer);
  }, [searchTerm, selectedStatus]);

  const fetchAllRiders = async () => {
    if (!token) return;

    setLoadingRiders(true);
    try {
      const payload: SearchRidersPayload = {
        start: 0,
        max: 100,
        search: null,
        filter_active: null,
        sort_by: "name",
        sort_order: "ASC",
      };

      const ridersData = await searchRider(payload, token);

      const transformedRiders: Rider[] = ridersData.map((rider) => ({
        id: rider.id,
        name: rider.name,
        stats: {
          total_earning: 0,
          total_assign_orders: 0,
          total_completed_delivery: 0,
          total_pending_delivery: 0,
          total_in_progress_delivery: 0,
        },
        orders: [],
      }));

      setAllRiders(transformedRiders);
      setRiders(transformedRiders);

      if (transformedRiders.length > 0 && !selectedRider) {
        handleRiderSelect(transformedRiders[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching riders:", error);
      toast.error(error.message || "Failed to load riders");
    } finally {
      setLoadingRiders(false);
    }
  };

  // Filter riders locally when searching
  useEffect(() => {
    if (riderSearch.trim() === "") {
      setRiders(allRiders);
    } else {
      const searchLower = riderSearch.toLowerCase();
      const filtered = allRiders.filter((rider) =>
        rider.name.toLowerCase().includes(searchLower)
      );
      setRiders(filtered);
    }
  }, [riderSearch, allRiders]);

  const fetchRiderDeliveryStatuses = async () => {
    if (!token) return;

    try {
      const response = await fetchRiderStatus(token);
      if (response.success) {
        setRiderStatuses(response.roles || []);
      }
    } catch (error: any) {
      console.error("Error fetching rider statuses:", error);
    }
  };

  const getStatusId = (statusName: string) => {
    const status = riderStatuses.find(
      (s) =>
        s.value.toLowerCase().includes(statusName.toLowerCase()) ||
        s.code?.toLowerCase().includes(statusName.toLowerCase())
    );
    return status?.id;
  };

  const fetchRiderOrders = async (riderId: string, resetPage = false) => {
    if (!token || !riderId) return;

    if (resetPage) {
      setCurrentPage(0);
    }

    setLoadingOrders(true);
    try {
      const payload = {
        rider_id: riderId,
        start: resetPage ? 0 : currentPage * itemsPerPage,
        max: itemsPerPage,
        search: searchTerm || null,
        filter_status:
          selectedStatus !== "All Status"
            ? (selectedStatus.toLowerCase().replace(" ", "") as any)
            : null,
      };

      const response = await getRiderOverview(payload, token);

      if (response.success) {
        setOrders(response.orders);
        setTotalOrders(response.stats.total_assign_orders);
        setHasMore(
          (currentPage + 1) * itemsPerPage < response.stats.total_assign_orders
        );

        updateRiderStats(riderId, response.stats);
      } else {
        toast.error("Failed to fetch rider overview");
      }
    } catch (error: any) {
      console.error("Error fetching rider orders:", error);
      toast.error(error.message || "Failed to load rider orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const updateRiderStats = (riderId: string, stats: any) => {
    setAllRiders((prev) =>
      prev.map((rider) => {
        if (rider.id === riderId) {
          return {
            ...rider,
            stats: {
              total_earning: stats.total_earning || 0,
              total_assign_orders: stats.total_assign_orders || 0,
              total_completed_delivery: stats.total_completed_delivery || 0,
              total_pending_delivery: stats.total_pending_delivery || 0,
              total_in_progress_delivery: stats.total_in_progress_delivery || 0,
            },
          };
        }
        return rider;
      })
    );

    setRiders((prev) =>
      prev.map((rider) => {
        if (rider.id === riderId) {
          return {
            ...rider,
            stats: {
              total_earning: stats.total_earning || 0,
              total_assign_orders: stats.total_assign_orders || 0,
              total_completed_delivery: stats.total_completed_delivery || 0,
              total_pending_delivery: stats.total_pending_delivery || 0,
              total_in_progress_delivery: stats.total_in_progress_delivery || 0,
            },
          };
        }
        return rider;
      })
    );
  };

  // Fetch orders when rider changes or page changes
  useEffect(() => {
    if (selectedRider && token) {
      fetchRiderOrders(selectedRider);
    }
  }, [selectedRider, currentPage, token]);

  const handleRiderSelect = (riderId: string) => {
    setSelectedRider(riderId);
    setCurrentPage(0);
    setRiderSearch("");
    setSearchTerm("");
    setSelectedStatus("All Status");
  };

  const formatStatusDisplay = (statusValue: string): string => {
    switch (statusValue) {
      case "PENDING":
      case "PENDING_ASSIGNMENT":
        return "Pending";
      case "IN_PROGRESS":
      case "INPROGRESS":
      case "IN-PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return statusValue
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  const handleStartDelivery = async (orderId: string) => {
    if (!token || !riderStatuses.length || !selectedRider) {
      toast.error("Unable to start delivery");
      return;
    }

    const inProgressStatusId = riderStatuses[1]?.id;
    if (!inProgressStatusId) {
      toast.error("Delivery status not found");
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      // Update local state immediately for instant feedback
      setOrders(
        orders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              rider_delivery_status: "In Progress",
            };
          }
          return order;
        })
      );

      // Update rider stats locally
      updateRiderStats(selectedRider, {
        total_in_progress_delivery:
          (selectedRiderData?.stats.total_in_progress_delivery || 0) + 1,
        total_pending_delivery: Math.max(
          0,
          (selectedRiderData?.stats.total_pending_delivery || 0) - 1
        ),
      });

      toast.success("Delivery started!");

      // Call API in background
      const payload = {
        id: orderId,
        order_status: "Ship",
        rider_staff_id: selectedRider,
        rider_delivery_status_id: inProgressStatusId,
      };

      updateOrderRiderInfo(payload, token)
        .then((response) => {
          if (!response.success) {
            toast.error(response.message || "Failed to update on server");
            // Revert local changes if API fails
            fetchRiderOrders(selectedRider, true);
          }
        })
        .catch((error) => {
          console.error("Error updating order:", error);
          toast.error("Failed to sync with server");
          // Revert local changes
          fetchRiderOrders(selectedRider, true);
        })
        .finally(() => {
          setUpdatingOrderId(null);
        });
    } catch (error: any) {
      console.error("Error starting delivery:", error);
      toast.error(error.message || "Failed to start delivery");
      setUpdatingOrderId(null);
      // Revert on error
      fetchRiderOrders(selectedRider, true);
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    if (!token || !riderStatuses.length || !selectedRider) {
      toast.error("Unable to mark as delivered");
      return;
    }

    const completedStatusId = riderStatuses[2]?.id;
    if (!completedStatusId) {
      toast.error("Delivery status not found");
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      // Update local state immediately for instant feedback
      setOrders(
        orders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              rider_delivery_status: "Completed",
            };
          }
          return order;
        })
      );

      // Update rider stats locally
      updateRiderStats(selectedRider, {
        total_completed_delivery:
          (selectedRiderData?.stats.total_completed_delivery || 0) + 1,
        total_in_progress_delivery: Math.max(
          0,
          (selectedRiderData?.stats.total_in_progress_delivery || 0) - 1
        ),
      });

      toast.success("Order marked as delivered!");

      // Call API in background
      const payload = {
        id: orderId,
        order_status: "Completed",
        rider_staff_id: selectedRider,
        rider_delivery_status_id: completedStatusId,
      };

      updateOrderRiderInfo(payload, token)
        .then((response) => {
          if (!response.success) {
            toast.error(response.message || "Failed to update on server");
            // Revert local changes if API fails
            fetchRiderOrders(selectedRider, true);
          }
        })
        .catch((error) => {
          console.error("Error updating order:", error);
          toast.error("Failed to sync with server");
          // Revert local changes
          fetchRiderOrders(selectedRider, true);
        })
        .finally(() => {
          setUpdatingOrderId(null);
        });
    } catch (error: any) {
      console.error("Error marking as delivered:", error);
      toast.error(error.message || "Failed to mark as delivered");
      setUpdatingOrderId(null);
      // Revert on error
      fetchRiderOrders(selectedRider, true);
    }
  };

  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next") {
      if (hasMore) {
        setCurrentPage(currentPage + 1);
      }
    } else {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const selectedRiderData = riders.find((rider) => rider.id === selectedRider);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle order search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Rider Booking
          </h1>
        </div>

        {/* Rider Search Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Select Rider
            </label>

            <p className="text-xs text-gray-500 mt-2">
              Choose a rider to view their deliveries and earnings
            </p>

            <div className="relative mt-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={riderSearch}
                onChange={(e) => setRiderSearch(e.target.value)}
                placeholder="Search rider by name..."
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-[#E5E8E9] bg-[#F8F8F8] rounded-lg placeholder-[#B0B6B8] outline-none focus:border-gray-400"
                disabled={loadingRiders}
              />
              {loadingRiders && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* Rider Selection Dropdown */}
            {riderSearch && riders.length > 0 && (
              <div className="absolute left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-60 overflow-y-auto">
                <div className="py-1">
                  {riders.map((rider) => (
                    <button
                      key={rider.id}
                      onClick={() => handleRiderSelect(rider.id)}
                      className="w-full px-3 py-2 text-left text-sm text-[#161D1F] hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <span>{rider.name}</span>
                      {rider.id === selectedRider && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {riderSearch && riders.length === 0 && !loadingRiders && (
              <div className="absolute left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="px-3 py-2 text-sm text-gray-500">
                  No riders found
                </div>
              </div>
            )}
          </div>

          {/* Selected Rider Info */}
          {selectedRiderData && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-blue-200">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedRiderData.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {selectedRiderData.stats.total_assign_orders} orders
                        </span>
                        <span className="flex items-center gap-1">
                          <BadgeIndianRupee className="w-3 h-3" />₹
                          {selectedRiderData.stats.total_earning.toLocaleString()}{" "}
                          earnings
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          {
                            selectedRiderData.stats.total_completed_delivery
                          }{" "}
                          completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {loadingOrders && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}
              </div>
            </div>
          )}

          {/* Loading state for initial riders load */}
          {loadingRiders && !selectedRiderData && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading riders...</span>
              </div>
            </div>
          )}

          {/* No riders state */}
          {!loadingRiders && riders.length === 0 && !riderSearch && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="text-sm text-yellow-800">
                No riders available. Add riders first from the Delivery Riders
                page.
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Only show when a rider is selected */}
        {selectedRiderData && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <StatsCard
                title="Total Earnings"
                stats={`₹${selectedRiderData.stats.total_earning.toLocaleString()}`}
                icon={<BadgeIndianRupee className="w-5 h-5" />}
                color="text-[#0088b1]"
              />
              <StatsCard
                title="Total Deliveries"
                stats={selectedRiderData.stats.total_assign_orders.toString()}
                icon={<Package className="w-5 h-5" />}
                color="text-[#0088b1]"
              />
              <StatsCard
                title="Active Deliveries"
                stats={selectedRiderData.stats.total_in_progress_delivery.toString()}
                icon={<Box className="w-5 h-5" />}
                color="text-[#0088b1]"
              />
            </div>

            {/* Orders Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
                <input
                  type="text"
                  placeholder="Search orders by ID, Customer Name, or Phone..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
                  disabled={loadingOrders}
                />
                {loadingOrders && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === "status" ? null : "status"
                      )
                    }
                    className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loadingOrders}
                  >
                    {selectedStatus}
                    <ChevronDown className="w-5 h-5" />
                  </button>
                  {openDropdown === "status" && (
                    <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                            selectedStatus === status
                              ? "bg-blue-50 text-blue-600"
                              : "text-[#161D1F]"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-[16px] font-medium text-[#161D1F]">
                  Assigned Deliveries
                  <span className="text-[8px] text-[#899193] font-normal ml-2">
                    {totalOrders} Orders
                  </span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                        Item Details
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                        Delivery Address
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                        Delivery Status
                      </th>
                      <th className="px-6 py-3 text-right text-[12px] font-medium text-[#161D1F] tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingOrders ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            {searchTerm || selectedStatus !== "All Status"
                              ? "No orders match your search criteria"
                              : "No orders assigned to this rider"}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-medium text-[#161D1F]">
                              {order.id.length > 8
                                ? `${order.id.slice(0, 8)}...`
                                : order.id}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="text-xs font-medium text-[#161D1F]">
                                {order.billing_first_name}{" "}
                                {order.billing_last_name}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-500">
                                  {order.customer_phone}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {order.items.slice(0, 2).map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1"
                                >
                                  <span className="text-xs text-gray-900">
                                    •
                                  </span>
                                  <span className="text-xs text-gray-900">
                                    {item.name} (Qty: {item.qty})
                                  </span>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{order.items.length - 2} more items
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-1 max-w-xs">
                              <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-700 truncate">
                                {order.billing_address_1}
                                {order.billing_address_2 &&
                                  `, ${order.billing_address_2}`}
                                {order.billing_city &&
                                  `, ${order.billing_city}`}
                                {order.billing_pincode &&
                                  ` - ${order.billing_pincode}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-bold text-[#161D1F]">
                              ₹{order.amount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.rider_delivery_status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.rider_delivery_status ===
                                    "In Progress"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.rider_delivery_status === "Pending"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {formatStatusDisplay(order.rider_delivery_status)}
                              {updatingOrderId === order.id && (
                                <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                            <div className="flex items-center gap-2 justify-end">
                              {order.rider_delivery_status === "Completed" ? (
                                <span className="text-xs text-green-600">
                                  Delivered
                                </span>
                              ) : order.rider_delivery_status ===
                                "In Progress" ? (
                                <button
                                  onClick={() =>
                                    handleMarkAsDelivered(order.id)
                                  }
                                  disabled={
                                    !riderStatuses.length ||
                                    updatingOrderId === order.id
                                  }
                                  className="text-xs px-3 py-1 text-green-600 border border-green-600 hover:bg-green-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingOrderId === order.id ? (
                                    <div className="flex items-center gap-1">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                                      Updating...
                                    </div>
                                  ) : (
                                    "Mark Delivered"
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStartDelivery(order.id)}
                                  disabled={
                                    !riderStatuses.length ||
                                    updatingOrderId === order.id
                                  }
                                  className="text-xs px-3 py-1 text-[#0088B1] border border-[#0088B1] hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingOrderId === order.id ? (
                                    <div className="flex items-center gap-1">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                      Starting...
                                    </div>
                                  ) : (
                                    "Start Delivery"
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {orders.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  hasMore={hasMore}
                  loading={loadingOrders}
                  onPrevious={() => handlePageChange("prev")}
                  onNext={() => handlePageChange("next")}
                  totalItems={totalOrders}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RiderBooking;
