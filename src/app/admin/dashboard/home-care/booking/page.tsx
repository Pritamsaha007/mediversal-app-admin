"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Plus, ChevronDown, Download } from "lucide-react";
import DropdownMenu from "./components/DropdownMenu";
import BookingModal from "./components/BookingModal";
import AddBookingModal from "./components/AddBookingModal";
import AssignStaffModal from "./components/AssignStaffModal";

import { useAdminStore } from "../../../../store/adminStore";
import { ApiOrderResponse, DetailedBooking } from "./types";
import { getHomecareOrders, getOrderStatus, updateOrder } from "./services";
import toast from "react-hot-toast";
import Pagination from "@/app/components/common/pagination";

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

// Sort function for most recent first based on order_date
const sortByMostRecent = (orders: ApiOrderResponse[]): ApiOrderResponse[] => {
  return [...orders].sort((a, b) => {
    const dateA = a.order_date ? new Date(a.order_date).getTime() : 0;
    const dateB = b.order_date ? new Date(b.order_date).getTime() : 0;
    return dateB - dateA; // Most recent first
  });
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
  const [allBookings, setAllBookings] = useState<ApiOrderResponse[]>([]); // All fetched bookings
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedActualOrderId, setSelectedActualOrderId] =
    useState<string>("");
  const [orderStatuses, setOrderStatuses] = useState<OrderStatusEnum[]>([]);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(
    null,
  );
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  const fetchOrderStatuses = useCallback(async () => {
    try {
      const response = await getOrderStatus(token);
      if (response.success) {
        const relevantStatuses = (response.roles as OrderStatusEnum[]).filter(
          (status) =>
            ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
              status.value,
            ),
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
        const sortedOrders = sortByMostRecent(response.orders || []);
        setAllBookings(sortedOrders);
        setCurrentPage(0);
      } else {
        setError("Failed to fetch orders.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, statusFilter]);
  console.log(allBookings, "bookings");
  useEffect(() => {
    fetchOrders();
    fetchOrderStatuses();
  }, [fetchOrders, fetchOrderStatuses]);

  const handleSearch = () => {
    fetchOrders();
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * itemsPerPage < allBookings.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleExport = () => {
    if (allBookings.length === 0) {
      alert("No bookings to export");
      return;
    }

    const bookingsToExport =
      selectedBookings.length > 0
        ? allBookings.filter((b) => selectedBookings.includes(b.id))
        : paginatedBookings;

    exportBookingsToCSV(bookingsToExport);
  };

  const exportBookingsToCSV = (bookings: ApiOrderResponse[]) => {
    const headers = [
      "Booking ID",
      "Customer Name",
      "Order Date",
      "Booking Status",
      "Payment Status",
      "Service",
      "Total Amount",
      "Staff Assigned",
    ];

    const csvContent = [
      headers.join(","),
      ...bookings.map((booking) =>
        [
          booking.id.slice(0, 8).toUpperCase(),
          `"${booking.customer_name}"`,
          booking.order_date
            ? new Date(booking.order_date).toLocaleDateString("en-GB")
            : "N/A",
          formatStatusDisplay(booking.order_status),
          booking.payment_status,
          `"${booking.homecare_service_name}"`,
          parseFloat(booking.order_total).toFixed(2),
          `"${
            (booking as any).staff_details
              ?.map((s: any) => s.name)
              .join(", ") || "Not Assigned"
          }"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bookings_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedBookings = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allBookings.slice(startIndex, endIndex);
  }, [allBookings, currentPage, itemsPerPage]);

  const hasMore = useMemo(() => {
    return (currentPage + 1) * itemsPerPage < allBookings.length;
  }, [currentPage, allBookings.length, itemsPerPage]);

  const totalItems = allBookings.length;

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return paginatedBookings;

    return paginatedBookings.filter((booking) => {
      const idMatch = booking.ordernumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const nameMatch = booking.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return idMatch || nameMatch;
    });
  }, [paginatedBookings, searchTerm]);

  const handleStatusChange = async (
    orderId: string,
    statusId: string,
    statusValue: string,
    customer_id: string,
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
        setAllBookings((prev) =>
          sortByMostRecent(
            prev.map((order) =>
              order.id === orderId
                ? {
                    ...order,
                    order_status_id: statusId,
                    order_status: statusValue,
                    order_status_name: statusValue,
                  }
                : order,
            ),
          ),
        );

        setOpenStatusDropdown(null);

        toast.success(
          `Order status updated to ${formatStatusDisplay(statusValue)}`,
        );
      } else {
        throw new Error(response.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update order status",
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
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Unpaid":
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
    const booking = allBookings.find((b) => b.id === bookingId);
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
    setAllBookings((prev) =>
      sortByMostRecent(
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
        }),
      ),
    );

    setIsAssignStaffModalOpen(false);
  };

  const handleNewBooking = () => {
    setIsAddBookingModalOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(paginatedBookings.map((booking) => booking.id));
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
    paginatedBookings.length > 0 &&
    selectedBookings.length === paginatedBookings.length;
  const isIndeterminate =
    selectedBookings.length > 0 &&
    selectedBookings.length < paginatedBookings.length;

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
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              {selectedBookings.length > 0
                ? `Export Selected (${selectedBookings.length})`
                : "Export All"}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            All Bookings
            <span className="ml-2 text-[#899193] text-[14px] font-normal text-base">
              {totalItems} Bookings
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
                    Order Status
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
                      key={booking.ordernumber}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedBookings.includes(
                            booking.ordernumber,
                          )}
                          onChange={(e) =>
                            handleSelectBooking(
                              booking.ordernumber,
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-[12px] text-[#161D1F]">
                            {booking.ordernumber}
                          </div>
                          <div className="text-[10px] text-[#899193]">
                            {booking.order_date
                              ? new Date(booking.order_date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "N/A"}
                          </div>
                          {/* <div className="text-xs text-[#899193]">
                            Booking ID: {booking.id.slice(0, 8).toUpperCase()}
                          </div> */}
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
                                  : booking.id,
                              )
                            }
                            disabled={updatingStatus === booking.id}
                            className={`px-3 py-1 rounded-full text-[10px] font-medium ${getStatusColor(
                              booking.order_status,
                            )} flex items-center gap-1 hover:opacity-80 cursor-pointer transition-opacity disabled:opacity-50`}
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
                                        booking.customer_id,
                                      )
                                    }
                                    className="w-full px-3 py-2 text-left text-[10px] text-[#161D1F] hover:bg-gray-50 cursor-pointer transition-colors"
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
                            booking.payment_status,
                          )}`}
                        >
                          {booking.payment_status}
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

            {allBookings.length > 0 && (
              <Pagination
                currentPage={currentPage}
                hasMore={hasMore}
                loading={loading}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
                totalItems={currentPage + 1 * 20}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>

        {allBookings.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-[#899193] text-lg">
              No bookings found matching your criteria.
            </p>
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
          ordernumber={
            allBookings.find((b) => b.id === selectedBookingForStaff)
              ?.ordernumber
          }
          actualOrderId={selectedActualOrderId}
          onUpdateStaff={handleUpdateAssignedStaff}
        />
      </div>
    </div>
  );
};

export default BookingManagement;
