"use client";
import React from "react";
import { Printer, X } from "lucide-react";
import { ConsultationAPI } from "../types";
import toast from "react-hot-toast";
import { formatDate, formatTime } from "../../../push-notification/utils/utils";
import StatusBadge from "@/app/components/common/StatusBadge";

interface ViewConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: ConsultationAPI | null;
  onEdit: (consultation: ConsultationAPI) => void;
}

const ViewConsultationModal: React.FC<ViewConsultationModalProps> = ({
  isOpen,
  onClose,
  consultation,
  onEdit,
}) => {
  if (!isOpen || !consultation) return null;
  console.log(consultation);

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
    if (!consultation?.receipt_url) {
      toast.error("Receipt not available");
      return;
    }

    downloadAndPrintPDF(consultation.receipt_url, consultation.id);
  };

  const formatCurrency = (amount: string) => {
    return `Rs. ${amount}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
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

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-[14px] font-medium text-[#161D1F] mb-2">
              {consultation.patient_name}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-4">
              <span>
                Booking ID:
                <span className="cursor-help" title={consultation.ordernumber}>
                  {consultation.ordernumber}
                </span>
              </span>
              <span>|</span>
              <span>{consultation.consultation_language}</span>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2">
              <div className="flex gap-2 text-black text-[12px]">
                Payment Status:{" "}
                <StatusBadge status={consultation.payment_status} />
                Consultation Status:{" "}
                <StatusBadge status={consultation.status} />
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
                    {consultation.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Patient Email:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {consultation.email}
                  </span>
                </div>
                {consultation.aadhar_id && (
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-medium text-[#161D1F]">
                      Aadhaar Number:
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {consultation.aadhar_id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
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
                    {formatDate(consultation.consultation_date)} |{" "}
                    {formatTime(consultation.consultation_time)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Appointed Doctor:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {consultation.doc_name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Duration:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {consultation.session_duration_in_mins} min.
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Consultation Fee:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {formatCurrency(consultation.total_amount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-[#161D1F]">
                    Payment Method:{" "}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {consultation.payment_mode}
                  </span>
                </div>
                {consultation.hospital_id && (
                  <div>
                    <span className="text-[10px] font-medium text-[#161D1F]">
                      Hospital:{" "}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {consultation.hospital_name}
                    </span>
                  </div>
                )}
                {/* {consultation.hospitalLocation && (
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-medium text-[#161D1F]">
                      Location:{" "}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {consultation.hospitalLocation}
                    </span>
                  </div>
                )} */}
              </div>
            </div>
          </div>

          {consultation.symptoms_desc && (
            <div className="mb-6">
              <h4 className="text-[10px] font-medium text-[#161D1F] mb-4">
                Specify Symptoms:
              </h4>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                {consultation.symptoms_desc}
              </p>
            </div>
          )}

          {/* <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                onEdit(consultation);
                onClose();
              }}
              className="px-6 py-2 text-[10px] bg-[#1BA3C7] text-white rounded-lg hover:bg-[#1591B8] transition-colors"
            >
              Edit
            </button>
          </div> */}
          <div className="p-6 border-t bg-white sticky bottom-0">
            <div className="flex flex-wrap gap-4 justify-end">
              <button
                onClick={handlePrint}
                className="flex items-center text-[10px] gap-2 border border-gray-300 text-[#161D1F] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-3 h-3" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewConsultationModal;
