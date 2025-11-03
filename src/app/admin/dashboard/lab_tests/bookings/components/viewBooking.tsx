import React, { useEffect, useState } from "react";
import { X, Clock, User } from "lucide-react";
import { BookingDetailsResponse, LabTestBooking } from "../type";
import { useAdminStore } from "@/app/store/adminStore";
import { getBookingById } from "../../services";

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
  const [bookingDetails, setBookingDetails] =
    useState<BookingDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAdminStore();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!isOpen || !booking?.id) return;

      setLoading(true);
      try {
        const data = await getBookingById(booking.id, token);
        console.log(data, "data");
        setBookingDetails(data);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [isOpen, booking?.id, token]);

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

  const formatTime = (timeNumber: number) => {
    const hours = Math.floor(timeNumber / 100);
    const minutes = timeNumber % 100;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const primaryPatient = bookingDetails?.booking?.patient_details
    ?.patients_list?.[0] || {
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
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading booking details...</div>
            </div>
          ) : (
            <>
              <div className="">
                <h3 className="text-[16px] font-semibold text-[#161D1F] mb-2">
                  {bookingDetails?.booking?.lab_tests
                    ?.map((test) => test.name)
                    .join(", ") ||
                    booking.labtestnames?.join(", ") ||
                    "Lab Tests"}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span>Booking ID: {booking.id}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(
                      bookingDetails?.booking?.booking_date ||
                        booking.booking_date
                    )}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#161D1F] font-medium">
                    Tags:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 rounded-md text-xs border text-[#9B51E0] border-[#9B51E0]`}
                    >
                      Lab Test
                    </span>
                    <span
                      className={`px-3 py-1 rounded-md text-xs border ${
                        bookingDetails?.booking?.status?.value?.toLowerCase() ===
                          "completed" ||
                        booking.status?.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-800 border-green-800"
                          : bookingDetails?.booking?.status?.value?.toLowerCase() ===
                              "in progress" ||
                            booking.status?.toLowerCase() === "in progress"
                          ? "bg-blue-100 text-blue-800 border-blue-800"
                          : bookingDetails?.booking?.status?.value?.toLowerCase() ===
                              "scheduled" ||
                            booking.status?.toLowerCase() === "scheduled"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-800"
                          : "bg-yellow-100 text-yellow-800 border-yellow-800"
                      }`}
                    >
                      {bookingDetails?.booking?.status?.value ||
                        booking.status ||
                        "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {bookingDetails?.booking?.phlebotomist && (
                <div>
                  <h4 className="text-xs font-semibold text-[#161D1F] mb-3">
                    Assigned Phlebotomist
                  </h4>
                  <div className="rounded-lg p-4 border border-gray-200 bg-green-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-semibold text-[#161D1F]">
                            {bookingDetails.booking.phlebotomist.name}
                          </h5>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                            Assigned
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                          <span>
                            License:
                            {bookingDetails.booking.phlebotomist.license_no}
                          </span>
                          <span>
                            City:
                            {
                              bookingDetails.booking.phlebotomist?.service_city
                                ?.value
                            }
                          </span>
                          <span
                            className={`px-2 py-1 rounded-md ${
                              bookingDetails.booking.phlebotomist
                                .is_home_collection_certified
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {bookingDetails.booking.phlebotomist
                              .is_home_collection_certified
                              ? "Home Collection Certified"
                              : "Standard"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <span className="text-xs text-[#161D1F] font-medium">
                  Report Preparation Time:
                </span>
                <span className="ml-2 text-xs text-[#161D1F]">
                  {bookingDetails?.booking?.lab_tests?.[0]?.report_time_hrs ||
                    6}{" "}
                  Hrs.
                </span>
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
                        {bookingDetails?.booking?.patient_details?.patients_list
                          ?.length ||
                          booking.patient_details?.patients_list?.length ||
                          1}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#161D1F] font-medium">
                        Payment Status:
                      </span>
                      <span className="ml-2 text-xs text-[#161D1F]">
                        {bookingDetails?.booking?.payment_status ||
                          booking.payment_status ||
                          "Unknown"}
                      </span>
                    </div>
                  </div>

                  {bookingDetails?.booking?.patient_details?.patients_list &&
                    bookingDetails.booking.patient_details.patients_list
                      .length > 1 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-[#161D1F] font-medium block mb-2">
                          All Patients:
                        </span>
                        <div className="space-y-2">
                          {bookingDetails.booking.patient_details.patients_list.map(
                            (patient, index) => (
                              <div
                                key={index}
                                className="text-xs text-[#161D1F]"
                              >
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
                        {formatDate(
                          bookingDetails?.booking?.booking_date ||
                            booking.booking_date
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#161D1F] font-medium">
                        Booking Time:
                      </span>
                      <span className="ml-2 text-xs text-[#161D1F]">
                        {bookingDetails?.booking?.booking_time
                          ? formatTime(bookingDetails.booking.booking_time)
                          : "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#161D1F] font-medium">
                        Created Date:
                      </span>
                      <span className="ml-2 text-xs text-[#161D1F]">
                        {formatDate(
                          bookingDetails?.booking?.created_date ||
                            booking.created_date
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#161D1F] font-medium">
                        Lab Test Charges:
                      </span>
                      <span className="ml-2 text-xs text-[#161D1F]">
                        ₹{" "}
                        {parseFloat(
                          bookingDetails?.booking?.price ||
                            booking.amount ||
                            "0"
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#161D1F] font-medium">
                        Customer ID:
                      </span>
                      <span className="ml-2 text-xs text-[#161D1F]">
                        {bookingDetails?.booking?.customer_id ||
                          booking.customer_id ||
                          "Not assigned"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#161D1F] font-medium">
                        Home Collection:
                      </span>
                      <span className="ml-2 text-xs text-[#161D1F]">
                        {bookingDetails?.booking?.can_sample_collected_at_home
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {bookingDetails?.booking.address_line1 != null && (
                <div>
                  <h4 className="text-xs font-semibold text-[#161D1F] mb-3">
                    Address Details
                  </h4>
                  <div className="rounded-lg p-4 border border-gray-200 bg-white">
                    <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                      <div>
                        <span className="text-xs text-[#161D1F] font-medium">
                          House No:
                        </span>
                        <span className="ml-2 text-xs text-[#161D1F]">
                          {bookingDetails?.booking?.house_no || "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-[#161D1F] font-medium">
                          Area:
                        </span>
                        <span className="ml-2 text-xs text-[#161D1F]">
                          {bookingDetails?.booking?.area || "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-[#161D1F] font-medium">
                          Landmark:
                        </span>
                        <span className="ml-2 text-xs text-[#161D1F]">
                          {bookingDetails?.booking?.landmark || "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-[#161D1F] font-medium">
                          City:
                        </span>
                        <span className="ml-2 text-xs text-[#161D1F]">
                          {bookingDetails?.booking?.city || "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-[#161D1F] font-medium">
                          Pincode:
                        </span>
                        <span className="ml-2 text-xs text-[#161D1F]">
                          {bookingDetails?.booking?.pincode || "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-[#161D1F] font-medium">
                          Recipient:
                        </span>
                        <span className="ml-2 text-xs text-[#161D1F]">
                          {bookingDetails?.booking?.recepient_name ||
                            "Not specified"}{" "}
                          (
                          {bookingDetails?.booking?.recepient_phone ||
                            "No phone"}
                          )
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
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
