import { ChevronDown } from "lucide-react";
import { categories, ProductFormData } from "../types/productForm.type";

interface BasicInformationTabProps {
  formData: ProductFormData;
  onInputChange: (field: keyof ProductFormData, value: any) => void;
  categoryDropdownOpen: boolean;
  setCategoryDropdownOpen: (open: boolean) => void;
}

export const BasicInformationTab = ({
  formData,
  onInputChange,
  categoryDropdownOpen,
  setCategoryDropdownOpen,
}: BasicInformationTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            <span className="text-red-500">*</span> Product Name
          </label>
          <input
            type="text"
            placeholder="Enter Product Name"
            value={formData.productName}
            onChange={(e) => onInputChange("productName", e.target.value)}
            className="w-full px-3 py-3 text-[#899193] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-[10px]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            <span className="text-red-500">*</span> SKU
          </label>
          <input
            type="text"
            placeholder="Enter SKU"
            value={formData.SKU}
            onChange={(e) => onInputChange("SKU", e.target.value)}
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            <span className="text-red-500">*</span> Category
          </label>
          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-left flex items-center justify-between"
            >
              <span
                className={formData.category ? "text-black" : "text-gray-500"}
              >
                {formData.category || "Select a category"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {categoryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {categories.slice(1).map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      onInputChange("category", category);
                      setCategoryDropdownOpen(false);
                    }}
                    className="block w-full px-3 py-3 text-[#899193] text-[10px] text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            Sub Category
          </label>
          <input
            type="text"
            placeholder="Enter subcategory"
            value={formData.subCategory}
            onChange={(e) => onInputChange("subCategory", e.target.value)}
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            <span className="text-red-500">*</span> Brand
          </label>
          <input
            type="text"
            placeholder="Enter brand name"
            value={formData.brand}
            onChange={(e) => onInputChange("brand", e.target.value)}
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            <span className="text-red-500">*</span> Manufacturer
          </label>
          <input
            type="text"
            placeholder="Enter manufacturer name"
            value={formData.manufacturer}
            onChange={(e) => onInputChange("manufacturer", e.target.value)}
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            <span className="text-red-500">*</span> MRP (₹)
          </label>
          <input
            type="number"
            placeholder="0"
            value={formData.mrp || ""}
            onChange={(e) =>
              onInputChange("mrp", parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            <span className="text-red-500">*</span> Selling Price (₹)
          </label>
          <input
            type="number"
            placeholder="0"
            value={formData.sellingPrice || ""}
            onChange={(e) =>
              onInputChange("sellingPrice", parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            <span className="text-red-500">*</span> Stock Quantity
          </label>
          <input
            type="number"
            placeholder="0"
            min="0" // Add minimum value
            max="999999" // Add reasonable maximum
            value={formData.stockQuantity ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              // Handle empty string case
              if (value === "") {
                onInputChange("stockQuantity", 0);
              } else {
                const numValue = Math.min(999999, Math.max(0, Number(value)));
                onInputChange("stockQuantity", numValue);
              }
            }}
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
};
