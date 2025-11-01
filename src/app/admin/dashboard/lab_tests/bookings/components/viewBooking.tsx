import React from "react";
import { X, Clock } from "lucide-react";
import { LabTestBooking } from "../type";

interface ViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: LabTestBooking | null;
}

const ViewBookingModal: React.FC<ViewBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const primaryPatient = booking.patient_details?.patients_list?.[0] || {
    name: "Unknown",
    age: 0,
    gender: "Unknown",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
          <div className="">
            <h3 className="text-[16px] font-semibold text-[#161D1F] mb-2">
              {booking.labtestnames?.join(", ") || "Lab Tests"}
            </h3>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <span>Booking ID: {booking.id}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(booking.booking_date)}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-xs text-[#161D1F] font-medium">Tags:</span>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-md text-xs border text-[#9B51E0] border-[#9B51E0]`}
                >
                  Lab Test
                </span>
                <span
                  className={`px-3 py-1 rounded-md text-xs border ${
                    booking.status?.toLowerCase() === "completed"
                      ? "bg-green-100 text-green-800 border-green-800"
                      : booking.status?.toLowerCase() === "in progress"
                      ? "bg-blue-100 text-blue-800 border-blue-800"
                      : booking.status?.toLowerCase() === "scheduled"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-800"
                      : "bg-yellow-100 text-yellow-800 border-yellow-800"
                  }`}
                >
                  {booking.status || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs text-[#161D1F] font-medium">
              Report Preparation Time:
            </span>
            <span className="ml-2 text-xs text-[#161D1F]">6 Hrs.</span>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#161D1F] mb-3">
              Patient Details
            </h4>
            <div className="rounded-lg p-4 border border-gray-200 bg-[#E8F4F7]">
              <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Patient Name:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {primaryPatient.name || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Age & Gender:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {primaryPatient.age || "0"} Yrs. |{" "}
                    {primaryPatient.gender || "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Total Patients:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {booking.patient_details?.patients_list?.length || 1}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Payment Status:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {booking.payment_status || "Unknown"}
                  </span>
                </div>
              </div>

              {booking.patient_details?.patients_list &&
                booking.patient_details.patients_list.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-[#161D1F] font-medium block mb-2">
                      All Patients:
                    </span>
                    <div className="space-y-2">
                      {booking.patient_details.patients_list.map(
                        (patient, index) => (
                          <div key={index} className="text-xs text-[#161D1F]">
                            {patient.name} - {patient.age} Yrs. -{" "}
                            {patient.gender}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#161D1F] mb-3">
              Test & Payment Details
            </h4>
            <div className="rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Booking Date:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {formatDate(booking.booking_date)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Created Date:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {formatDate(booking.created_date)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Lab Test Charges:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    ₹{" "}
                    {parseFloat(booking.amount || "0").toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Customer ID:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {booking.customer_id || "Not assigned"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#161D1F] mb-3">
              Test Information:
            </h4>
            <div className="rounded-lg p-4 border border-gray-200 bg-white">
              <p className="text-xs text-[#161D1F]">
                {booking.labtestnames?.join(", ") ||
                  "No test information available"}
              </p>
            </div>
          </div>
        </div>

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
