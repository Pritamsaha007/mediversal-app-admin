import React, { useEffect, useState } from "react";
import { X, User, Phone, Edit, Printer } from "lucide-react";
import AssignStaffModal from "./AssignStaffModal";
import { AssignedStaff } from "../staffData";
import {
  ApiOrderResponse,
  DetailedBooking,
  OrderDetailResponse,
} from "../types";
import { useAdminStore } from "@/app/store/adminStore";
import { getOrderById } from "../services";
import toast from "react-hot-toast";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: ApiOrderResponse | null;
  onAssignStaff: (bookingId: string) => void;
  onContactPatient: (phone: string) => void;
  onEditOrder: (bookingId: string) => void;
  onUpdateAssignedStaff?: (bookingId: string, staffs: AssignedStaff[]) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onAssignStaff,
  onContactPatient,
  onEditOrder,
  onUpdateAssignedStaff,
}) => {
  const [orderDetails, setOrderDetails] = useState<
    OrderDetailResponse["order"] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const { token } = useAdminStore();
  console.log(orderDetails, "orderDetails");
  const getDurationText = () => {
    const hours = orderDetails?.schedule_in_hours;
    const days = orderDetails?.schedule_in_days;

    const parts: string[] = [];

    if (hours && hours > 0) {
      parts.push(`${hours} ${hours === 1 ? "Hour" : "Hours"}`);
    }

    if (days && days > 0) {
      parts.push(`${days} ${days === 1 ? "Day" : "Days"}`);
    }

    return parts.join(" • ");
  };

  useEffect(() => {
    if (isOpen && booking?.id && token) {
      fetchOrderDetails();
    }
  }, [isOpen, booking?.id, token]);

  if (!isOpen || !booking) return null;

  const downloadAndPrintPDF = (url: string, orderId: string) => {
    try {
      const printFrame = document.createElement("iframe");
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "none";
      document.body.appendChild(printFrame);

      printFrame.onload = () => {
        setTimeout(() => {
          try {
            printFrame.contentWindow?.print();
          } catch (e) {
            console.error("Print error:", e);
            window.open(url, "_blank");
          }
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 1000);
        }, 500);
      };

      printFrame.src = url;
    } catch (error) {
      console.error("Error printing receipt:", error);
      toast.error("Failed to print receipt. Opening in new tab...");
      window.open(url, "_blank");
    }
  };

  const handlePrint = () => {
    if (!orderDetails?.receipt_url) {
      toast.error("Receipt not available");
      return;
    }

    downloadAndPrintPDF(orderDetails.receipt_url, orderDetails.id);
  };

  const fetchOrderDetails = async () => {
    if (!booking?.id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getOrderById(booking.id, token);
      if (response.success) {
        setOrderDetails(response.order);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch order details",
      );
    } finally {
      setLoading(false);
    }
  };

  const parsedOrderDetails = orderDetails
    ? JSON.parse(orderDetails.order_details)
    : null;
  const medicalInfo = parsedOrderDetails?.["Medical Information"] || {};
  const contactLocation = parsedOrderDetails?.["Contact & Location"] || {};

  if (!isOpen || !booking) return null;

  const getorder_statusColor = (order_status: string) => {
    switch (order_status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
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
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Unpaid":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStaffAssignment = (
    bookingId: string,
    staffs: AssignedStaff[],
  ) => {
    fetchOrderDetails();

    if (onUpdateAssignedStaff) {
      onUpdateAssignedStaff(bookingId, staffs);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-lg p-8">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b">
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

        <div className="flex-1 overflow-y-auto p-6">
          <div className="border-b pb-6">
            <div className="flex gap-3">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-medium ${getorder_statusColor(
                  booking.order_status,
                )}`}
              >
                {booking.order_status}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-medium ${getPaymentColor(
                  booking.payment_status,
                )}`}
              >
                {booking.payment_status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-lg p-6 border border-[#899193] bg-white">
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
                        {parsedOrderDetails?.Patient_name ||
                          orderDetails?.customer_details?.first_name +
                            " " +
                            orderDetails?.customer_details?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#899193] mb-1">
                        Patient Age
                      </p>
                      <p className="font-medium text-[12px] text-[#161D1F]">
                        {parsedOrderDetails?.Age || "Not specified"} Years
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-[#899193] mb-1">
                        Patient Gender
                      </p>
                      <p className="font-medium text-[12px] text-[#161D1F]">
                        Not specified
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#899193] mb-1">
                        Phone Number
                      </p>
                      <p className="font-medium text-[12px] text-[#161D1F]">
                        {contactLocation?.["Contact Number"] ||
                          orderDetails?.customer_details?.phone_number ||
                          "Not available"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">Email</p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {orderDetails?.customer_details?.email || "Not available"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Service Address
                    </p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {contactLocation?.["Service Address"] ||
                        "Address not available"}
                    </p>
                  </div>
                </div>
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
                        {contactLocation?.["Contact Person Name"] ||
                          "Not available"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#899193] mb-1">
                        Emergency Contact
                      </p>
                      <p className="font-medium text-[12px] text-[#161D1F]">
                        {contactLocation?.["Emergency Contact"] ||
                          "Not available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className=" rounded-lg p-6 border border-[#899193] bg-white">
                <h3 className="text-[14px] font-semibold text-[#161D1F] mb-4">
                  Booking Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Booking Amount
                    </p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      ₹
                      {orderDetails?.order_total
                        ? Number(orderDetails.order_total).toLocaleString()
                        : booking.order_total.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">Scheduled</p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {contactLocation?.["Date & Time"] ||
                        `${orderDetails?.schedule_in_days || 0} days, ${
                          orderDetails?.schedule_in_hours || 0
                        } hours`}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">Duration</p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {getDurationText() || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Current Medication
                    </p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {medicalInfo?.["Current Medication"] || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#899193] mb-1">
                      Medical Condition
                    </p>
                    <p className="font-medium text-[12px] text-[#161D1F]">
                      {medicalInfo?.["Medical Condition"] || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[14px] font-semibold text-[#161D1F] mb-4">
                Service & Offering
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="bg-cyan-600 text-white px-3 py-1 rounded text-[10px] font-medium">
                      Service:{" "}
                      {orderDetails?.service_details?.homecare_service_name}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-[12px] text-[#161D1F] mb-2">
                    {
                      orderDetails?.service_details
                        ?.homecare_service_offering_name
                    }
                  </h4>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[10px] font-semibold text-[#161D1F] mb-4">
                Assigned Staff
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                {orderDetails?.staff_details &&
                orderDetails.staff_details.length > 0 ? (
                  <div>
                    {orderDetails.staff_details.map(
                      (staff: any, index: number) => (
                        <p
                          key={index}
                          className="font-medium text-[10px] text-[#161D1F]"
                        >
                          {staff.name || "Staff Name Not Available"}
                        </p>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-red-500 font-medium text-[10px]">
                    No staff assigned
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed with action buttons */}
        <div className="p-6 border-t bg-white sticky bottom-0">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setIsAssignStaffModalOpen(true)}
              className="flex items-center text-[10px] gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <User className="w-3 h-3" />
              Assign Staff
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center text-[10px] gap-2 border border-gray-300 text-[#161D1F] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-3 h-3" />
              Print
            </button>
            <button
              onClick={() =>
                onContactPatient(contactLocation?.["Contact Number"])
              }
              className="flex items-center text-[10px] gap-2 border border-gray-300 text-[#161D1F] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Phone className="w-3 h-3" />
              Contact Patient
            </button>
            {/* <button
              onClick={() => onEditOrder(booking.id)}
              className="flex items-center text-[10px] gap-2 border border-gray-300 text-[#161D1F] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-3 h-3" />
              Edit Order
            </button> */}
          </div>
        </div>
      </div>
      <AssignStaffModal
        isOpen={isAssignStaffModalOpen}
        onClose={() => setIsAssignStaffModalOpen(false)}
        bookingId={booking.id}
        actualOrderId={booking.id}
        onUpdateStaff={handleStaffAssignment}
      />
    </div>
  );
};

export default BookingModal;
