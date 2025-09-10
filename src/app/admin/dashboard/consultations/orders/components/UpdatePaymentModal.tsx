"use client";
import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { type Order } from "../data/orders";

interface UpdatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdate: (order: Order) => void;
}

const UpdatePaymentModal: React.FC<UpdatePaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdate,
}) => {
  const [consultationStatus, setConsultationStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [openDropdown, setOpenDropdown] = useState<
    null | "consultation" | "payment"
  >(null);

  const consultationStatusOptions = [
    "Scheduled",
    "Completed",
    "In-Progress",
    "Cancelled",
  ];
  const paymentStatusOptions = ["Paid", "Pending", "Refunded", "Failed"];

  useEffect(() => {
    if (order) {
      setConsultationStatus(
        order.consultationStatus.charAt(0).toUpperCase() +
          order.consultationStatus.slice(1)
      );
      setPaymentStatus(
        order.paymentStatus.charAt(0).toUpperCase() +
          order.paymentStatus.slice(1)
      );
    }
  }, [order]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen || !order) return null;

  const handleConsultationStatusChange = (status: string) => {
    setConsultationStatus(status);
    setOpenDropdown(null);
  };

  const handlePaymentStatusChange = (status: string) => {
    setPaymentStatus(status);
    setOpenDropdown(null);
  };

  const handleUpdateDetails = () => {
    const updatedOrder: Order = {
      ...order,
      consultationStatus:
        consultationStatus.toLowerCase() as Order["consultationStatus"],
      paymentStatus: paymentStatus.toLowerCase() as Order["paymentStatus"],
      updatedAt: new Date().toISOString(),
    };

    onUpdate(updatedOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161D1F]">
            Consultation Booking Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tags */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[12px] font-medium text-[#161D1F]">
              Tags:
            </span>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-[#E3F2FD] text-[#1976D2]">
                Online Consultation
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-[#E8F5E8] text-[#4CAF50]">
                Completed
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-[#E8F5E8] text-[#4CAF50]">
                Paid
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Patient Details */}
            <div className="space-y-6">
              <div>
                <h4 className="text-[12px] font-medium text-[#161D1F] mb-4">
                  Patient Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">
                      * Booking ID
                    </label>
                    <input
                      type="text"
                      value={order.bookingId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[10px] bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">
                      * Patient Name
                    </label>
                    <input
                      type="text"
                      value={order.patientName}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[10px] bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">
                      * Patient Email
                    </label>
                    <input
                      type="email"
                      value={order.patientEmail}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[10px] bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] font-medium text-[#161D1F] mb-4">
                  Consultation Type
                </h4>
                <div className="flex gap-2">
                  <button
                    disabled
                    className={`flex-1 px-4 py-2 text-[10px] font-medium rounded-lg transition-colors ${
                      order.consultationType === "in-person"
                        ? "bg-[#E3F2FD] text-[#1976D2] border border-[#1976D2]"
                        : "bg-gray-100 text-gray-400 border border-gray-300"
                    }`}
                  >
                    In-Person
                  </button>
                  <button
                    disabled
                    className={`flex-1 px-4 py-2 text-[10px] font-medium rounded-lg transition-colors ${
                      order.consultationType === "online"
                        ? "bg-[#E3F2FD] text-[#1976D2] border border-[#1976D2]"
                        : "bg-gray-100 text-gray-400 border border-gray-300"
                    }`}
                  >
                    Online
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] font-medium text-[#161D1F] mb-4">
                  Payment Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">
                      Payment Method
                    </label>
                    <div className="relative">
                      <select
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[10px] bg-gray-50 text-gray-500 appearance-none"
                      >
                        <option>{order.paymentMethod}</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">
                      Payment Status
                    </label>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === "payment" ? null : "payment"
                          )
                        }
                        className="dropdown-toggle w-full px-3 py-2 border border-gray-300 rounded-lg text-[10px] text-left bg-white hover:bg-gray-50 flex items-center justify-between"
                      >
                        {paymentStatus}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {openDropdown === "payment" && (
                        <div className="absolute top-full mt-1 z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                          {paymentStatusOptions.map((status) => (
                            <button
                              key={status}
                              onClick={() => handlePaymentStatusChange(status)}
                              className={`block w-full px-3 py-2 text-[10px] text-left hover:bg-gray-100 ${
                                paymentStatus === status
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
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">
                    * Consultation Language
                  </label>
                  <div className="relative">
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[10px] bg-gray-50 text-gray-500 appearance-none"
                    >
                      <option>{order.consultationLanguage}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">
                    * Patient Contact Number
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={order.patientContact}
                      disabled
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-[10px] bg-gray-50 text-gray-500"
                    />
                    <button
                      disabled
                      className="ml-2 px-3 py-2 text-[10px] text-gray-400 border border-gray-300 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    value={order.aadhaarNumber || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[10px] bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-1">
                  Consultation Status
                </label>
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === "consultation" ? null : "consultation"
                      )
                    }
                    className="dropdown-toggle w-full px-3 py-2 border border-gray-300 rounded-lg text-[10px] text-left bg-white hover:bg-gray-50 flex items-center justify-between"
                  >
                    {consultationStatus}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {openDropdown === "consultation" && (
                    <div className="absolute top-full mt-1 z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      {consultationStatusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleConsultationStatusChange(status)}
                          className={`block w-full px-3 py-2 text-[10px] text-left hover:bg-gray-100 ${
                            consultationStatus === status
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

              <div>
                <h4 className="text-[12px] font-medium text-[#161D1F] mb-4">
                  Patient Details
                </h4>
                <h5 className="text-[10px] font-medium text-[#161D1F] mb-2">
                  Invoice Details
                </h5>
                <div className="p-4 bg-[#F8F9FA] rounded-lg">
                  <div className="text-[10px] text-[#161D1F] mb-2">
                    Invoice ID
                  </div>
                  <div className="text-[10px] text-gray-600">
                    {order.invoiceId}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={handleUpdateDetails}
              className="px-6 py-2 text-[10px] bg-[#1BA3C7] text-white rounded-lg hover:bg-[#1591B8] transition-colors"
            >
              Update Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePaymentModal;
