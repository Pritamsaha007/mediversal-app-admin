import React from "react";
import { X } from "lucide-react";
import { Lead } from "../type/type";
import LeadStatusBadge from "@/app/components/common/StatusBadge";

interface LeadDetailModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  isOpen,
  lead,
  onClose,
}) => {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-8 pt-6 pb-5 flex-shrink-0">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            Patient Lead Details
          </h2>
          <button
            onClick={onClose}
            className="text-[#899193] hover:text-[#161D1F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-8 pb-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-[#E8F4F7] flex items-center justify-center flex-shrink-0">
              <span className="text-[16px] font-semibold text-[#0088B1]">
                {getInitials(lead.patientName)}
              </span>
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#161D1F]">
                {lead.patientName}
              </p>
              {lead.dob && (
                <p className="text-[12px] text-[#899193]">
                  DoB: &nbsp;{lead.dob}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[13px] font-semibold text-[#161D1F]">
              Lead Status:
            </span>
            <LeadStatusBadge status={lead.leadStatus} />
          </div>
          <div className="mb-5">
            <span className="text-[13px] font-semibold text-[#161D1F]">
              Inquiry Type:&nbsp;
            </span>
            <span className="text-[13px] text-[#161D1F]">
              {lead.inquiryType}
            </span>
          </div>
          <p className="text-[13px] font-semibold text-[#161D1F] mb-2">
            Personal Details
          </p>
          <div className="bg-[#EBF6FA] rounded-xl p-5 mb-5">
            <div className="grid grid-cols-2 gap-y-3">
              <div>
                <span className="text-[12px] font-semibold text-[#161D1F]">
                  Contact No.:&nbsp;
                </span>
                <span className="text-[12px] text-[#161D1F]">{lead.phone}</span>
              </div>
              <div>
                <span className="text-[12px] font-semibold text-[#161D1F]">
                  Email ID:&nbsp;
                </span>
                <span className="text-[12px] text-[#161D1F]">
                  {lead.emailId}
                </span>
              </div>
              <div>
                <span className="text-[12px] font-semibold text-[#161D1F]">
                  Request Date:&nbsp;
                </span>
                <span className="text-[12px] text-[#161D1F]">
                  {lead.dateRequested}
                </span>
              </div>
            </div>
          </div>
          {lead.doctorDetails && (
            <>
              <p className="text-[13px] font-semibold text-[#161D1F] mb-2">
                Doctor &amp; Consultation Details
              </p>
              <div className="border border-[#E5E8E9] rounded-xl p-5">
                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <span className="text-[12px] font-semibold text-[#161D1F]">
                      Requested Date &amp; Time:&nbsp;
                    </span>
                    <span className="text-[12px] text-[#161D1F]">
                      {lead.doctorDetails.requestedDateTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[12px] font-semibold text-[#161D1F]">
                      Chosen Doctor:&nbsp;
                    </span>
                    <span className="text-[12px] text-[#161D1F]">
                      {lead.doctorDetails.chosenDoctor}
                    </span>
                  </div>
                  <div>
                    <span className="text-[12px] font-semibold text-[#161D1F]">
                      Doctor Qualifications:&nbsp;
                    </span>
                    <span className="text-[12px] text-[#161D1F]">
                      {lead.doctorDetails.doctorQualifications}
                    </span>
                  </div>
                  <div>
                    <span className="text-[12px] font-semibold text-[#161D1F]">
                      Consultation Fee:&nbsp;
                    </span>
                    <span className="text-[12px] text-[#161D1F]">
                      ₹{lead.doctorDetails.consultationFee}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="px-8 py-4 border-t border-[#E5E8E9] flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-[#0088B1] text-white text-[12px] rounded-lg hover:bg-[#00729A] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
