"use client";

import React from "react";
import { Search } from "lucide-react";
import { PrescriptionData } from "../types/prescription";

interface PatientDoctorTabProps {
  formData: PrescriptionData;
  onInputChange: (
    section: keyof PrescriptionData,
    field: string,
    value: any
  ) => void;
}

const PatientDoctorTab: React.FC<PatientDoctorTabProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <div className="space-y-8">
      {/* Patient Information */}
      <div>
        <h2 className="block text-[10px] font-medium text-[#161D1F] mb-1">
          Patient Information
        </h2>
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#899193]"
              size={20}
            />
            <input
              type="text"
              placeholder="Search patients by name, ID, or email..."
              className="w-full pl-10 pr-4 py-2 text-[10px] text-[#B0B6B8] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
              Patient ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., PAT0001352"
              value={formData.patientInfo.patientId}
              onChange={(e) =>
                onInputChange("patientInfo", "patientId", e.target.value)
              }
              className="w-full px-4 py-2 text-[#B0B6B8] text-[10px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Rahul Kumar"
              value={formData.patientInfo.patientName}
              onChange={(e) =>
                onInputChange("patientInfo", "patientName", e.target.value)
              }
              className="w-full px-4 py-2 border text-[10px] text-[#B0B6B8] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Doctor Information */}
      <div>
        <h3 className="text-[10px] font-medium text-[#161D1F] mb-4">
          Doctor Information
        </h3>
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#899193]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search doctors by name, specialty, or hospital..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border  text-[10px] text-[#B0B6B8] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
              Doctor Registration Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., DOC0001352"
              value={formData.doctorInfo.doctorRegistrationNumber}
              onChange={(e) =>
                onInputChange(
                  "doctorInfo",
                  "doctorRegistrationNumber",
                  e.target.value
                )
              }
              className="w-full px-4 py-2  text-[10px] text-[#B0B6B8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
              Doctor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Rahul Kumar"
              value={formData.doctorInfo.doctorName}
              onChange={(e) =>
                onInputChange("doctorInfo", "doctorName", e.target.value)
              }
              className="w-full px-4 py-2 border  text-[10px] text-[#B0B6B8] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
              Doctor Specialty <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Specialty"
              value={formData.doctorInfo.doctorSpecialty}
              onChange={(e) =>
                onInputChange("doctorInfo", "doctorSpecialty", e.target.value)
              }
              className="w-full px-4 py-2 border  text-[10px] text-[#B0B6B8] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default PatientDoctorTab;
