"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";

import StatsCard from "../../../../components/common/StatsCard";
import {
  Search,
  ChevronDown,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  UserPlus,
  Upload,
  Download,
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
import {
  searchLabTestBookings,
  updateLabTestBooking,
  uploadFile,
} from "../services";
import { useAdminStore } from "@/app/store/adminStore";
import { getOrderStatus } from "../../home-care/booking/services";
import Pagination from "../../../../components/common/pagination";

interface BookingStats {
  todaysBookings: number;
  todaysRevenue: number;
  totalRevenue: number;
}

interface OrderStatusEnum {
  id: string;
  slno: number;
  code: string;
  value: string;
  description: string | null;
  metadata: any | null;
}

const useDebounce = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);
};

const BookingsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [bookings, setBookings] = useState<LabTestBooking[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [openDropdown, setOpenDropdown] = useState<null | "status">(null);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(
    null,
  );
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(
    null,
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
            ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
              status.value,
            ),
        );
        setOrderStatuses(relevantStatuses);
      }
    } catch (err) {
      console.error("Failed to fetch order statuses:", err);
    }
  };

  const fetchBookings = async (page: number = 0) => {
    setLoading(true);
    setSelectedBookings([]);

    try {
      const pageSize = 20;
      const payload: SearchLabTestBookingsPayload = {
        start: page * pageSize,
        max: pageSize,
        search_text: currentSearchTerm || null,
        filter_status:
          selectedStatus !== "All Status" ? [selectedStatus] : null,
        sort_by: "created_date",
        sort_order: "DESC",
      };

      const response = await searchLabTestBookings(payload, token);
      console.log(response, "bookings");
      if (response.success) {
        setBookings(response.labTestBookings);
        setHasMore(response.labTestBookings.length === pageSize);
        setCurrentPage(page);
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

    const todaysBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.booking_date)
        .toISOString()
        .split("T")[0];
      return bookingDate === today;
    }).length;

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

  const updateSearchTerm = useCallback(() => {
    setCurrentSearchTerm(searchTerm);
  }, [searchTerm]);

  const debouncedUpdateSearchTerm = useDebounce(updateSearchTerm, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedUpdateSearchTerm();
  };

  const applyFiltersAndSearch = () => {
    fetchBookings(0);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (
        debouncedUpdateSearchTerm &&
        (debouncedUpdateSearchTerm as any).cancel
      ) {
        (debouncedUpdateSearchTerm as any).cancel();
      }
      setCurrentSearchTerm(searchTerm);
    }
  };

  const loadNextPage = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      fetchBookings(nextPage);
    }
  };

  const loadPreviousPage = () => {
    if (currentPage > 0 && !loading) {
      const prevPage = currentPage - 1;
      fetchBookings(prevPage);
    }
  };

  useEffect(() => {
    fetchBookings(0);
    fetchOrderStatuses();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [selectedStatus, currentSearchTerm, token]);

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
      setSelectedBookings(bookings.map((booking) => booking.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleReportUpload = async (bookingId: string) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx";

    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setLoading(true);

        if (
          !file.type.startsWith("image/") &&
          file.type !== "application/pdf"
        ) {
          toast.error("Please upload a valid image or PDF file.");
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error("File size should be less than 10MB.");
          return;
        }

        const fileContent = await fileToBase64(URL.createObjectURL(file));

        const bucketName =
          process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_DEV
            : process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_PROD;

        if (!bucketName) {
          throw new Error("S3 bucket name is not configured properly.");
        }

        const uploadRequest = {
          bucketName,
          folderPath: "labTestReports",
          fileName: `report_${bookingId}_${Date.now()}_${file.name}`,
          fileContent,
        };

        const uploadRes = await uploadFile(token!, uploadRequest);
        const reportUrl = uploadRes.result;

        const updatePayload: UpdateLabTestBookingPayload = {
          id: bookingId,
          report_url: reportUrl,
          report_received_date: new Date().toISOString(),
        };

        const response = await updateLabTestBooking(updatePayload, token);

        if (response.success) {
          toast.success("Report uploaded successfully!");
          fetchBookings(currentPage);
        } else {
          throw new Error("Failed to update booking with report");
        }
      } catch (error: any) {
        console.error("Report upload failed:", error);
        toast.error(error.message || "Failed to upload report");
      } finally {
        setLoading(false);
      }
    };

    fileInput.click();
  };

  const fileToBase64 = async (fileUri: string): Promise<string> => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result?.toString().split(",")[1];
          if (base64) {
            resolve(base64);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting file to base64:", error);
      throw error;
    }
  };

  const getStatusIdFromValue = (
    statusValue: string,
    orderStatuses: OrderStatusEnum[],
  ): string => {
    const status = orderStatuses.find(
      (s) => s.value.toLowerCase() === statusValue.toLowerCase(),
    );
    return status?.id || orderStatuses[0]?.id;
  };

  const handleOrderStatusChange = async (
    bookingId: string,
    newStatus: string,
  ) => {
    setUpdatingStatus(bookingId);

    const optimisticBookings = bookings.map((booking) =>
      booking.id === bookingId
        ? {
            ...booking,
            status: newStatus,
          }
        : booking,
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
        fetchBookings(currentPage);
      } else {
        throw new Error("Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
      fetchBookings(currentPage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAssignPhlebotomist = (booking: LabTestBooking) => {
    setSelectedBookingForAssign(booking);
    setShowAssignPhlebotomist(true);
    setOpenActionDropdown(null);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Fully Paid":
        return "bg-green-100 text-green-800";
      case "Not Paid":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "not paid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getOrderStatusColor = (status: string) => {
    const normalized = status?.toUpperCase();

    switch (normalized) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "SCHEDULED":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "CONFIRMED":
        return "bg-yellow-100 text-yellow-800";
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
          (booking) => booking.id !== bookingId,
        );
        setBookings(updatedBookings);
        toast.success("Booking deleted successfully");
      } catch (error) {
        toast.error("Failed to delete booking");
      }
    }
  };

  const formatPatientNames = (
    patientDetails: PatientDetailsList | null | undefined,
  ) => {
    if (!patientDetails || !patientDetails.patients_list) {
      return "No patient details";
    }

    const validPatients = patientDetails.patients_list
      .filter((patient) => patient && patient.name)
      .map((patient) => patient.name);

    return validPatients.length > 0 ? validPatients.join(", ") : "No patients";
  };

  const exportBookingsToCSV = (bookings: LabTestBooking[]) => {
    const headers = [
      "Booking ID",
      "Patient Names",
      "Test Names",
      "Booking Date",
      "Status",
      "Payment Status",
      "Amount (₹)",
      "Number of Patients",
      "Today's Revenue",
      "Total Revenue",
    ];

    const formatPatientNames = (
      patientDetails: PatientDetailsList | null | undefined,
    ) => {
      if (!patientDetails || !patientDetails.patients_list) {
        return "No patient details";
      }

      const validPatients = patientDetails.patients_list
        .filter((patient) => patient && patient.name)
        .map((patient) => patient.name);

      return validPatients.length > 0
        ? validPatients.join("; ")
        : "No patients";
    };

    const csvContent = [
      headers.join(","),
      ...bookings.map((b) =>
        [
          `"${b.id}"`,
          `"${formatPatientNames(b.patient_details)}"`,
          `"${
            Array.isArray(b.labtestnames)
              ? b.labtestnames.join("; ")
              : b.labtestnames || "No tests"
          }"`,
          `"${
            b.booking_date
              ? new Date(b.booking_date).toLocaleDateString()
              : "No date"
          }"`,
          b.status || "Unknown",
          b.payment_status || "Unknown",
          parseFloat(b.amount || "0").toFixed(2),
          b.patient_details?.patients_list?.length || 0,
          parseFloat(b.today_revenue || "0").toFixed(2),
          parseFloat(b.total_revenue || "0").toFixed(2),
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

  const handleExport = () => {
    if (bookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    const bookingsToExport =
      selectedBookings.length > 0
        ? bookings.filter((b) => selectedBookings.includes(b.id))
        : bookings;

    exportBookingsToCSV(bookingsToExport);
    toast.success(`Exported ${bookingsToExport.length} bookings successfully!`);
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
            color="text-[#0088B1]"
          />
          <StatsCard
            title="Today's Revenue"
            stats={`₹ ${stats.todaysRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
          <StatsCard
            title="Total Revenue"
            stats={`₹ ${stats.totalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking ID, patient name, test name..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={loading || bookings.length === 0}
              className={`flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50 ${
                loading || bookings.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <Download className="w-4 h-4" />
              {selectedBookings.length > 0
                ? `Export Selected (${selectedBookings.length})`
                : "Export All"}
            </button>
          </div>
          {/* <div className="flex gap-3">
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
          </div> */}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Bookings
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {bookings.length} Bookings on this page
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
                        selectedBookings.length === bookings.length &&
                        bookings.length > 0
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
                {loading && bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No bookings found.</div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
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
                            {Array.isArray(booking.labtestnames)
                              ? booking.labtestnames.join(", ")
                              : "No tests listed"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Booking ID: {booking.ordernumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            Date:{" "}
                            {booking.booking_date
                              ? new Date(
                                  booking.booking_date,
                                ).toLocaleDateString()
                              : "No date"}
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
                            {booking.patient_details?.patients_list?.length ||
                              0}
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
                                  : booking.id,
                              )
                            }
                            disabled={updatingStatus === booking.id}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${getOrderStatusColor(
                              booking.status,
                            )} hover:opacity-80 transition-opacity ${
                              updatingStatus === booking.id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {updatingStatus === booking.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                {booking?.status
                                  ? booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1).toLowerCase()
                                  : "Unknown"}
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </>
                            )}
                          </button>
                          {openStatusDropdown === booking.id &&
                            updatingStatus !== booking.id && (
                              <div className="absolute left-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                                <div className="flex flex-col ">
                                  {orderStatuses.map((status) => (
                                    <div key={status.id}>
                                      <button
                                        onClick={() =>
                                          handleOrderStatusChange(
                                            booking.id,
                                            status.value,
                                          )
                                        }
                                        disabled={updatingStatus === booking.id}
                                        className="w-full px-3 py-2 text-left text-[10px] text-[#161D1F] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {status.value.charAt(0).toUpperCase() +
                                          status.value.slice(1).toLowerCase()}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${getPaymentStatusColor(
                            booking.payment_status,
                          )}`}
                        >
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-[#161D1F]">
                          ₹{" "}
                          {parseFloat(
                            booking.total_order_amount || "0",
                          ).toLocaleString("en-US", {
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
                                    : booking.id,
                                )
                              }
                              className="p-1 text-gray-500 hover:text-[#0088B1] cursor-pointer"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {openActionDropdown === booking.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                <ul className="flex flex-col divide-y divide-gray-200">
                                  <li>
                                    <button
                                      onClick={() => handleViewBooking(booking)}
                                      className="w-full px-3 py-2 text-left text-[12px] text-[#161D1F] hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-2"
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
                                        className="w-full px-3 py-2 text-left text-[12px] text-[#161D1F] hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-2"
                                      >
                                        <UserPlus className="w-3 h-3" />
                                        Assign Phlebotomist
                                      </button>
                                    </li>
                                  )}
                                  {booking.status == "COMPLETED" && (
                                    <li>
                                      <button
                                        onClick={() =>
                                          handleReportUpload(booking.id)
                                        }
                                        className="w-full px-3 py-2 text-left text-[12px] text-[#161D1F] hover:bg-gray-50 transition-colors flex items-center gap-2"
                                      >
                                        <Upload className="w-3 h-3" />
                                        Upload Report
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {loading && bookings.length > 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            hasMore={hasMore}
            loading={loading}
            onPrevious={loadPreviousPage}
            onNext={loadNextPage}
            totalItems={bookings.length}
            itemsPerPage={20}
          />
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
