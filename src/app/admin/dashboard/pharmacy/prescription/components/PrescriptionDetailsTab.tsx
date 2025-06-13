"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { PrescriptionData } from "../types/prescription";

interface PrescriptionDetailsTabProps {
  formData: PrescriptionData;
  onInputChange: (
    section: keyof PrescriptionData,
    field: string,
    value: any
  ) => void;
}

const PrescriptionDetailsTab: React.FC<PrescriptionDetailsTabProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm mb-2 text-[10px] font-medium text-[#161D1F]">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.prescriptionDetails.expiryDate}
              onChange={(e) =>
                onInputChange(
                  "prescriptionDetails",
                  "expiryDate",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border text-[10px] text-[#B0B6B8] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
            />
            <Calendar
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#899193] pointer-events-none"
              size={20}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm  mb-2 text-[10px] text-[10px] font-medium text-[#161D1F]">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.prescriptionDetails.status}
            onChange={(e) =>
              onInputChange("prescriptionDetails", "status", e.target.value)
            }
            className="w-full px-4 py-3 border text-[10px] text-[#B0B6B8] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm  mb-2  text-[10px] font-medium text-[#161D1F]">
            Source <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.prescriptionDetails.source}
            onChange={(e) =>
              onInputChange("prescriptionDetails", "source", e.target.value)
            }
            className="w-full px-4 py-3 border text-[10px] text-[#B0B6B8] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
          >
            <option value="In-Clinic">In-Clinic</option>
            <option value="Telemedicine">Telemedicine</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
        <div className="flex items-center pt-8">
          <input
            type="checkbox"
            id="isRefillable"
            checked={formData.prescriptionDetails.isRefillable}
            onChange={(e) =>
              onInputChange(
                "prescriptionDetails",
                "isRefillable",
                e.target.checked
              )
            }
            className="w-4 h-4 text-[#0088B1] border-gray-300 rounded focus:ring-[#0088B1]"
          />
          <label
            htmlFor="isRefillable"
            className="ml-2 text-sm text-[10px] font-medium text-[#161D1F]"
          >
            Is Refillable
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm text-[10px] font-medium text-[#161D1F] mb-2">
          Refills Allowed
        </label>
        <input
          type="number"
          value={formData.prescriptionDetails.refillsAllowed}
          onChange={(e) =>
            onInputChange(
              "prescriptionDetails",
              "refillsAllowed",
              parseInt(e.target.value) || 0
            )
          }
          className="w-full px-4 py-3 border text-[10px] text-[#B0B6B8] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm text-[10px] font-medium text-[#161D1F] mb-2">
          Diagnosis <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.prescriptionDetails.diagnosis}
          onChange={(e) =>
            onInputChange("prescriptionDetails", "diagnosis", e.target.value)
          }
          className="w-full px-4 py-3 border text-[10px] text-[#B0B6B8] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
          rows={3}
          placeholder="Enter diagnosis..."
        />
      </div>

      <div>
        <label className="block text-sm text-[10px] font-medium text-[#161D1F] mb-2">
          Notes
        </label>
        <textarea
          value={formData.prescriptionDetails.notes}
          onChange={(e) =>
            onInputChange("prescriptionDetails", "notes", e.target.value)
          }
          className="w-full px-4 py-3 border text-[10px] text-[#B0B6B8] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
          rows={4}
          placeholder="Additional notes..."
        />
      </div>
    </div>
  );
};
export default PrescriptionDetailsTab;
