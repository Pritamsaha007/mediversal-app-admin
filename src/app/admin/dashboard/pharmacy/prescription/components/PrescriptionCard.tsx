import React, { useRef, useState } from "react";
import { Prescription } from "../types/prescription";
import { MoreVertical } from "lucide-react";

interface PrescriptionCardProps {
  prescription: Prescription;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onPrint: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onPrint,
  onDelete,
}) => {
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Complete":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-800";
      case "Need Verification":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Awaiting Confirmation":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const formatMedications = () => {
    return prescription.medications
      .map((med) => `${med.name} (${med.dosage})`)
      .join(", ");
  };

  return (
    <tr className="hover:bg-gray-50">
      {/* Checkbox */}
      <td className="px-4 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(prescription.id, e.target.checked)}
          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
        />
      </td>

      {/* Prescription ID */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
        {prescription.prescriptionId}
      </td>

      {/* Patient Name */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
        {prescription.patientName}
      </td>

      {/* Doctor Name */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
        {prescription.doctorName}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
        <span
          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
            prescription.status
          )}`}
        >
          {prescription.status}
        </span>
      </td>

      {/* Verification */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
        <span
          className={`px-2 py-1 rounded-full text-xs ${getVerificationColor(
            prescription.verificationStatus
          )}`}
        >
          {prescription.verificationStatus}
        </span>
      </td>

      {/* Source */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
        {prescription.source}
      </td>

      {/* Medication */}
      <td className="px-6 py-4 text-sm text-[#161D1F]">
        {formatMedications()}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
        <button
          onClick={() => setActionMenuOpen(!actionMenuOpen)}
          className="text-gray-500 hover:text-gray-700"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {actionMenuOpen && (
          <div
            ref={actionMenuRef}
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <button
              onClick={() => {
                onView(prescription.id);
                setActionMenuOpen(false);
              }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              View Details
            </button>
            <button
              onClick={() => {
                onEdit(prescription.id);
                setActionMenuOpen(false);
              }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Edit Prescription
            </button>
            <button
              onClick={() => {
                onPrint(prescription.id);
                setActionMenuOpen(false);
              }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Print Prescription
            </button>
            <button
              onClick={() => {
                onDelete(prescription.id);
                setActionMenuOpen(false);
              }}
              className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
            >
              Delete Order
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};
