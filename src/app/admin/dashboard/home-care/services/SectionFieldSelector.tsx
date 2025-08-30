"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { createOrUpdateHomecareService } from "./service/api/homecareServices";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "Active" | "Inactive";
  offerings: any[];
  rating?: number;
  reviewCount?: number;
}

interface SectionFieldData {
  sections: string[];
  medicalFields: string[];
}

interface SectionFieldSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SectionFieldData) => void;
  initialData?: SectionFieldData;
  editService?: Service | null;
  serviceData: {
    name: string;
    description: string;
    status: "Active" | "Inactive";
    tags: string[];
    consents: string[];
  };
  onAddService: (service: Omit<Service, "id">) => void;
  onUpdateService?: (service: Service) => void;
  onCloseMainModal: () => void;
  onResetMainForm: () => void;
}

const SectionFieldSelector: React.FC<SectionFieldSelectorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  editService,
  serviceData,
  onAddService,
  onUpdateService,
  onCloseMainModal,
  onResetMainForm,
}) => {
  const { token, admin } = useAdminStore();
  const [selectedSections, setSelectedSections] = useState<string[]>(
    initialData?.sections || []
  );
  const [selectedMedicalFields, setSelectedMedicalFields] = useState<string[]>(
    initialData?.medicalFields || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSections = [
    "Medical Information",
    "Doctor's Information",
    "Installation Requirements",
    "Contact & Location",
  ];

  const medicalFields = [
    "Allergies & Restrictions",
    "Pain Level",
    "Mobility Level",
    "Previous Physiotherapy History",
    "Therapy Goals",
    "Reason for Procedure",
    "Previous Similar Procedures",
    "Medical History",
  ];

  const sectionMapping: { [key: string]: string } = {
    "Medical Information": "MedicalInfo",
    "Doctor's Information": "DoctorInfo",
    "Installation Requirements": "InstallationInfo",
    "Contact & Location": "ContactInfo",
    "Patient Information": "PatientInfo",
  };

  const medicalFieldMapping: { [key: string]: string } = {
    "Allergies & Restrictions": "allergies",
    "Pain Level": "painlevel",
    "Mobility Level": "mobilitylevel",
    "Previous Physiotherapy History": "physiohistory",
    "Therapy Goals": "therapygoals",
    "Reason for Procedure": "procedureason",
    "Previous Similar Procedures": "similarprocedures",
    "Medical History": "medicalhistory",
  };

  const handleSectionToggle = (section: string) => {
    setSelectedSections((prev) => {
      if (prev.includes(section)) {
        return prev.filter((s) => s !== section);
      } else {
        return [...prev, section];
      }
    });
  };

  const handleMedicalFieldToggle = (field: string) => {
    setSelectedMedicalFields((prev) => {
      if (prev.includes(field)) {
        return prev.filter((f) => f !== field);
      } else {
        return [...prev, field];
      }
    });
  };

  const handleSave = async () => {
    // First save the section/field selections
    onSave({
      sections: selectedSections,
      medicalFields: selectedMedicalFields,
    });

    // Then proceed with service creation/update
    if (!serviceData.name.trim() || !serviceData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!token || !admin.id) {
      toast.error("Authentication required");
      return;
    }

    setIsSubmitting(true);

    try {
      const displaySections = ["PatientInfo"];
      if (selectedSections.length > 0) {
        const mappedSections = selectedSections.map(
          (section) => sectionMapping[section] || section
        );
        displaySections.push(...mappedSections);
      }

      const customMedicalInfo: { [key: string]: string } = {};
      if (selectedMedicalFields.length > 0) {
        selectedMedicalFields.forEach((field) => {
          const mappedField = medicalFieldMapping[field];
          if (mappedField) {
            customMedicalInfo[mappedField] = "textbox";
          }
        });
      }

      if (Object.keys(customMedicalInfo).length === 0) {
        customMedicalInfo.medicalhistory = "textbox";
      }

      const payload = {
        ...(editService && { id: editService.id }),
        name: serviceData.name.trim(),
        description: serviceData.description.trim(),
        is_active: serviceData.status === "Active",
        display_pic_url: "http://example.com/pic.jpg",
        service_tags: serviceData.tags,
        display_sections: displaySections,
        custom_medical_info: customMedicalInfo,
      };

      const response = await createOrUpdateHomecareService(payload, token);

      if (response.success) {
        if (editService && onUpdateService) {
          const updatedService: Service = {
            ...editService,
            name: serviceData.name.trim(),
            description: serviceData.description.trim(),
            status: serviceData.status,
            category: serviceData.tags[0] || "General",
          };
          onUpdateService(updatedService);
          toast.success("Service updated successfully!");
        } else {
          onAddService({} as Omit<Service, "id">);
          toast.success("Service created successfully!");
        }

        onResetMainForm();
        onCloseMainModal();
        onClose();
      } else {
        throw new Error("Failed to save service");
      }
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast.error(error.message || "Failed to save service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedSections([]);
    setSelectedMedicalFields([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-[16px] font-semibold text-[#161D1F]">
              Add New Service - Add Section & Fields
            </h3>
            <p className="text-[10px] text-[#899193] mt-1">
              Select the sections you want to include in the service form from
              the multiple choice buttons below.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#899193]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Available Sections */}
            <div className="space-y-6">
              <div>
                <h4 className="text-[14px] font-medium text-[#161D1F] mb-4">
                  Sections
                </h4>
                <div className="space-y-1 border border-gray-300 rounded-lg">
                  {availableSections.map((section) => (
                    <div
                      key={section}
                      className="flex items-center justify-between p-4 border-b border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <span className="text-[12px] text-[#161D1F]">
                        {section}
                      </span>
                      <button
                        onClick={() => handleSectionToggle(section)}
                        className={`text-[10px] text-[#0088B1] font-semibold ${
                          selectedSections.includes(section)
                            ? "text-gray-400"
                            : "text-[#0088B1]"
                        }`}
                        disabled={selectedSections.includes(section)}
                      >
                        {selectedSections.includes(section) ? "Added" : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Medical Fields (only when Medical Information is selected) */}
            <div className="space-y-6">
              {selectedSections.includes("Medical Information") && (
                <div>
                  <h4 className="text-[14px] font-medium text-[#161D1F] mb-4">
                    Medical Information Fields
                  </h4>
                  <div className="space-y-1 border border-gray-300 rounded-lg">
                    {medicalFields.map((field) => (
                      <div
                        key={field}
                        className="flex items-center justify-between p-4 border-b border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <span className="text-[12px] text-[#161D1F]">
                          {field}
                        </span>
                        <button
                          onClick={() => handleMedicalFieldToggle(field)}
                          className={`text-[10px] text-[#0088B1] font-semibold ${
                            selectedMedicalFields.includes(field)
                              ? "text-gray-400"
                              : "text-[#0088B1]"
                          }`}
                          disabled={selectedMedicalFields.includes(field)}
                        >
                          {selectedMedicalFields.includes(field)
                            ? "Added"
                            : "Add"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section - Selected Items */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Selected Sections */}
            <div>
              <h4 className="text-[14px] font-medium text-[#161D1F] mb-4">
                Selected Sections
              </h4>
              <div className="min-h-[150px] border border-gray-300 rounded-lg">
                <div className="space-y-0">
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="text-[12px] text-[#161D1F]">
                      Patient Information
                    </span>
                    <span className="text-[10px] text-gray-500">(Default)</span>
                  </div>
                  {selectedSections.map((section) => (
                    <div
                      key={section}
                      className="flex items-center justify-between p-4 border-b"
                    >
                      <span className="text-[12px] text-[#161D1F]">
                        {section}
                      </span>
                      <button
                        onClick={() => handleSectionToggle(section)}
                        className="text-[10px] text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Fields */}
            <div>
              <h4 className="text-[14px] font-medium text-[#161D1F] mb-4">
                Selected Fields
              </h4>
              <div className="min-h-[150px] border border-gray-300 rounded-lg">
                {selectedMedicalFields.length === 0 ? (
                  <div className="flex items-center justify-center h-full min-h-[120px]">
                    <p className="text-[12px] text-gray-500">
                      No fields selected
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedMedicalFields.map((field) => (
                      <div
                        key={field}
                        className="flex items-center justify-between p-4 border-b"
                      >
                        <span className="text-[12px] text-[#161D1F]">
                          {field}
                        </span>
                        <button
                          onClick={() => handleMedicalFieldToggle(field)}
                          className="text-[10px] text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleReset}
            className="px-6 py-2 text-[#161D1F] text-[10px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className={`px-6 py-2 text-[10px] text-white rounded-lg transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0088B1] hover:bg-[#00729A]"
              }`}
            >
              {isSubmitting
                ? "Saving..."
                : editService
                ? "Update Service"
                : "Add Service"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionFieldSelector;
