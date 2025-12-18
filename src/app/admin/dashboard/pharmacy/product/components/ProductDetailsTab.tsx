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
  onRemoveExistingImage?: (index: number) => void;
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
  onRemoveExistingImage,
  onDrop,
}: ProductDetailsTabProps) => {
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDrop(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const allImages = [
    ...(formData.image_url || []).map((url, idx) => ({
      type: "existing" as const,
      src: url,
      index: idx,
    })),
    ...imagePreviews.map((src, idx) => ({
      type: "new" as const,
      src,
      index: idx,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-[#161D1F]">
          Product Images
        </label>

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
              id="image-upload"
              className="hidden"
              accept=".jpg,.jpeg,.png"
              onChange={onImageChange}
              multiple
            />
          </label>
        </div>

        {allImages.length > 0 && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              {imagePreviews.length > 0
                ? "All Images (Existing + New)"
                : "Existing Images"}
            </label>
            <div className="grid grid-cols-6 gap-3">
              {allImages.map((img, idx) => (
                <div
                  key={`${img.type}-${img.index}`}
                  className={`relative border-2 rounded-md overflow-hidden ${
                    img.type === "existing"
                      ? "border-[#0088B1]"
                      : "border-green-500"
                  }`}
                >
                  <img
                    src={img.src}
                    alt={`${img.type}-${img.index}`}
                    className="object-fill w-full h-24"
                  />
                  <button
                    onClick={() => {
                      if (img.type === "existing" && onRemoveExistingImage) {
                        onRemoveExistingImage(img.index);
                      } else if (img.type === "new") {
                        onRemoveImage(img.index);
                      }
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs hover:bg-red-600 rounded-bl-lg flex items-center justify-center w-5 h-5"
                    type="button"
                  >
                    ×
                  </button>

                  <div
                    className={`absolute bottom-0 left-0 text-[8px] px-1 py-0.5 text-white ${
                      img.type === "existing" ? "bg-[#0088B1]" : "bg-green-500"
                    }`}
                  >
                    {img.type === "existing" ? "Existing" : "New"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          <p>
            Total images: {allImages.length} / 5 max
            {formData.image_url?.length > 0 && (
              <span className="ml-2">
                ({formData.image_url.length} existing, {imagePreviews.length}{" "}
                new)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Rest of your form fields remain the same */}
      <div>
        <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
          <span className="text-red-500">*</span> Product Information
        </label>
        <textarea
          placeholder="Enter product information"
          value={formData.ProductInformation}
          onChange={(e) => onInputChange("ProductInformation", e.target.value)}
          rows={4}
          className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none resize-none"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
          <span className="text-red-500">*</span> Safety Advice
        </label>
        <textarea
          placeholder="Enter Safety Advice"
          value={formData.SafetyAdvices}
          onChange={(e) => onInputChange("SafetyAdvices", e.target.value)}
          rows={4}
          className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none resize-none"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
          <span className="text-red-500">*</span> Storage Instructions
        </label>
        <textarea
          placeholder="Enter Storage Instructions"
          value={formData.StorageInstructions}
          onChange={(e) => onInputChange("StorageInstructions", e.target.value)}
          rows={4}
          className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
            <span className="text-red-500">*</span> Composition
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
      </div>
    </div>
  );
};
