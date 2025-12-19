import {
  ProductFormData,
  schedules,
  storageConditions,
  symptoms,
} from "@/app/admin/dashboard/pharmacy/product/types/productForm.type";
import { ChevronDown } from "lucide-react";

interface SettingsTabProps {
  formData: ProductFormData;
  onInputChange: (field: keyof ProductFormData, value: any) => void;
  scheduleDropdownOpen: boolean;
  setScheduleDropdownOpen: (open: boolean) => void;
  storageDropdownOpen: boolean;
  setStorageDropdownOpen: (open: boolean) => void;
  symptomsDropdownOpen: boolean;
  setSymptomsDropdownOpen: (open: boolean) => void;
}

export const SettingsTab = ({
  formData,
  onInputChange,
  scheduleDropdownOpen,
  setScheduleDropdownOpen,
  storageDropdownOpen,
  setStorageDropdownOpen,
  symptomsDropdownOpen,
  setSymptomsDropdownOpen,
}: SettingsTabProps) => {
  console.log(formData, "cold cahin");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Cold Chain
          </label>
          <div className="relative">
            <button
              onClick={() => setScheduleDropdownOpen(!scheduleDropdownOpen)}
              className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-left flex items-center justify-between"
            >
              <span
                className={formData.ColdChain ? "text-black" : "text-gray-500"}
              >
                {formData.ColdChain === "Yes"
                  ? "Yes - Cold Chain Required"
                  : formData.ColdChain === "No"
                  ? "No - No Cold Chain"
                  : "Select Cold Chain"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {scheduleDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <button
                  onClick={() => {
                    onInputChange("ColdChain", "Yes"); // Set to string "Yes"
                    setScheduleDropdownOpen(false);
                  }}
                  className="block w-full px-3 py-3 text-[#899193] text-[10px] text-left hover:bg-gray-100 first:rounded-t-lg"
                >
                  Yes - Cold Chain Required
                </button>
                <button
                  onClick={() => {
                    onInputChange("ColdChain", "No");
                    setScheduleDropdownOpen(false);
                  }}
                  className="block w-full px-3 py-3 text-[#899193] text-[10px] text-left hover:bg-gray-100 last:rounded-b-lg"
                >
                  No - No Cold Chain
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            <span className="text-red-500">*</span> GST (%)
          </label>
          <input
            type="text"
            placeholder="e.g., 5%, 12%, 18%"
            value={formData.GST || ""}
            onChange={(e) => onInputChange("GST", e.target.value)}
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
            Tax Rate (%)
          </label>
          <input
            type="number"
            placeholder="e.g., 5, 12, 18"
            value={formData.tax || ""}
            onChange={(e) =>
              onInputChange("tax", parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Symptoms
          </label>
          <div className="relative">
            <button
              onClick={() => setSymptomsDropdownOpen(!symptomsDropdownOpen)}
              className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-left flex items-center justify-between"
            >
              <span className={formData.Type ? "text-black" : "text-gray-500"}>
                {formData.Type || "Select symptoms"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {symptomsDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {symptoms.map((symptom, index) => (
                  <button
                    key={`${symptom}-${index}`}
                    onClick={() => {
                      onInputChange("Type", symptom);
                      setSymptomsDropdownOpen(false);
                    }}
                    className="block w-full px-3 py-3 text-[#899193] text-[10px] text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* <div>
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
        </div> */}
      </div>

      <div className="space-y-3">
        <div
          className={`p-4 border ${
            formData.PrescriptionRequired
              ? "border-2 border-[#0088B1] bg-[#E8F4F7]"
              : "border-gray-200"
          } rounded-lg`}
        >
          <div className="flex items-start space-x-3 ">
            <input
              type="checkbox"
              checked={formData.PrescriptionRequired === "Yes"}
              onChange={(e) =>
                onInputChange(
                  "PrescriptionRequired",
                  e.target.checked ? "Yes" : "No"
                )
              }
              className="mt-0.5 accent-[#0088B1]"
            />
            <div>
              <div className="font-medium text-[10px] text-[#161D1F]">
                <span className="text-red-500">*</span> Prescription Required
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
              className="mt-0.5 accent-[#0088B1]"
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
            formData.active
              ? "border-2 border-[#0088B1] bg-[#E8F4F7]"
              : "border-gray-200"
          } rounded-lg`}
        >
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => onInputChange("active", e.target.checked)}
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
