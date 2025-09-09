"use client";
import React, { useState, useEffect } from "react";
import { X, Search, Calendar, Clock } from "lucide-react";
import {
  doctorsList,
  hospitalsList,
  languagesList,
  paymentMethods,
  durationOptions,
  type Consultation,
  type ConsultationFormData,
} from "../data/consultation";

interface AddConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConsultation: (consultation: ConsultationFormData) => void;
  editingConsultation?: Consultation | null;
}

const AddConsultationModal: React.FC<AddConsultationModalProps> = ({
  isOpen,
  onClose,
  onAddConsultation,
  editingConsultation,
}) => {
  const [activeTab, setActiveTab] = useState<"online" | "hospital">("online");
  const [formData, setFormData] = useState<ConsultationFormData>({
    patientName: "",
    patientContact: "",
    patientEmail: "",
    aadhaarNumber: "",
    consultationType: "online",
    consultationDate: "",
    consultationTime: "",
    duration: 30,
    appointedDoctor: "",
    hospital: "",
    consultationLanguage: "",
    paymentMethod: "",
    paymentStatus: "pending",
    symptoms: "",
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (editingConsultation) {
      setFormData({
        patientName: editingConsultation.patientName,
        patientContact: editingConsultation.patientContact,
        patientEmail: editingConsultation.patientEmail,
        aadhaarNumber: editingConsultation.aadhaarNumber || "",
        consultationType: editingConsultation.consultationType,
        consultationDate: editingConsultation.consultationDate,
        consultationTime: editingConsultation.consultationTime,
        duration: editingConsultation.duration,
        appointedDoctor: editingConsultation.appointedDoctor,
        hospital: editingConsultation.hospital || "",
        consultationLanguage: editingConsultation.consultationLanguage,
        paymentMethod: editingConsultation.paymentMethod,
        paymentStatus: editingConsultation.paymentStatus,
        symptoms: editingConsultation.symptoms || "",
      });
      setActiveTab(
        editingConsultation.consultationType === "online"
          ? "online"
          : "hospital"
      );
    } else {
      // Reset form for new consultation
      setFormData({
        patientName: "",
        patientContact: "",
        patientEmail: "",
        aadhaarNumber: "",
        consultationType: "online",
        consultationDate: "",
        consultationTime: "",
        duration: 30,
        appointedDoctor: "",
        hospital: "",
        consultationLanguage: "",
        paymentMethod: "",
        paymentStatus: "pending",
        symptoms: "",
      });
      setActiveTab("online");
    }
  }, [editingConsultation, isOpen]);

  const handleInputChange = (field: keyof ConsultationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (tab: "online" | "hospital") => {
    setActiveTab(tab);
    setFormData((prev) => ({
      ...prev,
      consultationType: tab === "online" ? "online" : "in-person",
    }));
  };

  const handleSubmit = () => {
    const consultationData = {
      ...formData,
      consultationType:
        activeTab === "online" ? ("online" as const) : ("in-person" as const),
      status: "scheduled" as const,
      doctorSpecialization: "General Medicine",
    };

    onAddConsultation(consultationData);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      patientName: "",
      patientContact: "",
      patientEmail: "",
      aadhaarNumber: "",
      consultationType: "online",
      consultationDate: "",
      consultationTime: "",
      duration: 30,
      appointedDoctor: "",
      hospital: "",
      consultationLanguage: "",
      paymentMethod: "",
      paymentStatus: "pending",
      symptoms: "",
    });
  };

  const DropdownSelect: React.FC<{
    value: string;
    placeholder: string;
    options: string[] | { label: string; value: any }[];
    field: keyof ConsultationFormData;
    required?: boolean;
  }> = ({ value, placeholder, options, field, required = false }) => {
    const isOpen = openDropdown === field;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : field)}
          className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg text-[#161D1F] bg-white hover:bg-gray-50 focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm flex items-center justify-between"
        >
          <span className={value ? "text-[#161D1F]" : "text-[#B0B6B8]"}>
            {value || placeholder}
          </span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.map((option, index) => {
              const optionValue =
                typeof option === "string" ? option : option.value;
              const optionLabel =
                typeof option === "string" ? option : option.label;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    handleInputChange(field, optionValue);
                    setOpenDropdown(null);
                  }}
                  className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 text-[#161D1F]"
                >
                  {optionLabel}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161d1f]">
            {editingConsultation
              ? "Edit Consultation"
              : "Schedule New Consultation"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-2">
          <button
            onClick={() => handleTabChange("online")}
            className={`flex-1 py-3 px-3 ${
              activeTab === "online"
                ? "bg-[#0088B1] text-white rounded-lg text-[10px]"
                : "bg-gray-100 text-[#161D1F] text-[10px]"
            }`}
          >
            Online Consultation
          </button>
          <button
            onClick={() => handleTabChange("hospital")}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === "hospital"
                ? "bg-[#0088B1] text-white rounded-lg text-[10px]"
                : "bg-gray-100 text-[#161D1F] text-[10px]"
            }`}
          >
            Hospital Visit
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Add Patient Details */}
          <div className="mb-6">
            <h3 className="text-[16px] font-medium text-[#161d1f] mb-4">
              Add Patient Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Patient Name
                </label>
                <input
                  type="text"
                  placeholder="Sarah Johnson"
                  value={formData.patientName}
                  onChange={(e) =>
                    handleInputChange("patientName", e.target.value)
                  }
                  className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Patient Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit phone"
                  value={formData.patientContact}
                  onChange={(e) =>
                    handleInputChange("patientContact", e.target.value)
                  }
                  className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Patient Email
                </label>
                <input
                  type="email"
                  placeholder="e.g., info@hospital.com"
                  value={formData.patientEmail}
                  onChange={(e) =>
                    handleInputChange("patientEmail", e.target.value)
                  }
                  className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                />
              </div>
              {activeTab === "hospital" && (
                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Select Hospital
                  </label>
                  <DropdownSelect
                    value={formData.hospital ?? ""}
                    placeholder="e.g., Mediversal Health Studio"
                    options={hospitalsList}
                    field="hospital"
                    required
                  />
                </div>
              )}
              {activeTab === "online" && (
                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234-5678-9012"
                    value={formData.aadhaarNumber}
                    onChange={(e) =>
                      handleInputChange("aadhaarNumber", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Appoint Doctor
                </label>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for Doctor name"
                    value={formData.appointedDoctor}
                    onChange={(e) =>
                      handleInputChange("appointedDoctor", e.target.value)
                    }
                    className="w-full text-[10px] pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Consultation Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.consultationDate}
                    onChange={(e) =>
                      handleInputChange("consultationDate", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Select Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.consultationTime}
                    onChange={(e) =>
                      handleInputChange("consultationTime", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  />
                </div>
              </div>
              {activeTab === "online" && (
                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    Consultation Duration (minutes)
                  </label>
                  <DropdownSelect
                    value={formData.duration.toString()}
                    placeholder="Mention Consultation Time Period"
                    options={durationOptions}
                    field="duration"
                  />
                </div>
              )}
              {activeTab === "hospital" && (
                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Duration (minutes)
                  </label>
                  <DropdownSelect
                    value={formData.duration.toString()}
                    placeholder="Consultation Duration"
                    options={durationOptions}
                    field="duration"
                    required
                  />
                </div>
              )}
              {activeTab === "online" && (
                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Consultation
                    Language
                  </label>
                  <DropdownSelect
                    value={formData.consultationLanguage}
                    placeholder="Select Language"
                    options={languagesList}
                    field="consultationLanguage"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Add Payment Details */}
          <div className="mb-6">
            <h3 className="text-[16px] font-medium text-[#161D1F] mb-4">
              Add Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  Payment Status
                </label>
                <DropdownSelect
                  value={formData.paymentStatus}
                  placeholder="Choose Payment Status"
                  options={["pending", "paid", "cancelled", "refunded"]}
                  field="paymentStatus"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Payment Method
                </label>
                <DropdownSelect
                  value={formData.paymentMethod}
                  placeholder="Select Payment Method"
                  options={paymentMethods}
                  field="paymentMethod"
                  required
                />
              </div>
            </div>
          </div>

          {/* Specify Symptoms */}
          <div className="mb-6">
            <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
              {activeTab === "online"
                ? "Specify Symptoms or The Reason for the Consultation"
                : "Specify Symptoms"}
            </label>
            <textarea
              placeholder="Specify few patient symptoms here"
              value={formData.symptoms}
              onChange={(e) => handleInputChange("symptoms", e.target.value)}
              rows={4}
              className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="px-6 py-2 text-sm text-[#161D1F] border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 text-sm bg-[#0088B1] text-white rounded-lg hover:bg-[#007299]"
            >
              {editingConsultation
                ? "Update Consultation"
                : "Schedule Consultation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddConsultationModal;
