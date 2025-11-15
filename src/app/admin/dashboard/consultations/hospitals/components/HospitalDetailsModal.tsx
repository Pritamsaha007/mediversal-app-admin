"use client";
import React from "react";
import { X } from "lucide-react";
import { Hospital } from "../types";

interface HospitalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital | null;
  onEdit?: (hospital: Hospital) => void;
}

const HospitalDetailsModal: React.FC<HospitalDetailsModalProps> = ({
  isOpen,
  onClose,
  hospital,
  onEdit,
}) => {
  if (!isOpen || !hospital) return null;

  const handleEdit = () => {
    if (onEdit && hospital) {
      onEdit(hospital);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161d1f]">
            Hospital Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="mb-6">
            <h3 className="text-[14px] font-medium text-[#161d1f] mb-2">
              {hospital.name}
            </h3>
            <div className="text-gray-500 text-[14px]">
              {hospital.address.line1}, {hospital.address.city}
            </div>
          </div>

          <div className="mb-6">
            <span className="text-[12px] font-medium text-[#161d1f] mr-3">
              Tags:
            </span>
            <div className="inline-flex gap-2">
              {hospital.emergencyServices && (
                <span className="px-3 py-1 text-[10px] bg-red-100 text-red-700 rounded border border-red-200">
                  24/7 Emergency
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <span className="text-[12px] font-medium text-[#161d1f]">
              Description:
            </span>
            <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
              {hospital.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <span className="text-[12px] font-medium text-[#161d1f]">
                Contact Number:
              </span>
              <div className="text-[12px] text-gray-600 mt-1">
                {hospital.contact.phone.join(", ")}
              </div>
            </div>
            <div>
              <span className="text-[12px] font-medium text-[#161d1f]">
                Website URL:
              </span>
              <div className="text-[12px] text-gray-600 mt-1">
                {hospital.contact.website || "Not provided"}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-[12px] font-medium text-[#161d1f] mb-4">
              Departments
            </h4>
            <div className="bg-[#E8F4F7] rounded-lg p-4 border border-[#E5E8E9] ">
              <div className="flex flex-wrap gap-2 ">
                {hospital.departments.slice(0, 6).map((dept, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 text-[10px] bg-white text-gray-700 rounded-lg border"
                  >
                    {dept}
                  </span>
                ))}
                {hospital.departments.slice(6, 9).map((dept, index) => (
                  <span
                    key={index + 6}
                    className="px-3 py-2 text-[10px] bg-white text-gray-700 rounded-lg border"
                  >
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleEdit}
            className="px-6 py-2 text-[10px] bg-[#1BA3C7] text-white rounded-lg hover:bg-[#1591B8] transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailsModal;
