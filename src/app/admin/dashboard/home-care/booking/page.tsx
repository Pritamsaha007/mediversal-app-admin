"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Plus, ChevronDown } from "lucide-react";
import DropdownMenu from "./components/DropdownMenu";
import BookingModal from "./components/BookingModal";
import AddBookingModal from "./components/AddBookingModal";
import AssignStaffModal from "./components/AssignStaffModal";
import { useAdminStore } from "../../../../store/adminStore";
import { ApiOrderResponse, DetailedBooking } from "./types";
import { getHomecareOrders, getOrderStatus, updateOrder } from "./services";
import toast from "react-hot-toast";

const statusOptions = [
  "All Status",
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

interface OrderStatusEnum {
  id: string;
  slno: number;
  code: string;
  value: string;
  description: string | null;
  metadata: any | null;
}

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

const BookingManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedBooking, setSelectedBooking] =
    useState<ApiOrderResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const [selectedBookingForStaff, setSelectedBookingForStaff] =
    useState<string>("");
  const { token } = useAdminStore();
  const [apiBookings, setApiBookings] = useState<ApiOrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedActualOrderId, setSelectedActualOrderId] =
    useState<string>("");
  const [orderStatuses, setOrderStatuses] = useState<OrderStatusEnum[]>([]);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(
    null
  );
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrderStatuses = useCallback(async () => {
    try {
      const response = await getOrderStatus(token);
      if (response.success) {
        // Filter statuses to include only relevant ones for the UI dropdown
        const relevantStatuses = (response.roles as OrderStatusEnum[]).filter(
          (status) =>
            ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
              status.value
            )
        );
        setOrderStatuses(relevantStatuses);
      }
    } catch (err) {
      console.error("Failed to fetch order statuses:", err);
    }
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = {
        customer_id: null,
        search: searchTerm || null,

        filter_order_status:
          statusFilter === "All Status" ? null : statusFilter,
      };
      const response = await getHomecareOrders(payload, token);

      if (response.success) {
        setApiBookings(response.orders);
      } else {
        setError("Failed to fetch orders.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, statusFilter]);

  useEffect(() => {
    fetchOrders();
    fetchOrderStatuses();
  }, [fetchOrders, fetchOrderStatuses]);

  const handleSearch = () => {
    fetchOrders();
  };

  const handleStatusChange = async (
    orderId: string,
    statusId: string,
    statusValue: string,
    customer_id: string
  ) => {
    try {
      setUpdatingStatus(orderId);

      const updatePayload = {
        id: orderId,
        customer_id: customer_id,
        order_status: statusId,
      };

      const response = await updateOrder(updatePayload, token);

      if (response.success) {
        setApiBookings((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  order_status_id: statusId,
                  order_status: statusValue,
                  order_status_name: statusValue,
                }
              : order
          )
        );

        setOpenStatusDropdown(null);

        toast.success(
          `Order status updated to ${formatStatusDisplay(statusValue)}`
        );
      } else {
        throw new Error(response.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update order status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
      case "PENDING_ASSIGNMENT":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
      case "INPROGRESS":
      case "IN-PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentColor = (payment: string) => {
    switch (payment) {
      case "Partially Paid":
        return "bg-yellow-100 text-yellow-800";
      case "Paid":
      case "Fully Paid":
        return "bg-green-100 text-green-800";
      case "Refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (booking: ApiOrderResponse) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleEditBooking = (bookingId: string) => {
    toast(`Edit booking: ${bookingId} not yet implemented.`);
  };

  const handleAssignStaff = (bookingId: string) => {
    const booking = apiBookings.find((b) => b.id === bookingId);
    if (booking) {
      setSelectedBookingForStaff(bookingId);
      setSelectedActualOrderId(booking.id);
      setIsAssignStaffModalOpen(true);
    } else {
      toast.error("Booking not found.");
    }
  };

  const handleCancelBooking = (bookingId: string) => {};

  const handleDeleteBooking = (bookingId: string) => {};

  const handleContactPatient = (phone: string) => {
    toast.success(`Calling patient: ${phone}`);
  };

  const handleEditOrder = (bookingId: string) => {};

  const handleUpdateAssignedStaff = (bookingId: string, staffs: any[]) => {
    setApiBookings((prev) =>
      prev.map((order) => {
        if (order.id === bookingId) {
          return {
            ...order,
            staff_details: staffs.map((staff) => ({
              name: staff.name,
              id: staff.id,
            })),
          };
        }
        return order;
      })
    );

    setIsAssignStaffModalOpen(false);
  };

  const handleNewBooking = () => {
    setIsAddBookingModalOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(apiBookings.map((booking) => booking.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings((prev) => [...prev, bookingId]);
    } else {
      setSelectedBookings((prev) => prev.filter((id) => id !== bookingId));
    }
  };

  const isAllSelected =
    apiBookings.length > 0 && selectedBookings.length === apiBookings.length;
  const isIndeterminate =
    selectedBookings.length > 0 && selectedBookings.length < apiBookings.length;

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return apiBookings;

    return apiBookings.filter((booking) => {
      const idMatch = booking.id
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const nameMatch = booking.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return idMatch || nameMatch;
    });
  }, [apiBookings, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Booking Management
          </h1>
          {/* <button
            onClick={handleNewBooking}
            className="flex items-center text-[12px] gap-2 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button> */}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#899193] w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order id, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 text-[12px] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder:text-gray-400 text-black"
            />
          </div>

          <div className="relative">
            {/* <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[150px] justify-between"
            >
              <span className="text-[#161D1F] text-[12px]">
                {formatStatusDisplay(statusFilter)}
              </span>
              <ChevronDown className="w-4 h-4 text-[#899193]" />
            </button> */}
            {/* {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsStatusDropdownOpen(false);
                        // Trigger fetch on status change
                        if (status !== statusFilter) fetchOrders();
                      }}
                      className="w-full px-4 py-2 text-left text-[12px] text-[#161D1F] hover:bg-gray-50 transition-colors"
                    >
                      {formatStatusDisplay(status)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={handleSearch}
              className="ml-4 px-4 py-2 text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors text-[12px] hidden sm:block"
            >
              Apply
            </button> */}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            All Bookings
            <span className="ml-2 text-[#899193] text-[14px] font-normal text-base">
              {apiBookings.length} Bookings
            </span>
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-[#899193] uppercase tracking-wider">
                    Booking Detail
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-[#899193] uppercase tracking-wider">
                    Customer Detail
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-[#899193] uppercase tracking-wider">
                    Booking Status
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-[#899193] uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-[#899193] uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-[#899193] uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-[#899193] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                      onClick={fetchOrders}
                      className="mt-2 text-sm text-cyan-600 hover:text-cyan-700"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : (
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={(e) =>
                            handleSelectBooking(booking.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-[12px] text-[#161D1F]">
                            {booking.id.slice(0, 6).toUpperCase()}
                          </div>
                          <div className="text-[10px] text-[#899193]">
                            {booking.order_date
                              ? new Date(booking.order_date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "N/A"}
                          </div>
                          <div className="text-xs text-[#899193]">
                            Booking ID: {booking.id.slice(0, 8).toUpperCase()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-[12px] text-[#161D1F]">
                            {booking.customer_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenStatusDropdown(
                                openStatusDropdown === booking.id
                                  ? null
                                  : booking.id
                              )
                            }
                            disabled={updatingStatus === booking.id}
                            className={`px-3 py-1 rounded-full text-[10px] font-medium ${getStatusColor(
                              booking.order_status
                            )} flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-50`}
                          >
                            {updatingStatus === booking.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                {formatStatusDisplay(booking.order_status)}
                                <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>
                          {openStatusDropdown === booking.id && (
                            <div className="absolute left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <div className="py-1">
                                {orderStatuses.map((status) => (
                                  <button
                                    key={status.id}
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        status.id,
                                        status.value,
                                        booking.customer_id
                                      )
                                    }
                                    className="w-full px-3 py-2 text-left text-[10px] text-[#161D1F] hover:bg-gray-50 transition-colors"
                                  >
                                    {formatStatusDisplay(status.value)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-medium ${getPaymentColor(
                            booking.payment_status
                          )}`}
                        >
                          {booking.payment_status === "Refunded"
                            ? "Paid"
                            : booking.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-[#161D1F] px-3 py-1 rounded-full text-[10px]">
                          {booking.homecare_service_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-[12px] text-[#161D1F]">
                            ₹{parseFloat(booking.order_total).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu
                          booking={booking}
                          onViewDetails={handleViewDetails}
                          onEditBooking={handleEditBooking}
                          onAssignStaff={handleAssignStaff}
                          onCancelBooking={handleCancelBooking}
                          onDeleteBooking={handleDeleteBooking}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>

        {apiBookings.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-[#899193] text-lg">
              No bookings found matching your criteria.
            </p>
          </div>
        )}

        {selectedBookings.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-[#161D1F] font-medium">
                {selectedBookings.length} booking(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    selectedBookings.forEach((id) => handleAssignStaff(id));
                    setSelectedBookings([]);
                  }}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-[10px]"
                >
                  Assign Staff to All
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to cancel ${selectedBookings.length} booking(s)?`
                      )
                    ) {
                      setSelectedBookings([]);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-[10px]"
                >
                  Cancel All
                </button>
                <button
                  onClick={() => setSelectedBookings([])}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-[10px]"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          booking={selectedBooking}
          onAssignStaff={handleAssignStaff}
          onContactPatient={handleContactPatient}
          onEditOrder={handleEditOrder}
        />
        <AddBookingModal
          isOpen={isAddBookingModalOpen}
          onClose={() => setIsAddBookingModalOpen(false)}
        />
        <AssignStaffModal
          isOpen={isAssignStaffModalOpen}
          onClose={() => setIsAssignStaffModalOpen(false)}
          bookingId={selectedBookingForStaff}
          actualOrderId={selectedActualOrderId}
          onUpdateStaff={handleUpdateAssignedStaff}
        />
      </div>
    </div>
  );
};

export default BookingManagement;
