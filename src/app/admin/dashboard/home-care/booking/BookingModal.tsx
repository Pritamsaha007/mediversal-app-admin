import React from "react";
import { X, User, Phone, Edit } from "lucide-react";
import { Booking } from "./bookingData";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onAssignStaff: (bookingId: string) => void;
  onContactPatient: (phone: string) => void;
  onEditOrder: (bookingId: string) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            Booking ID: {booking.id}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-[#899193]" />
          </button>
        </div>

        {/* Status Badges */}
        <div className="p-6 border-b">
          <div className="flex gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentColor(
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
            <div className="rounded-lg p-6">
              <h3 className="text-[14px] font-semibold text-[#161D1F] mb-4">
                Patient Information
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Patient Name
                    </p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {booking.customer.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Patient Age
                    </p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {booking.customer.age} Years
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Patient Gender
                    </p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {booking.customer.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Phone Number
                    </p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {booking.customer.phone}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">Email</p>
                  <p className="font-medium text-[12px] text-[#161D1F]">
                    {booking.customer.email}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">Address</p>
                  <p className="font-medium text-[12px] text-[#161D1F]">
                    {booking.customer.address}
                  </p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-[14px] font-semibold text-[#161D1F] mb-4">
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Contact Name
                    </p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {booking.emergencyContact.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Contact Number
                    </p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {booking.emergencyContact.number}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-[14px] font-semibold text-[#161D1F] mb-4">
                Booking Information
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-[#899193] mb-1">
                    Booking Amount
                  </p>
                  <p className="font-medium text-[12px] text-[#161D1F]">
                    ₹{booking.total.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">Scheduled</p>
                  <p className="font-medium text-[12px] text-[#161D1F]">
                    {booking.scheduled}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">Duration</p>
                  <p className="font-medium text-[12px] text-[#161D1F]">
                    {booking.duration}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">
                    Current Medication
                  </p>
                  <p className="font-medium text-[12px] text-[#161D1F]">
                    {booking.currentMedication}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#899193] mb-1">
                    Medical Condition
                  </p>
                  <p className="font-medium text-[12px] text-[#161D1F]">
                    {booking.medicalCondition}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service & Offering */}
          <div className="mt-8">
            <h3 className="text-[14px] font-semibold text-[#161D1F] mb-4">
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
                  <p className="font-medium text-[12px] text-[#161D1F]">
                    ₹{booking.serviceDetails.pricePerDay}/day
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-[#161D1F] mb-2">
                  {booking.serviceDetails.name}
                </h4>
                <p className="text-[#899193] text-sm">
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
                <p className="font-medium text-[12px] text-[#161D1F]">
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
              <User className="w-5 h-5" />
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

export default BookingModal;
