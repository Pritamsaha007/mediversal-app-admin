"use client";
import React, { useEffect, useState } from "react";
import StatusBadge from "../../home-care/components/StatusBadge";
import StatsCard from "../../home-care/components/StatsCard";
import {
  Search,
  ChevronDown,
  Plus,
  Settings,
  Activity,
  Users,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  MoreVertical,
  MoreHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import { AssignPhlebotomistModal } from "./components/assignStaff";
import ViewBookingModal from "./components/viewBooking";

interface BookingType {
  id: string;
  bookingId: string;
  testName: string;
  patientName: string;
  patientId: string;
  status: "Completed" | "Pending" | "In Progress" | "Cancelled" | "Scheduled";
  paymentMethod: "Debit Card" | "Credit Card" | "Cash" | "Pending" | "UPI";
  paymentStatus: "Completed" | "Pending" | "Failed";
  amount: number;
  date: string;
  testType: string;
  contactNo?: string;
  email?: string;
  age?: string;
  gender?: string;
  sampleCollectionDate?: string;
  sampleCollectionTime?: string;
  appointedPhlebotomist?: string;
  labHospital?: string;
  reportPreparationTime?: string;
  symptomsReason?: string;
  testCategory?: string;
}
interface BookingStats {
  todaysBookings: number;
  todaysRevenue: number;
  totalRevenue: number;
}

const BookingsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingType[]>([]);
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
  const [selectedBookingForView, setSelectedBookingForView] =
    useState<BookingType | null>(null);

  const dummyBookings: BookingType[] = [
    {
      id: "1",
      bookingId: "UWA0007890",
      testName: "Ultrasound Whole Abdomen",
      patientName: "John Doe",
      patientId: "P-001",
      status: "Scheduled",
      paymentMethod: "UPI",
      paymentStatus: "Completed",
      amount: 699.0,
      date: "2024-01-15",
      testType: "Stomach, Liver",
      contactNo: "+91 62017 53532",
      email: "rakeshsinha4527@gmail.com",
      age: "29 Yrs.",
      gender: "Male",
      sampleCollectionDate: "18/09/2025",
      sampleCollectionTime: "5:00 PM - 6:00 PM",
      appointedPhlebotomist: "Pritam Saha",
      labHospital: "Mediversal Health Studio",
      reportPreparationTime: "6 Hrs.",
      symptomsReason:
        "Persistent fatigue and dizziness, advised for complete blood count (CBC).",
    },
  ];

  const statusOptions = [
    "All Status",
    "Completed",
    "Pending",
    "In Progress",
    "Cancelled",
    "Scheduled",
  ];

  const orderStatuses = [
    { id: "scheduled", value: "Scheduled" },
    { id: "in-progress", value: "In Progress" },
    { id: "completed", value: "Completed" },
    { id: "pending", value: "Pending" },
    { id: "cancelled", value: "Cancelled" },
  ];

  const generateStats = (): BookingStats => {
    const todaysBookings = bookings.filter(
      (booking) => booking.date === "2024-01-15"
    ).length;

    const todaysRevenue = bookings
      .filter(
        (booking) =>
          booking.date === "2024-01-15" && booking.paymentStatus === "Completed"
      )
      .reduce((sum, booking) => sum + booking.amount, 0);

    const totalRevenue = bookings
      .filter((booking) => booking.paymentStatus === "Completed")
      .reduce((sum, booking) => sum + booking.amount, 0);

    return {
      todaysBookings,
      todaysRevenue,
      totalRevenue,
    };
  };

  const stats = generateStats();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setBookings(dummyBookings);
      setFilteredBookings(dummyBookings);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.patientName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "All Status") {
      filtered = filtered.filter(
        (booking) => booking.status === selectedStatus
      );
    }

    setFilteredBookings(filtered);
  }, [searchTerm, selectedStatus, bookings]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const handleOrderStatusChange = (bookingId: string, newStatus: string) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId
        ? { ...booking, status: newStatus as any }
        : booking
    );
    setBookings(updatedBookings);
    setOpenStatusDropdown(null);
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
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewBooking = (booking: BookingType) => {
    setSelectedBookingForView(booking);
    setShowViewBooking(true);
    setOpenActionDropdown(null);
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

        {/* Search and Filter Section */}
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

        {/* Bookings Table */}
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
                            {booking.testName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Booking ID: {booking.bookingId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-xs font-medium text-[#161D1F] mb-1">
                            {booking.patientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {booking.patientId}
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
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                              booking.status
                            )} hover:opacity-80 transition-opacity`}
                          >
                            {booking.status}
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
                                      className="w-full px-3 py-2 text-left text-[12px] text-[#161D1F] hover:bg-gray-50 transition-colors"
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
                            booking.paymentStatus
                          )}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-[#161D1F]">
                          ₹{" "}
                          {booking.amount.toLocaleString("en-US", {
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
                                  <li>
                                    <button className="w-full px-3 py-2 text-left text-[12px] text-[#161D1F] hover:bg-gray-50 transition-colors">
                                      Assign Phlebotomist
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() => {
                                        const updatedBookings = bookings.filter(
                                          (b) => b.id !== booking.id
                                        );
                                        setBookings(updatedBookings);
                                        setOpenActionDropdown(null);
                                      }}
                                      className="w-full px-3 py-2 text-left text-[12px] text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      Delete Booking
                                    </button>
                                  </li>
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

      {/* View Booking Modal */}
      <ViewBookingModal
        isOpen={showViewBooking}
        onClose={() => {
          setShowViewBooking(false);
          setSelectedBookingForView(null);
        }}
        booking={selectedBookingForView}
      />
    </div>
  );
};

export default BookingsManagement;
