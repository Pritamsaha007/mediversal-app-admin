import React, { useState } from "react";
import { X } from "lucide-react";

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

interface AddOfferingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offering: Omit<Offering, "id">) => void;
  serviceName: string;
}

const AddOfferingForm: React.FC<AddOfferingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  serviceName,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
    staffRequirements: "",
    equipmentNeeded: "",
    features: "",
    status: "Active" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const offering: Omit<Offering, "id"> = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      duration: formData.duration,
      features: formData.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f),
      staffRequirements: formData.staffRequirements
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      equipmentIncluded: formData.equipmentNeeded
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e),
      status: "Available",
    };

    onSubmit(offering);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      name: "",
      price: "",
      duration: "",
      description: "",
      staffRequirements: "",
      equipmentNeeded: "",
      features: "",
      status: "Active",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[14px] font-medium text-[#161D1F]">
            Add New Offering
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                * Services
              </label>
              <select
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
              >
                <option>{serviceName}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                * Offering Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter Offering Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                * Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                * Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g. 12 Hours, day, week, month..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
              * Offering Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the service"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
              * Staff Requirements
            </label>
            <textarea
              name="staffRequirements"
              value={formData.staffRequirements}
              onChange={handleInputChange}
              placeholder="Required qualifications (comma separated)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
              * Equipment Needed
            </label>
            <textarea
              name="equipmentNeeded"
              value={formData.equipmentNeeded}
              onChange={handleInputChange}
              placeholder="Required equipment (comma separated)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
              * Features/Inclusions
            </label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              placeholder="Service features and inclusions (comma separated)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
              * Service Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 text-[10px] text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-[10px] bg-[#0088B1] text-white rounded-md hover:bg-[#00729A]"
            >
              Add Offering
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOfferingForm;
