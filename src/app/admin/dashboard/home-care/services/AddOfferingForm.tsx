"use client";
import React, { useEffect, useState } from "react";
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
  editingOffering?: Offering | null;
}

const AddOfferingForm: React.FC<AddOfferingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  serviceName,
  editingOffering,
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
    selectedTypes: [] as string[],
    sessionValue: "",
    hoursValue: "",
    dayValue: "",
    weekValue: "",
    monthValue: "",
  });

  useEffect(() => {
    if (editingOffering) {
      // Parse duration back to individual values (you'll need to implement this based on your duration format)
      const parsedDuration = parseDurationString(editingOffering.duration);

      setFormData({
        name: editingOffering.name,
        price: editingOffering.price.toString(),
        duration: editingOffering.duration,
        description: editingOffering.description,
        staffRequirements: editingOffering.staffRequirements.join(", "),
        equipmentNeeded: editingOffering.equipmentIncluded.join(", "),
        features: editingOffering.features.join(", "),
        status: "Active",
        selectedTypes: parsedDuration.types,
        sessionValue: parsedDuration.sessionValue,
        hoursValue: parsedDuration.hoursValue,
        dayValue: parsedDuration.dayValue,
        weekValue: parsedDuration.weekValue,
        monthValue: parsedDuration.monthValue,
      });
    }
  }, [editingOffering]);

  const buildDurationString = () => {
    const parts = [];
    if (formData.sessionValue && formData.selectedTypes.includes("Session")) {
      parts.push(`${formData.sessionValue} Sessions`);
    }
    if (formData.hoursValue && formData.selectedTypes.includes("Hours")) {
      parts.push(`${formData.hoursValue} Hours`);
    }
    if (formData.dayValue && formData.selectedTypes.includes("Day")) {
      parts.push(`${formData.dayValue} Days`);
    }
    if (formData.weekValue && formData.selectedTypes.includes("Week")) {
      parts.push(`${formData.weekValue} Weeks`);
    }
    if (formData.monthValue && formData.selectedTypes.includes("Month")) {
      parts.push(`${formData.monthValue} Months`);
    }
    return parts.join(", ");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const offering: Omit<Offering, "id"> = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      duration: buildDurationString(),
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

    console.log("Offering Data:", JSON.stringify(offering, null, 2));
    console.log("Raw Form Data:", JSON.stringify(formData, null, 2));

    onSubmit(offering);
    handleReset();
  };

  const toggleDurationType = (type: string) => {
    setFormData((prev) => {
      if (type === "Session") {
        // If Session is selected, only allow Session
        return {
          ...prev,
          selectedTypes: prev.selectedTypes.includes("Session")
            ? []
            : ["Session"],
          hoursValue: "",
          dayValue: "",
          weekValue: "",
          monthValue: "",
        };
      } else {
        // For other types, toggle and remove Session if present
        const newSelectedTypes = prev.selectedTypes.includes(type)
          ? prev.selectedTypes.filter((t) => t !== type)
          : prev.selectedTypes.filter((t) => t !== "Session").concat(type);

        return {
          ...prev,
          selectedTypes: newSelectedTypes,
          sessionValue: newSelectedTypes.includes("Session")
            ? prev.sessionValue
            : "",
        };
      }
    });
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
      // Reset duration fields
      selectedTypes: [],
      sessionValue: "",
      hoursValue: "",
      dayValue: "",
      weekValue: "",
      monthValue: "",
    });
  };

  const parseDurationString = (duration: string) => {
    const types: string[] = [];
    let sessionValue = "";
    let hoursValue = "";
    let dayValue = "";
    let weekValue = "";
    let monthValue = "";

    const parts = duration.split(", ");

    parts.forEach((part) => {
      if (part.includes("Session")) {
        types.push("Session");
        sessionValue = part.replace(" Sessions", "");
      } else if (part.includes("Hour")) {
        types.push("Hours");
        hoursValue = part.replace(" Hours", "");
      } else if (part.includes("Day")) {
        types.push("Day");
        dayValue = part.replace(" Days", "");
      } else if (part.includes("Week")) {
        types.push("Week");
        weekValue = part.replace(" Weeks", "");
      } else if (part.includes("Month")) {
        types.push("Month");
        monthValue = part.replace(" Months", "");
      }
    });

    return {
      types,
      sessionValue,
      hoursValue,
      dayValue,
      weekValue,
      monthValue,
    };
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
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[14px] font-medium text-[#161D1F]">
            {editingOffering ? "Edit Offering" : "Add New Offering"}
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
              <div className="space-y-3">
                {/* Duration type buttons */}
                <div className="flex gap-2 flex-wrap">
                  {["Session", "Hours", "Day", "Week", "Month"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleDurationType(type)}
                      className={`px-4 py-2 rounded-full text-[10px] font-medium transition-colors ${
                        formData.selectedTypes.includes(type)
                          ? "bg-[#0088B1] text-white"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Dynamic input fields based on selected types */}
                <div className="space-y-2">
                  {formData.selectedTypes.includes("Session") && (
                    <input
                      type="text"
                      value={formData.sessionValue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sessionValue: e.target.value,
                        }))
                      }
                      placeholder="e.g., 1,2,3,4,5,....24"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
                    />
                  )}

                  {formData.selectedTypes.includes("Hours") && (
                    <input
                      type="text"
                      value={formData.hoursValue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hoursValue: e.target.value,
                        }))
                      }
                      placeholder="Hours: e.g., 1,2,3,4,5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
                    />
                  )}

                  {formData.selectedTypes.includes("Day") && (
                    <input
                      type="text"
                      value={formData.dayValue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dayValue: e.target.value,
                        }))
                      }
                      placeholder="Days: e.g., 1,2,3,4,5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
                    />
                  )}

                  {formData.selectedTypes.includes("Week") && (
                    <input
                      type="text"
                      value={formData.weekValue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          weekValue: e.target.value,
                        }))
                      }
                      placeholder="Weeks: e.g., 1,2,3,4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
                    />
                  )}

                  {formData.selectedTypes.includes("Month") && (
                    <input
                      type="text"
                      value={formData.monthValue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          monthValue: e.target.value,
                        }))
                      }
                      placeholder="Months: e.g., 1,2,3,4,5,6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
                    />
                  )}

                  {formData.selectedTypes.length === 0 && (
                    <div className="text-[8px] text-[#899193] py-4 text-center border border-gray-200 rounded-md bg-gray-50">
                      Select duration types above to add values
                    </div>
                  )}
                </div>
              </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
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
              {editingOffering ? "Update Offering" : "Add Offering"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOfferingForm;
