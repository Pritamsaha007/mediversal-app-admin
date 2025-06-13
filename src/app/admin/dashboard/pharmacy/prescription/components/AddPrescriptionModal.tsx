"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { PrescriptionData, MedicationTab } from "../types/prescription";
import PatientDoctorTab from "./PatientDoctorTab";
import PrescriptionDetailsTab from "./PrescriptionDetailsTab";
import MedicationsTab from "./MedicationsTab";

interface AddPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrescriptionData) => void;
}

const AddPrescriptionModal: React.FC<AddPrescriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [formData, setFormData] = useState<PrescriptionData>({
    patientInfo: {
      patientId: "",
      patientName: "",
    },
    doctorInfo: {
      doctorRegistrationNumber: "",
      doctorName: "",
      doctorSpecialty: "",
    },
    prescriptionDetails: {
      expiryDate: "",
      status: "Draft",
      source: "In-Clinic",
      isRefillable: false,
      refillsAllowed: 0,
      diagnosis: "",
      notes: "",
    },
    medications: [],
  });

  const tabs = [
    { id: 0, label: "Patient & Doctor Information" },
    { id: 1, label: "Prescription Details" },
    { id: 2, label: "Medications" },
  ];

  const handleInputChange = (
    section: keyof PrescriptionData,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const addMedication = (medication: MedicationTab) => {
    const newMedication = {
      ...medication,
      quantity: 1,
      dosage: 1,
      frequency: 1,
      duration: 1,
    };
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, newMedication],
    }));
  };

  const updateMedication = (index: number, field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  const removeMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (activeTab < 2) {
      setActiveTab(activeTab + 1);
    }
  };

  const handleReset = () => {
    setFormData({
      patientInfo: { patientId: "", patientName: "" },
      doctorInfo: {
        doctorRegistrationNumber: "",
        doctorName: "",
        doctorSpecialty: "",
      },
      prescriptionDetails: {
        expiryDate: "",
        status: "Draft",
        source: "In-Clinic",
        isRefillable: false,
        refillsAllowed: 0,
        diagnosis: "",
        notes: "",
      },
      medications: [],
    });
    setActiveTab(0);
  };

  const handleCreatePrescription = () => {
    const prescriptionData = {
      ...formData,
      createdAt: new Date().toISOString(),
      prescriptionId: `PRE-${Date.now()}`,
    };

    console.log(
      "Prescription Data:",
      JSON.stringify(prescriptionData, null, 2)
    );
    onSubmit(prescriptionData);
    onClose();
    handleReset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 top-0 sticky bg-white z-10">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            Create New Prescription
          </h2>
          <button
            onClick={onClose}
            className="text-[#899193] hover:text-[#161D1F] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[#F8F8F8]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 text-[10px] font-medium transition-colors rounded ${
                activeTab === tab.id
                  ? "bg-[#0088B1] text-[F8F8F8]"
                  : "text-[#161D1F] hover:text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] transition-all duration-300 ease-in-out">
          {activeTab === 0 && (
            <PatientDoctorTab
              formData={formData}
              onInputChange={handleInputChange}
            />
          )}

          {activeTab === 1 && (
            <PrescriptionDetailsTab
              formData={formData}
              onInputChange={handleInputChange}
            />
          )}

          {activeTab === 2 && (
            <MedicationsTab
              formData={formData}
              onInputChange={handleInputChange}
              onAddMedication={addMedication}
              onUpdateMedication={updateMedication}
              onRemoveMedication={removeMedication}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-6 py-2 text-[#899193] hover:text-[#161D1F] text-[10px] font-medium transition-colors"
          >
            Reset
          </button>
          {activeTab < 2 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-[#0088B1] text-[#F8F8F8] text-[10px] rounded-lg hover:bg-[#00729A]"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreatePrescription}
              className="px-6 py-3 bg-[#0088B1] text-[#F8F8F8] text-[10px] rounded-lg hover:bg-[#00729A]"
            >
              Create Prescription
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPrescriptionModal;
