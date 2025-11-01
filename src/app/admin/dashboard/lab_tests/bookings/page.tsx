"use client";
import React, { useEffect, useState } from "react";
import StatusBadge from "../../home-care/components/StatusBadge";
import StatsCard from "../../home-care/components/StatsCard";
import {
  Search,
  ChevronDown,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import { AssignPhlebotomistModal } from "./components/assignStaff";
import ViewBookingModal from "./components/viewBooking";
import {
  LabTestBooking,
  PatientDetailsList,
  SearchLabTestBookingsPayload,
  UpdateLabTestBookingPayload,
} from "./type";
import { searchLabTestBookings, updateLabTestBooking } from "../services";
import { useAdminStore } from "@/app/store/adminStore";
import { getOrderStatus } from "../../home-care/booking/services/api/orderServices";

interface BookingStats {
  todaysBookings: number;
  todaysRevenue: number;
  totalRevenue: number;
}
const statusOptions = ["Pending", "Completed", "Cancelled"];

interface OrderStatusEnum {
  id: string;
  slno: number;
  code: string;
  value: string;
  description: string | null;
  metadata: any | null;
}

const BookingsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [bookings, setBookings] = useState<LabTestBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<LabTestBooking[]>(
    []
  );
  const [openDropdown, setOpenDropdown] = useState<null | "status">(null);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(
    null
  );
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(
    null
  );
  const [showViewBooking, setShowViewBooking] = useState(false);
  const [showAssignPhlebotomist, setShowAssignPhlebotomist] = useState(false);
  const [selectedBookingForView, setSelectedBookingForView] =
    useState<LabTestBooking | null>(null);
  const [selectedBookingForAssign, setSelectedBookingForAssign] =
    useState<LabTestBooking | null>(null);
  const { token } = useAdminStore();

  const [orderStatuses, setOrderStatuses] = useState<OrderStatusEnum[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrderStatuses = async () => {
    try {
      const response = await getOrderStatus(token);
      if (response.success) {
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
  };

  const statusOptions = [
    "All Status",
    "Completed",
    "Pending",
    "In Progress",
    "Cancelled",
    "Scheduled",
  ];

  const mapOrderStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
      case "PENDING_ASSIGNMENT":
        return "Pending" as const;
      case "IN_PROGRESS":
      case "INPROGRESS":
      case "IN-PROGRESS":
        return "In Progress" as const;
      case "COMPLETED":
        return "Completed" as const;
      case "CANCELLED":
        return "Cancelled" as const;
      default:
        return "Pending" as const;
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const payload: SearchLabTestBookingsPayload = {
        start: 0,
        max: null,
        search_text: searchTerm || null,
        filter_status:
          selectedStatus !== "All Status" ? [selectedStatus] : null,
        sort_by: "created_date",
        sort_order: "DESC",
      };

      const response = await searchLabTestBookings(payload, token);
      console.log(response, "bookings");
      if (response.success) {
        setBookings(response.labTestBookings);
        setFilteredBookings(response.labTestBookings);
      } else {
        toast.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Error loading bookings");
    } finally {
      setLoading(false);
    }
  };

  const generateStats = (): BookingStats => {
    const today = new Date().toISOString().split("T")[0];

    const todaysBookings = bookings.filter(
      (booking) => booking.booking_date.split("T")[0] === today
    ).length;

    const todaysRevenue = bookings.reduce((sum, booking) => {
      const value = booking.today_revenue ?? "0";
      const num = parseFloat(value) || 0;
      return sum + num;
    }, 0);

    const totalRevenue = bookings.reduce((sum, booking) => {
      const value = booking.total_revenue ?? "0";
      const num = parseFloat(value) || 0;
      return sum + num;
    }, 0);

    return {
      todaysBookings,
      todaysRevenue,
      totalRevenue,
    };
  };

  const stats = generateStats();

  useEffect(() => {
    fetchBookings();
    fetchOrderStatuses();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedStatus]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings([...selectedBookings, bookingId]);
    } else {
      setSelectedBookings(selectedBookings.filter((id) => id !== bookingId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(filteredBookings.map((booking) => booking.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getStatusIdFromValue = (
    statusValue: string,
    orderStatuses: OrderStatusEnum[]
  ): string => {
    const status = orderStatuses.find(
      (s) => s.value.toLowerCase() === statusValue.toLowerCase()
    );
    return status?.id || orderStatuses[0]?.id;
  };

  const handleOrderStatusChange = async (
    bookingId: string,
    newStatus: string
  ) => {
    setUpdatingStatus(bookingId);

    const optimisticBookings = bookings.map((booking) =>
      booking.id === bookingId
        ? {
            ...booking,
            status: newStatus,
          }
        : booking
    );
    setBookings(optimisticBookings);
    setOpenStatusDropdown(null);

    try {
      const statusId = getStatusIdFromValue(newStatus, orderStatuses);

      const updatePayload: UpdateLabTestBookingPayload = {
        id: bookingId,
        status_id: statusId,
      };

      const response = await updateLabTestBooking(updatePayload, token);

      if (response.success) {
        toast.success(`Booking status updated to ${newStatus}`);

        fetchBookings();
      } else {
        throw new Error("Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");

      fetchBookings();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAssignPhlebotomist = (booking: LabTestBooking) => {
    setSelectedBookingForAssign(booking);
    setShowAssignPhlebotomist(true);
    setOpenActionDropdown(null);
  };

  const handlePhlebotomistAssigned = () => {
    fetchBookings();
    toast.success("Phlebotomist assigned successfully");
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "not paid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewBooking = (booking: LabTestBooking) => {
    setSelectedBookingForView(booking);
    setShowViewBooking(true);
    setOpenActionDropdown(null);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        const updatedBookings = bookings.filter(
          (booking) => booking.id !== bookingId
        );
        setBookings(updatedBookings);
        toast.success("Booking deleted successfully");
      } catch (error) {
        toast.error("Failed to delete booking");
      }
    }
  };

  const formatPatientNames = (patientDetails: PatientDetailsList) => {
    return patientDetails.patients_list
      .map((patient) => patient.name)
      .join(", ");
  };

  const formatBookingId = (id: string) => {
    return `${id.substring(0, 8).toUpperCase()}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
        setOpenDropdown(null);
      }
      if (!target.closest(".status-dropdown")) {
        setOpenStatusDropdown(null);
      }
      if (!target.closest(".action-dropdown")) {
        setOpenActionDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Bookings Management
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <StatsCard
            title="Today's Bookings"
            stats={stats.todaysBookings}
            icon={<Calendar className="w-5 h-5" />}
            color="text-blue-500"
          />
          <StatsCard
            title="Today's Revenue"
            stats={`₹ ${stats.todaysRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="text-green-500"
          />
          <StatsCard
            title="Total Revenue"
            stats={`₹ ${stats.totalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="text-purple-500"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by booking ID, patient name, test name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "status" ? null : "status")
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
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

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Bookings
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredBookings.length} Bookings
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                      checked={
                        selectedBookings.length === filteredBookings.length &&
                        filteredBookings.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Patient Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">Loading bookings...</div>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No bookings found.</div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={(e) =>
                            handleSelectBooking(booking.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-xs font-medium text-[#161D1F] mb-1">
                            {booking.labtestnames.join(", ")}
                          </div>
                          <div className="text-xs text-gray-500">
                            Booking ID: {formatBookingId(booking.id)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Date:{" "}
                            {new Date(
                              booking.booking_date
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-xs font-medium text-[#161D1F] mb-1">
                            {formatPatientNames(booking.patient_details)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Patients:{" "}
                            {booking.patient_details.patients_list.length}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative status-dropdown">
                          <button
                            onClick={() =>
                              setOpenStatusDropdown(
                                openStatusDropdown === booking.id
                                  ? null
                                  : booking.id
                              )
                            }
                            disabled={updatingStatus === booking.id}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                              booking.status
                            )} hover:opacity-80 transition-opacity ${
                              updatingStatus === booking.id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {updatingStatus === booking.id
                              ? "Updating..."
                              : booking.status}
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </button>
                          {openStatusDropdown === booking.id && (
                            <div className="absolute left-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                              <ul className="flex flex-col divide-y divide-gray-200">
                                {orderStatuses.map((status) => (
                                  <li key={status.id}>
                                    <button
                                      onClick={() =>
                                        handleOrderStatusChange(
                                          booking.id,
                                          status.value
                                        )
                                      }
                                      disabled={updatingStatus === booking.id}
                                      className="w-full px-3 py-2 text-left text-[12px] text-[#161D1F] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {status.value}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${getPaymentStatusColor(
                            booking.payment_status
                          )}`}
                        >
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-[#161D1F]">
                          ₹{" "}
                          {parseFloat(booking.amount).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="relative action-dropdown">
                            <button
                              onClick={() =>
                                setOpenActionDropdown(
                                  openActionDropdown === booking.id
                                    ? null
                                    : booking.id
                                )
                              }
                              className="p-1 text-gray-500 hover:text-blue-500"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {openActionDropdown === booking.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                <ul className="flex flex-col divide-y divide-gray-200">
                                  <li>
                                    <button
                                      onClick={() => handleViewBooking(booking)}
                                      className="w-full px-3 py-2 text-left text-[12px] text-[#161D1F] hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                      <Eye className="w-3 h-3" />
                                      View Details
                                    </button>
                                  </li>
                                  {(booking.status === "PENDING" ||
                                    booking.status === "SCHEDULED") && (
                                    <li>
                                      <button
                                        onClick={() =>
                                          handleAssignPhlebotomist(booking)
                                        }
                                        className="w-full px-3 py-2 text-left text-[12px] text-[#161D1F] hover:bg-gray-50 transition-colors flex items-center gap-2"
                                      >
                                        Assign Phlebotomist
                                      </button>
                                    </li>
                                  )}
                                  {/* <li>
                                    <button
                                      onClick={() =>
                                        handleDeleteBooking(booking.id)
                                      }
                                      className="w-full px-3 py-2 text-left text-[12px] text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      Delete Booking
                                    </button>
                                  </li> */}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ViewBookingModal
        isOpen={showViewBooking}
        onClose={() => {
          setShowViewBooking(false);
          setSelectedBookingForView(null);
        }}
        booking={selectedBookingForView}
      />

      <AssignPhlebotomistModal
        isOpen={showAssignPhlebotomist}
        onClose={() => {
          setShowAssignPhlebotomist(false);
          setSelectedBookingForAssign(null);
        }}
        booking={selectedBookingForAssign}
      />
    </div>
  );
};

export default BookingsManagement;
