import React from "react";
import { X, Clock } from "lucide-react";

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

interface ViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingType | null;
}

const ViewBookingModal: React.FC<ViewBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  if (!isOpen || !booking) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-800";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-800";
      case "completed":
        return "bg-green-100 text-green-800 border-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-[#161D1F]">
            Booking Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Booking Header */}
          <div className="">
            <h3 className="text-[16px] font-semibold text-[#161D1F] mb-2">
              {booking.testName}
            </h3>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <span>Booking ID: {booking.bookingId}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {booking.testType}
              </span>
            </div>

            {/* Tags */}
            <div className="flex items-start gap-2">
              <span className="text-xs text-[#161D1F] font-medium">Tags:</span>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-md text-xs border  text-[#9B51E0] border-[#9B51E0]`}
                >
                  Lab/Hospital visit
                </span>
                <span
                  className={`px-3 py-1 rounded-md text-xs border bg-[#B78E12] text-white`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          {/* Report Preparation Time */}
          <div>
            <span className="text-xs text-[#161D1F] font-medium">
              Report Preparation Time:
            </span>
            <span className="ml-2 text-xs text-[#161D1F]">
              {booking.reportPreparationTime || "6 Hrs."}
            </span>
          </div>

          {/* Patient Details */}
          <div>
            <h4 className="text-xs font-semibold text-[#161D1F] mb-3 ">
              Patient Details
            </h4>
            <div className=" rounded-lg p-4 border border-gray-200  bg-[#E8F4F7]">
              <div className="grid grid-cols-2 gap-x-12 gap-y-3 ">
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Contact No.:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {booking.contactNo || "+91 62017 53532"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Age & Gender:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {booking.age || "29 Yrs."} | {booking.gender || "Male"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[#161D1F] font-medium">
                    Email ID:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {booking.email || "rakeshsinha4527@gmail.com"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Visit & Payment Details */}
          <div>
            <h4 className="text-xs font-semibold text-[#161D1F] mb-3">
              Hospital Visit & Payment Details
            </h4>
            <div className=" rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Sample Collection Date & Time:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {booking.sampleCollectionDate || "18/09/2025"} |{" "}
                    {booking.sampleCollectionTime || "5:00 PM - 6:00 PM"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Appointed Phlebotomist:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {booking.appointedPhlebotomist || "Pritam Saha"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Lab/Hospital:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {booking.labHospital || "Mediversal Health Studio"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Lab Test Charges:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    Rs. {booking.amount.toFixed(0)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[#161D1F] font-medium">
                    Payment Method:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {booking.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Symptoms/Reason for Visit */}
          <div>
            <h4 className="text-xs font-semibold text-[#161D1F] mb-3">
              Symptoms/Reason for Visit:
            </h4>
            <div className="rounded-lg p-4 border border-gray-200 bg-white">
              <p className="text-xs text-[#161D1F]">
                {booking.symptomsReason ||
                  "Persistent fatigue and dizziness, advised for complete blood count (CBC)."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-200 text-[#161D1F] rounded-lg text-xs hover:bg-gray-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewBookingModal;
