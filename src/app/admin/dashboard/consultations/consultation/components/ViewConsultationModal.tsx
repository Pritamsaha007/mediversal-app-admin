"use client";
import React from "react";
import { X } from "lucide-react";
import { type Consultation } from "../data/consultation";

interface ViewConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: Consultation | null;
  onEdit: (consultation: Consultation) => void;
}

const ViewConsultationModal: React.FC<ViewConsultationModalProps> = ({
  isOpen,
  onClose,
  consultation,
  onEdit,
}) => {
  if (!isOpen || !consultation) return null;

  const getStatusBadge = (status?: string | null) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>
      );
    }

    const statusStyles = {
      completed: "bg-[#34C759] text-white",
      scheduled: "bg-[#2F80ED] text-white",
      "in-progress": "bg-[#FF9500] text-white",
      cancelled: "bg-[#FF3B30] text-white",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-medium ${
          statusStyles[status as keyof typeof statusStyles] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getConsultationTypeBadge = (type: string) => {
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-medium ${
          type === "online"
            ? "bg-[#34C759] text-white"
            : "bg-[#2F80ED] text-white"
        }`}
      >
        {type === "online" ? "Online" : "Completed"}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161D1F]">
            View Scheduled Consultation
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
          {/* Patient Name and Booking Info */}
          <div className="mb-6">
            <h3 className="text-[14px] font-medium text-[#161D1F] mb-2">
              {consultation.patientName}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-4">
              <span>Booking ID: {consultation.bookingId}</span>
              <span>|</span>
              <span>{consultation.consultationLanguage}</span>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-[#161D1F]">
                Tags:
              </span>
              <div className="flex gap-2">
                {getConsultationTypeBadge(consultation.consultationType)}
                {getStatusBadge(consultation.status)}
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="mb-6">
            <h4 className="text-[10px] font-medium text-[#161D1F] mb-4">
              Patient Details
            </h4>
            <div className="bg-[#F8F9FA] rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Patient Contact:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {consultation.patientContact}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Patient Email:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {consultation.patientEmail}
                  </span>
                </div>
                {consultation.aadhaarNumber && (
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-medium text-[#161D1F]">
                      Aadhaar Number:{" "}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {consultation.aadhaarNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Consultation & Payment Details */}
          <div className="mb-6">
            <h4 className="text-[10px] font-medium text-[#161D1F] mb-4">
              Consultation & Payment Details
            </h4>
            <div className="bg-[#F8F9FA] rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Consultation Date & Time:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {consultation.consultationDate} |{" "}
                    {consultation.consultationTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Appointed Doctor:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {consultation.appointedDoctor}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Duration:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {consultation.duration} min.
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Consultation Fee:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {formatCurrency(consultation.consultationFee)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Payment Method:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {consultation.paymentMethod}
                  </span>
                </div>
                {consultation.hospital && (
                  <div>
                    <span className="text-[10px] font-medium text-[#161D1F]">
                      Hospital:{" "}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {consultation.hospital}
                    </span>
                  </div>
                )}
                {consultation.hospitalLocation && (
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-medium text-[#161D1F]">
                      Location:{" "}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {consultation.hospitalLocation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specify Symptoms */}
          {consultation.symptoms && (
            <div className="mb-6">
              <h4 className="text-[10px] font-medium text-[#161D1F] mb-4">
                Specify Symptoms:
              </h4>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                {consultation.symptoms}
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                onEdit(consultation);
                onClose();
              }}
              className="px-6 py-2 text-[10px] bg-[#1BA3C7] text-white rounded-lg hover:bg-[#1591B8] transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewConsultationModal;
