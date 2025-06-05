import { ChevronDown } from "lucide-react";
import { dosageForms, ProductFormData } from "@/app/types/productForm.type";

interface ProductDetailsTabProps {
  formData: ProductFormData;
  onInputChange: (field: keyof ProductFormData, value: any) => void;
  dosageDropdownOpen: boolean;
  setDosageDropdownOpen: (open: boolean) => void;
}

export const ProductDetailsTab = ({
  formData,
  onInputChange,
  dosageDropdownOpen,
  setDosageDropdownOpen,
}: ProductDetailsTabProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
          Description
        </label>
        <textarea
          placeholder="Enter product description"
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          rows={4}
          className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none resize-none"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
          Safty Advice
        </label>
        <textarea
          placeholder="Enter Safety Advice"
          value={formData.saftyDescription}
          onChange={(e) => onInputChange("saftyDescription", e.target.value)}
          rows={4}
          className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none resize-none"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
          Storage & Special Instructions
        </label>
        <textarea
          placeholder="Enter Storage & Special Instructions"
          value={formData.storageDescription}
          onChange={(e) => onInputChange("storageDescription", e.target.value)}
          rows={4}
          className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Composition
          </label>
          <input
            type="text"
            placeholder="Enter Composition"
            value={formData.composition}
            onChange={(e) => onInputChange("composition", e.target.value)}
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Dosage Form
          </label>
          <div className="relative">
            <button
              onClick={() => setDosageDropdownOpen(!dosageDropdownOpen)}
              className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-left flex items-center justify-between"
            >
              <span
                className={formData.dosageForm ? "text-black" : "text-gray-500"}
              >
                {formData.dosageForm || "Select dosage form"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {dosageDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {dosageForms.map((form) => (
                  <button
                    key={form}
                    onClick={() => {
                      onInputChange("dosageForm", form);
                      setDosageDropdownOpen(false);
                    }}
                    className="block w-full px-3 py-3 text-[#899193] text-[10px] text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {form}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Strength
          </label>
          <input
            type="text"
            placeholder="e.g., 500mg, 10ml"
            value={formData.strength}
            onChange={(e) => onInputChange("strength", e.target.value)}
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Pack Size
          </label>
          <input
            type="text"
            placeholder="e.g., 10 tablets, 100ml"
            value={formData.packSize}
            onChange={(e) => onInputChange("packSize", e.target.value)}
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
};
