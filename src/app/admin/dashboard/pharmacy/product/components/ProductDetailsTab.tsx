import { ChevronDown } from "lucide-react";
import { dosageForms, ProductFormData } from "../types/productForm.type";

interface ProductDetailsTabProps {
  formData: ProductFormData;
  onInputChange: (field: keyof ProductFormData, value: any) => void;
  dosageDropdownOpen: boolean;
  setDosageDropdownOpen: (open: boolean) => void;
  selectedImages: File[];
  imagePreviews: string[];
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onDrop: (files: FileList) => void;
}

export const ProductDetailsTab = ({
  formData,
  onInputChange,
  dosageDropdownOpen,
  setDosageDropdownOpen,
  selectedImages,
  imagePreviews,
  onImageChange,
  onRemoveImage,
  onDrop,
}: ProductDetailsTabProps) => {
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDrop(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  return (
    <div className="space-y-4">
      {/* Upload Photo Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-[#161D1F]">
          Product Images
        </label>

        {/* Drag-and-Drop Upload Box */}
        <div
          className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center cursor-pointer hover:border-[#0088B1]"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <p className="text-sm text-gray-600">Drag and drop images here</p>
          <p className="text-xs text-gray-500">or click to upload</p>
          <label className="mt-2 inline-block cursor-pointer text-white bg-[#0088B1] px-4 py-2 text-sm rounded hover:bg-[#00779d]">
            Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Image Preview */}
        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-6 gap-3 ">
            {imagePreviews.map((src, idx) => (
              <div
                key={idx}
                className="relative border-2 rounded-md overflow-hidden border-[#0088B1]"
              >
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  className="object-fill w-full h-24"
                />
                <button
                  onClick={() => onRemoveImage(idx)}
                  className="absolute top-0 right-0 bg-[#0088B1] bg-opacity-50 text-white text-xs px-1 hover:bg-opacity-70"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
          value={formData.safetyDescription}
          onChange={(e) => onInputChange("safetyDescription", e.target.value)}
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
            value={formData.Composition}
            onChange={(e) => onInputChange("Composition", e.target.value)}
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
            value={formData.ProductStrength ?? ""}
            onChange={(e) => onInputChange("ProductStrength", e.target.value)}
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
            value={formData.PackageSize}
            onChange={(e) => onInputChange("PackageSize", e.target.value)}
            className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
};
