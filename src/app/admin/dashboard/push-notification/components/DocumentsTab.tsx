"use client";
import React, { useRef } from "react";
import { Upload, Link as LinkIcon } from "lucide-react";
import { NotificationFormData } from "../types/types";

interface DocumentsTabProps {
  formData: NotificationFormData;
  updateFormData: (data: Partial<NotificationFormData>) => void;
  onImageUpload: (file: File) => void;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({
  formData,
  updateFormData,
  onImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File size should be less than 1MB");
        return;
      }

      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("Only JPG, JPEG, and PNG files are supported");
        return;
      }

      updateFormData({ imageFile: file });
      onImageUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
          <span className="text-red-500">*</span> Add feature URI
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="https://example.com"
            value={formData.appUri}
            onChange={(e) => updateFormData({ appUri: e.target.value })}
            className="w-full px-4 py-2 pr-10 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder:text-[#B0B6B8] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
          />
          <LinkIcon className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
          Upload Image (optional)
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#E5E8E9] rounded-lg p-8 text-center cursor-pointer hover:border-[#0088B1] transition-colors"
        >
          <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <div className="text-[12px] text-[#161D1F] mb-1">
            Upload Image (optional)
          </div>
          <div className="text-[10px] text-[#899193] mb-3">
            Drag and drop the image here or click to browse
            <br />
            supported file format: .jpg, .jpeg, .png
            <br />
            (max. 1MB, aspect ratio: 2:1, 1024*512 px)
          </div>
          <button
            type="button"
            className="px-6 py-2 bg-white border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] hover:bg-gray-50"
          >
            Select File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        {formData.imageFile && (
          <div className="mt-2 text-[10px] text-[#0088B1]">
            Selected: {formData.imageFile.name}
          </div>
        )}
      </div>

      <div className="bg-[#FFFBEA] border border-[#F59E0B] rounded-lg p-4">
        <div className="flex gap-2">
          <span className="text-[#F59E0B] text-lg">💡</span>
          <div>
            <div className="text-[12px] font-medium text-[#F59E0B] mb-1">
              Preview updates in real-time as you type
            </div>
            <div className="text-[10px] text-[#92400E]">
              As you enter the notification title, message, & upload image, get
              a real-time preview of how it will show up on users' phone. Refine
              instantly to ensure clarity and impact.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;
