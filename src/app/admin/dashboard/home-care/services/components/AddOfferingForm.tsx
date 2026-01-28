"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getDurationTypes, createOrUpdateOffering } from "../service";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import { CreateUpdateOfferingPayload, Offering } from "../types";

interface AddOfferingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offering: Omit<Offering, "id">) => void;
  serviceName: string;
  serviceId: string;
  editingOffering?: Offering | null;
}

interface DurationType {
  id: string;
  value: string;
  code: string;
  slno: number;
}

const AddOfferingForm: React.FC<AddOfferingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  serviceName,
  serviceId,
  editingOffering,
}) => {
  const { token } = useAdminStore();
  const [durationTypes, setDurationTypes] = useState<DurationType[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration_in_hrs: "",
    duration_type_id: "",
    description: "",
    staffRequirements: "",
    equipmentRequirements: "",
    features: "",
    is_device: false,
    device_stock_count: "0",
  });

  useEffect(() => {
    const fetchDurationTypes = async () => {
      if (!token) {
        console.log("No token available for fetching duration types");
        return;
      }

      console.log("Fetching duration types...");

      try {
        const response = await getDurationTypes(token);
        console.log("Duration types response:", response);

        if (response.success) {
          console.log("Duration types loaded:", response.roles);
          setDurationTypes(response.roles);
        } else {
          console.log("Failed to fetch duration types:", response);
        }
      } catch (error) {
        toast.error("Failed to load duration types");
      }
    };

    if (isOpen) {
      fetchDurationTypes();
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (editingOffering && durationTypes.length > 0) {
      console.log("Editing offering:", editingOffering);

      let duration_type_id = "";
      const foundType = durationTypes.find(
        (type) =>
          type.value.toLowerCase() ===
          editingOffering.duration_type?.toLowerCase(),
      );

      if (foundType) {
        duration_type_id = foundType.id;
      }

      setFormData({
        name: editingOffering.name,
        price: editingOffering.price.toString(),
        duration_in_hrs: editingOffering.duration_in_hrs?.toString() || "1",
        duration_type_id: duration_type_id,
        description: editingOffering.description,
        staffRequirements: editingOffering.staffRequirements.join(", "),
        equipmentRequirements: editingOffering.equipmentIncluded.join(", "),
        features: editingOffering.features.join(", "),
        is_device: editingOffering.is_device || false,
        device_stock_count:
          editingOffering.device_stock_count?.toString() || "0",
      });
    } else {
      handleReset();
    }
  }, [editingOffering, durationTypes]);

  const handleReset = () => {
    console.log("Resetting form data - Setting defaults for new offering");
    setFormData({
      name: "",
      price: "",
      duration_in_hrs: "",
      duration_type_id: "",
      description: "",
      staffRequirements: "",
      equipmentRequirements: "",
      features: "",
      is_device: false,
      device_stock_count: "0",
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("Raw form data:", formData);
    console.log("Service ID:", serviceId);
    console.log("Editing offering:", editingOffering);

    try {
      const payload: CreateUpdateOfferingPayload = {
        ...(editingOffering?.id && { id: editingOffering.id }),
        homecare_service_id: serviceId,
        name: formData.name.trim(),
        price: parseFloat(formData.price) || 0,
        duration_in_hrs: parseFloat(formData.duration_in_hrs) || 1,
        duration_type_id: formData.duration_type_id,
        description: formData.description.trim(),
        staff_requirements: formData.staffRequirements
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        equipment_requirements: formData.equipmentRequirements
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e),
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f),
        is_device: formData.is_device,
        device_stock_count: parseInt(formData.device_stock_count) || 0,
        is_active: true,
      };

      console.log("Payload being sent:", JSON.stringify(payload, null, 2));

      const response = await createOrUpdateOffering(payload, token!);

      console.log("API response:", response);

      if (response.success) {
        const successMessage = editingOffering
          ? "Offering updated successfully!"
          : "New offering added successfully!";

        toast.success(successMessage);

        handleReset();
        onClose();

        // Instead of reloading the window, call onSubmit which will refresh the offerings
        onSubmit({
          name: formData.name.trim(),
          price: parseFloat(formData.price) || 0,
          duration: `${formData.duration_in_hrs} ${durationTypes.find((t) => t.id === formData.duration_type_id)?.value || ""}`,
          duration_in_hrs: parseFloat(formData.duration_in_hrs) || 1,
          duration_type:
            durationTypes.find((t) => t.id === formData.duration_type_id)
              ?.value || "",
          staffRequirements: formData.staffRequirements
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
          equipmentIncluded: formData.equipmentRequirements
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e),
          features: formData.features
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f),
          is_device: formData.is_device,
          device_stock_count: parseInt(formData.device_stock_count) || 0,
          status: "Available",
          description: formData.description.trim(),
        });
      } else {
        console.log("API returned success: false");
        throw new Error(response.message || "Failed to save offering");
      }
    } catch (error: any) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      toast.error(error.message || "Failed to save offering");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
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

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-[9px] text-gray-600 mb-2">
                      Select Duration Type:
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {durationTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              duration_type_id:
                                prev.duration_type_id === type.id
                                  ? ""
                                  : type.id,
                            }));
                          }}
                          className={`px-3 py-2 rounded-lg text-[9px] font-medium transition-all duration-200 border ${
                            formData.duration_type_id === type.id
                              ? "bg-[#0088B1] text-white border-[#0088B1] shadow-sm"
                              : "bg-white text-gray-600 border-gray-300 hover:border-[#0088B1] hover:bg-blue-50"
                          }`}
                        >
                          {type.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.duration_type_id ? (
                    <div className="space-y-2">
                      <div className="text-[9px] text-gray-600">Duration:</div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          name="duration_in_hrs"
                          value={formData.duration_in_hrs}
                          onChange={handleInputChange}
                          placeholder="Enter Value (e.g., 1, 2, 24)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-[8px] text-[#899193] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193]"
                          required
                        />
                        <div className="text-[8px] text-[#0088B1] bg-blue-50 px-2 py-1 rounded">
                          {
                            durationTypes.find(
                              (t) => t.id === formData.duration_type_id,
                            )?.value
                          }
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[8px] text-[#899193] py-6 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                      Please select a duration type above to continue
                    </div>
                  )}
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
                * Equipment Requirements
              </label>
              <textarea
                name="equipmentRequirements"
                value={formData.equipmentRequirements}
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

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-[10px] font-medium text-[#161D1F] mb-3">
                Additional Settings
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {" "}
                {/* Changed from 3 to 2 */}
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_device"
                      name="is_device"
                      checked={formData.is_device}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded cursor-pointer accent-[#0088B1]"
                    />
                    <label
                      htmlFor="is_device"
                      className="text-[9px] font-medium text-[#161D1F] cursor-pointer select-none"
                    >
                      Device Required
                    </label>
                  </div>
                  <div className="text-[7px] text-gray-500 mt-1">
                    Check if this offering requires a device
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <label
                    htmlFor="device_stock_count"
                    className="block text-[9px] font-medium text-[#161D1F] mb-2"
                  >
                    Device Stock Count
                  </label>
                  <input
                    type="number"
                    id="device_stock_count"
                    name="device_stock_count"
                    value={formData.device_stock_count}
                    onChange={handleInputChange}
                    placeholder="0"
                    disabled={!formData.is_device}
                    className={`w-full px-3 py-2 border rounded-lg text-[8px] focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent placeholder:text-[8px] placeholder-[#899193] transition-all ${
                      formData.is_device
                        ? "border-gray-300 text-[#161D1F] bg-white"
                        : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                    }`}
                    min="0"
                  />
                  <div className="text-[7px] text-gray-500 mt-1">
                    {formData.is_device
                      ? "Available devices in stock"
                      : "Enable device option first"}
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded cursor-pointer accent-[#0088B1]"
                    />
                    <label
                      htmlFor="is_active"
                      className="text-[9px] font-medium text-[#161D1F] cursor-pointer select-none"
                    >
                      Active Status
                    </label>
                  </div>
                  <div className="text-[7px] text-gray-500 mt-1">
                    {formData.is_active
                      ? "Offering is active"
                      : "Offering is inactive"}
                  </div>
                </div> */}
            {/* </div>
            </div> */}
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-6 py-2 text-[10px] text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 text-[10px] bg-[#0088B1] text-white rounded-md hover:bg-[#00729A] disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : editingOffering
                ? "Update Offering"
                : "Add Offering"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOfferingForm;
