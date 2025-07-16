import {
  ProductFormData,
  schedules,
  storageConditions,
} from "@/app/admin/dashboard/pharmacy/product/types/productForm.type";
import { ChevronDown } from "lucide-react";

interface SettingsTabProps {
  formData: ProductFormData;
  onInputChange: (field: keyof ProductFormData, value: any) => void;
  scheduleDropdownOpen: boolean;
  setScheduleDropdownOpen: (open: boolean) => void;
  storageDropdownOpen: boolean;
  setStorageDropdownOpen: (open: boolean) => void;
}

export const SettingsTab = ({
  formData,
  onInputChange,
  scheduleDropdownOpen,
  setScheduleDropdownOpen,
  storageDropdownOpen,
  setStorageDropdownOpen,
}: SettingsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Schedule
          </label>
          <div className="relative">
            <button
              onClick={() => setScheduleDropdownOpen(!scheduleDropdownOpen)}
              className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-left flex items-center justify-between"
            >
              <span
                className={formData.schedule ? "text-black" : "text-gray-500"}
              >
                {formData.schedule || "Select schedule"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {scheduleDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {schedules.map((schedule) => (
                  <button
                    key={schedule}
                    onClick={() => {
                      onInputChange("schedule", schedule);
                      setScheduleDropdownOpen(false);
                    }}
                    className="block w-full px-3 py-3 text-[#899193] text-[10px] text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {schedule}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Tax Rate (%)
          </label>
          <input
            type="number"
            placeholder="e.g., 5, 12, 18"
            value={formData.taxRate || ""}
            onChange={(e) =>
              onInputChange("taxRate", parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            HSN Code
          </label>
          <input
            type="text"
            placeholder="Enter HSN code"
            value={formData.HSN_Code}
            onChange={(e) => onInputChange("HSN_Code", e.target.value)}
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Storage Conditions
          </label>
          <div className="relative">
            <button
              onClick={() => setStorageDropdownOpen(!storageDropdownOpen)}
              className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-left flex items-center justify-between"
            >
              <span
                className={
                  formData.storageConditions ? "text-black" : "text-gray-500"
                }
              >
                {formData.storageConditions || "Select storage condition"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {storageDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {storageConditions.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => {
                      onInputChange("storageConditions", condition);
                      setStorageDropdownOpen(false);
                    }}
                    className="block w-full px-3 py-3 text-[#899193] text-[10px] text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {condition}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ‑‑‑‑ NEW ‑‑‑‑ */}
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Symptoms
          </label>
          <input
            type="text"
            placeholder="e.g., headache, cough"
            value={formData.Type || ""}
            onChange={(e) => onInputChange("Type", e.target.value)}
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>

        {/* existing Shelf Life input, unchanged */}
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Shelf Life (months)
          </label>
          <input
            type="number"
            placeholder="0"
            value={formData.shelfLife || ""}
            onChange={(e) =>
              onInputChange("shelfLife", parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div
          className={`p-4 border ${
            formData.prescriptionRequired
              ? "border-2 border-[#0088B1] bg-[#E8F4F7]"
              : "border-gray-200"
          } rounded-lg`}
        >
          {" "}
          <div className="flex items-start space-x-3 ">
            <input
              type="checkbox"
              checked={formData.prescriptionRequired}
              onChange={(e) =>
                onInputChange("prescriptionRequired", e.target.checked)
              }
              className="mt-0.5"
            />
            <div>
              <div className="font-medium text-[10px] text-[#161D1F]">
                Prescription Required
              </div>
              <div className="text-[8px] text-[#899193]">
                Check this if the product requires a prescription for purchase
              </div>
            </div>
          </div>
        </div>
        <div
          className={`p-4 border ${
            formData.featuredProduct
              ? "border-2 border-[#0088B1] bg-[#E8F4F7]"
              : "border-gray-200"
          } rounded-lg`}
        >
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.featuredProduct}
              onChange={(e) =>
                onInputChange("featuredProduct", e.target.checked)
              }
              className="mt-0.5"
            />
            <div>
              <div className="font-medium text-[10px] text-[#161D1F]">
                Featured Product
              </div>
              <div className="text-[8px] text-[#899193]">
                Featured products are displayed prominently on the website
              </div>
            </div>
          </div>
        </div>
        <div
          className={`p-4 border ${
            formData.activeProduct
              ? "border-2 border-[#0088B1] bg-[#E8F4F7]"
              : "border-gray-200"
          } rounded-lg`}
        >
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.activeProduct}
              onChange={(e) => onInputChange("activeProduct", e.target.checked)}
              className="mt-0.5 accent-[#0088B1]"
            />
            <div>
              <div className="font-medium text-[10px] text-[#161D1F]">
                Active Product
              </div>
              <div className="text-[8px] text-[#899193]">
                Inactive products are not displayed on the website
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
