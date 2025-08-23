"use client";
import React, { useState } from "react";
import { Search, Plus, ChevronDown } from "lucide-react";
import { bookingsData } from "./bookingData";
import DropdownMenu from "./DropdownMenu";
import BookingModal from "./BookingModal";
import AddBookingModal from "./AddBookingModal";

interface Booking {
  id: string;
  bookingId: string;
  date: string;
  customer: {
    name: string;
    location: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    address: string;
  };
  status: "Pending Assignment" | "In Progress" | "Completed" | "Cancelled";
  payment: "Partial Payment" | "Paid" | "Refunded";
  service: string;
  serviceDetails: {
    name: string;
    description: string;
    pricePerDay: number;
  };
  total: number;
  gst: number;
  priority: "High Priority" | "Medium Priority" | "Low Priority";
  scheduled: string;
  duration: string;
  currentMedication: string;
  medicalCondition: string;
  emergencyContact: {
    name: string;
    number: string;
  };
  assignedStaff: string | null;
}
const statusOptions = [
  "All Status",
  "Pending Assignment",
  "In Progress",
  "Completed",
  "Cancelled",
];

// Main Booking Management Component
const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(bookingsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);

  // Filter bookings based on search term and status
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Assignment":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentColor = (payment: string) => {
    switch (payment) {
      case "Partial Payment":
        return "bg-yellow-100 text-yellow-800";
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High Priority":
        return "bg-red-100 text-red-800";
      case "Medium Priority":
        return "bg-yellow-100 text-yellow-800";
      case "Low Priority":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleEditBooking = (bookingId: string) => {
    console.log("Edit booking:", bookingId);
    alert(`Edit booking: ${bookingId}`);
  };

  const handleAssignStaff = (bookingId: string) => {
    console.log("Assign staff to booking:", bookingId);
    alert(`Assign staff to booking: ${bookingId}`);
  };

  const handleCancelBooking = (bookingId: string) => {
    console.log("Cancel booking:", bookingId);
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "Cancelled" as const,
                payment: "Refunded" as const,
              }
            : booking
        )
      );
      alert(`Booking ${bookingId} has been cancelled`);
    }
  };

  const handleDeleteBooking = (bookingId: string) => {
    console.log("Delete booking:", bookingId);
    if (
      window.confirm(
        "Are you sure you want to delete this booking? This action cannot be undone."
      )
    ) {
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
      alert(`Booking ${bookingId} has been deleted`);
    }
  };

  const handleContactPatient = (phone: string) => {
    console.log("Contact patient:", phone);
    alert(`Calling patient: ${phone}`);
  };

  const handleEditOrder = (bookingId: string) => {
    console.log("Edit order:", bookingId);
    alert(`Edit order: ${bookingId}`);
  };

  const handleNewBooking = () => {
    setIsAddBookingModalOpen(true);
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(filteredBookings.map((booking) => booking.id));
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
    filteredBookings.length > 0 &&
    selectedBookings.length === filteredBookings.length;
  const isIndeterminate =
    selectedBookings.length > 0 &&
    selectedBookings.length < filteredBookings.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Booking Management
          </h1>
          <button
            onClick={handleNewBooking}
            className="flex items-center text-[12px] gap-2 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#899193]  w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order id, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 text-[12px] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[150px] justify-between"
            >
              <span className="text-[#161D1F] text-[12px]">{statusFilter}</span>
              <ChevronDown className="w-4 h-4 text-[#899193]" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[#161D1F] hover:bg-gray-50 transition-colors"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookings Count */}
        <div className="mb-6">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            All Bookings
            <span className="ml-2 text-[#899193] text-[14px] font-normal text-base">
              {filteredBookings.length} Bookings
            </span>
          </h2>
        </div>

        {/* Table */}
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
                          {booking.id}
                        </div>
                        <div className="text-[10px] text-[#899193]">
                          {booking.date}
                        </div>
                        <div className="text-xs text-[#899193]">
                          Booking ID: {booking.bookingId}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-medium ${getPriorityColor(
                              booking.priority
                            )}`}
                          >
                            {booking.priority}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-[12px] text-[#161D1F]">
                          {booking.customer.name}
                        </div>
                        <div className="text-[10px] text-[#899193] flex items-center gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          {booking.customer.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-medium ${getPaymentColor(
                          booking.payment
                        )}`}
                      >
                        {booking.payment}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-[#161D1F] px-3 py-1 rounded-full text-[10px]">
                        {booking.service}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-[12px] text-[#161D1F]">
                          ₹{booking.total.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#899193]">
                          Incl. GST: ₹{booking.gst.toFixed(2)}
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
            </table>
          </div>
        </div>

        {/* No results message */}
        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#899193] text-lg">
              No bookings found matching your criteria.
            </p>
          </div>
        )}

        {/* Selected bookings actions */}
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
                      setBookings((prev) =>
                        prev.map((booking) =>
                          selectedBookings.includes(booking.id)
                            ? {
                                ...booking,
                                status: "Cancelled" as const,
                                payment: "Refunded" as const,
                              }
                            : booking
                        )
                      );
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
      </div>
    </div>
  );
};

export default BookingManagement;
