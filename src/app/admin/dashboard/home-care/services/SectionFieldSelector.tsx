"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

interface SectionFieldData {
  sections: string[];
  medicalFields: string[];
}

interface SectionFieldSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SectionFieldData) => void;
  initialData?: SectionFieldData;
  editService?: any;
}

const SectionFieldSelector: React.FC<SectionFieldSelectorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  editService,
}) => {
  const [selectedSections, setSelectedSections] = useState<string[]>(
    initialData?.sections || []
  );
  const [selectedMedicalFields, setSelectedMedicalFields] = useState<string[]>(
    initialData?.medicalFields || []
  );

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

  const handleSave = () => {
    onSave({
      sections: selectedSections,
      medicalFields: selectedMedicalFields,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedSections([]);
    setSelectedMedicalFields([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
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
                <div className="space-y-3">
                  {availableSections.map((section) => (
                    <div
                      key={section}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <span className="text-[12px] text-[#161D1F]">
                        {section}
                      </span>
                      <button
                        onClick={() => handleSectionToggle(section)}
                        className={`px-4 py-2 text-[10px] text-white rounded hover:bg-[#00729A] transition-colors ${
                          selectedSections.includes(section)
                            ? "bg-gray-400"
                            : "bg-[#0088B1]"
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
                  <div className="space-y-3">
                    {medicalFields.map((field) => (
                      <div
                        key={field}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <span className="text-[12px] text-[#161D1F]">
                          {field}
                        </span>
                        <button
                          onClick={() => handleMedicalFieldToggle(field)}
                          className={`px-4 py-2 text-[10px] text-white rounded hover:bg-[#00729A] transition-colors ${
                            selectedMedicalFields.includes(field)
                              ? "bg-gray-400"
                              : "bg-[#0088B1]"
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
              <div className="min-h-[150px] p-4 border border-gray-200 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <span className="text-[12px] text-[#161D1F]">
                      Patient Information
                    </span>
                    <span className="text-[10px] text-gray-500">(Default)</span>
                  </div>
                  {selectedSections.map((section) => (
                    <div
                      key={section}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded border"
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
              <div className="min-h-[150px] p-4 border border-gray-200 rounded-lg">
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
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border"
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
              className="px-6 py-2 text-[10px] bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors"
            >
              {editService ? "Update Service" : "Add Service"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionFieldSelector;
