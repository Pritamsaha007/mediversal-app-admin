"use client";
import React, { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { useAdminStore } from "@/app/store/adminStore";
import SectionFieldSelector from "./SectionFieldSelector";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "Active" | "Inactive";
  offerings: Offering[];
  rating?: number;
  reviewCount?: number;
  consents?: Array<{
    id: string;
    consent: string;
    is_active: boolean;
    consent_category_id: string;
  }>;
  display_sections: string[];
  custom_medical_info: any;
}

interface Offering {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  staffRequirements: string[];
  equipmentIncluded: string[];
  status: "Excellent" | "Good" | "Available";
}
interface SectionFieldData {
  sections: string[];
  medicalFields: string[];
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddService: (service: Omit<Service, "id">) => void;
  onUpdateService?: (service: Service) => void;
  editService?: Service | null;
}
const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onAddService,
  onUpdateService,
  editService,
}) => {
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceStatus, setServiceStatus] = useState<"Active" | "Inactive">(
    "Active"
  );
  const [serviceTags, setServiceTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [consents, setConsents] = useState<string[]>([]);
  const [newConsent, setNewConsent] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [sectionFieldData, setSectionFieldData] = useState<SectionFieldData>({
    sections: [],
    medicalFields: [],
  });

  useEffect(() => {
    if (editService && isOpen) {
      setServiceName(editService.name);
      setServiceDescription(editService.description);
      setServiceStatus(editService.status);
      setServiceTags(editService.offerings.map((offering) => offering.name));
      setConsents(editService.consents?.map((c) => c.consent) || []);
      setConsents(editService.consents?.map((c) => c.consent) || []);
    } else if (isOpen) {
      handleReset();
    }
  }, [editService, isOpen]);

  const handleAddTag = () => {
    if (newTag.trim() && !serviceTags.includes(newTag.trim())) {
      setServiceTags([...serviceTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setServiceTags(serviceTags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddConsent = () => {
    if (newConsent.trim()) {
      setConsents([...consents, newConsent.trim()]);
      setNewConsent("");
    }
  };

  const handleRemoveConsent = (index: number) => {
    setConsents(consents.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setServiceName("");
    setServiceDescription("");
    setServiceStatus("Active");
    setServiceTags([]);
    setNewTag("");
    setConsents([]);
    setNewConsent("");
    setSectionFieldData({ sections: [], medicalFields: [] });
  };

  const handleSectionFieldSave = (data: SectionFieldData) => {
    setSectionFieldData(data);
    setShowSectionSelector(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-[16px] font-semibold text-[#161D1F]">
              {editService ? "Edit Service" : "Add New Service"}
            </h3>
            <p className="text-[10px] text-[#899193] mt-1">
              {editService
                ? "Update the service details below"
                : "Enter the service details below"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#899193]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                <span className="text-red-500">*</span> Service Name
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Enter service name"
                className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                <span className="text-red-500">*</span> Service Description
              </label>
              <textarea
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Enter service description"
                rows={4}
                className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg  focus:border-transparent resize-none text-[#161D1F] placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Service Status
                </label>
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsStatusDropdownOpen(!isStatusDropdownOpen)
                    }
                    className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg text-[10px]  focus:border-black flex items-center justify-between text-[#161D1F]"
                  >
                    {serviceStatus}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isStatusDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                      {(["Active", "Inactive"] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setServiceStatus(status);
                            setIsStatusDropdownOpen(false);
                          }}
                          className="w-full text-[10px] px-4 py-2 text-left hover:bg-gray-50 text-[#161D1F]"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  Service Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter service tag"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-[10px] focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-6 py-2 bg-[#0088B1] text-[10px] text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {serviceTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {serviceTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 text-white text-[10px] rounded-full"
                        style={{ backgroundColor: "#0088B1" }}
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:bg-black/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                Consents
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newConsent}
                  onChange={(e) => setNewConsent(e.target.value)}
                  placeholder="Enter consent text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-[10px] focus:border-transparent text-[#161D1F] placeholder-gray-400"
                />
                <button
                  onClick={handleAddConsent}
                  className="px-6 py-2 text-[10px] bg-[#0088B1] text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>

              {consents.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-medium text-[#161D1F] mb-3">
                    Added Consents
                  </h4>
                  <div className="space-y-3">
                    {consents.map((consent, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                      >
                        <span className="text-sm text-gray-600 font-medium">
                          {index + 1}.
                        </span>
                        <p className="flex-1 text-sm text-[#161D1F]">
                          {consent}
                        </p>
                        <button
                          onClick={() => handleRemoveConsent(index)}
                          className="text-red-500 hover:text-red-700 text-[10px] font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleReset}
            className="px-6 py-2 text-[#161D1F] text-[10px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setShowSectionSelector(true)}
            className="px-6 py-2 text-[#161D1F] text-[10px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
      <SectionFieldSelector
        isOpen={showSectionSelector}
        onClose={() => setShowSectionSelector(false)}
        onSave={handleSectionFieldSave}
        initialData={sectionFieldData}
        editService={editService}
        serviceData={{
          name: serviceName,
          description: serviceDescription,
          status: serviceStatus,
          tags: serviceTags,
          consents: consents,
        }}
        onAddService={onAddService}
        onUpdateService={onUpdateService}
        onCloseMainModal={onClose}
        onResetMainForm={handleReset}
      />
    </div>
  );
};

export default AddServiceModal;
