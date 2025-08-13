"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  UserPlus,
  X,
  Trash2,
  ChevronDown,
  Phone,
} from "lucide-react";
import { bookingsData } from "./bookingData";

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

// Booking Modal Component
const BookingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onAssignStaff: (bookingId: string) => void;
  onContactPatient: (phone: string) => void;
  onEditOrder: (bookingId: string) => void;
}> = ({
  isOpen,
  onClose,
  booking,
  onAssignStaff,
  onContactPatient,
  onEditOrder,
}) => {
  if (!isOpen || !booking) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-[10px] font-semibold text-[#161D1F]">
            Booking ID: {booking.id}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-[#899193]" />
          </button>
        </div>

        {/* Status Badges */}
        <div className="p-6 border-b">
          <div className="flex gap-3">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-medium ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-medium ${getPaymentColor(
                booking.payment
              )}`}
            >
              {booking.payment}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patient Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#161D1F] mb-4">
                Patient Information
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Patient Name
                    </p>
                    <p className="font-medium text-[#161D1F]">
                      {booking.customer.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Patient Age
                    </p>
                    <p className="font-medium text-[#161D1F]">
                      {booking.customer.age} Years
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Patient Gender
                    </p>
                    <p className="font-medium text-[#161D1F]">
                      {booking.customer.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Phone Number
                    </p>
                    <p className="font-medium text-[#161D1F]">
                      {booking.customer.phone}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">Email</p>
                  <p className="font-medium text-[#161D1F]">
                    {booking.customer.email}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">Address</p>
                  <p className="font-medium text-[#161D1F]">
                    {booking.customer.address}
                  </p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-[#161D1F] mb-4">
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Contact Name
                    </p>
                    <p className="font-medium text-[#161D1F]">
                      {booking.emergencyContact.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Contact Number
                    </p>
                    <p className="font-medium text-[#161D1F]">
                      {booking.emergencyContact.number}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#161D1F] mb-4">
                Booking Information
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-[#899193] mb-1">
                    Booking Amount
                  </p>
                  <p className="font-medium text-[#161D1F]">
                    ₹{booking.total.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">Scheduled</p>
                  <p className="font-medium text-[#161D1F]">
                    {booking.scheduled}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">Duration</p>
                  <p className="font-medium text-[#161D1F]">
                    {booking.duration}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">
                    Current Medication
                  </p>
                  <p className="font-medium text-[#161D1F]">
                    {booking.currentMedication}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">
                    Medical Condition
                  </p>
                  <p className="font-medium text-[#161D1F]">
                    {booking.medicalCondition}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service & Offering */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#161D1F] mb-4">
              Service & Offering
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="bg-cyan-600 text-white px-3 py-1 rounded text-[10px] font-medium">
                    Service: {booking.service}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#161D1F]">
                    ₹{booking.serviceDetails.pricePerDay}/day
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-[#161D1F] mb-2">
                  {booking.serviceDetails.name}
                </h4>
                <p className="text-[#899193] text-[10px]">
                  {booking.serviceDetails.description}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Staff */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#161D1F] mb-4">
              Assigned Staff
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              {booking.assignedStaff ? (
                <p className="font-medium text-[#161D1F]">
                  {booking.assignedStaff}
                </p>
              ) : (
                <p className="text-red-500 font-medium">No staff assigned</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => onAssignStaff(booking.id)}
              className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Assign Staff
            </button>

            <button
              onClick={() => onContactPatient(booking.customer.phone)}
              className="flex items-center gap-2 border border-gray-300 text-[#161D1F] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Contact Patient
            </button>

            <button
              onClick={() => onEditOrder(booking.id)}
              className="flex items-center gap-2 border border-gray-300 text-[#161D1F] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Edit Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dropdown Menu Component
const DropdownMenu: React.FC<{
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onEditBooking: (bookingId: string) => void;
  onAssignStaff: (bookingId: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onDeleteBooking: (bookingId: string) => void;
}> = ({
  booking,
  onViewDetails,
  onEditBooking,
  onAssignStaff,
  onCancelBooking,
  onDeleteBooking,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-[#899193]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-2">
            <button
              onClick={() => {
                onViewDetails(booking);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-[#161D1F] hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>

            <button
              onClick={() => {
                onEditBooking(booking.id);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-[#161D1F] hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Booking
            </button>

            <button
              onClick={() => {
                onAssignStaff(booking.id);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-[#161D1F] hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Assign Staff
            </button>

            <button
              onClick={() => {
                onCancelBooking(booking.id);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-[#161D1F] hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel Booking
            </button>

            <button
              onClick={() => {
                onDeleteBooking(booking.id);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Booking Management Component
const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(bookingsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

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
    console.log("Create new booking");
    alert("Create new booking functionality would be implemented here");
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

        {/* Booking Modal */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          booking={selectedBooking}
          onAssignStaff={handleAssignStaff}
          onContactPatient={handleContactPatient}
          onEditOrder={handleEditOrder}
        />
      </div>
    </div>
  );
};

export default BookingManagement;
