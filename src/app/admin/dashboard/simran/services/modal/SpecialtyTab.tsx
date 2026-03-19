"use client";
import React from "react";
import { ServiceFormData } from "../types/serviceTypes";
import { ImageUploadField, TagInputRow, Checkbox } from "./ServiceModalShared";

interface SpecialtyTabProps {
  form: ServiceFormData;
  onChange: (form: ServiceFormData) => void;
  imageUploading: boolean;
  onFileSelect: (file: File) => void;
}

const SpecialtyTab: React.FC<SpecialtyTabProps> = ({
  form,
  onChange,
  imageUploading,
  onFileSelect,
}) => {
  const set = (patch: Partial<ServiceFormData>) =>
    onChange({ ...form, ...patch });

  return (
    <div className="space-y-4 pb-4">
      <ImageUploadField
        label="Specialty Image"
        value={form.image_url}
        uploading={imageUploading}
        onFileSelect={onFileSelect}
      />

      <div>
        <label className="block text-[12px] text-[#161D1F] mb-1">
          * Specialty Title
        </label>
        <input
          type="text"
          placeholder="Please provide a suitable service title"
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
        />
      </div>

      <div>
        <label className="block text-[12px] text-[#161D1F] mb-1">
          * Description
        </label>
        <textarea
          placeholder="Short brief about the title"
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] resize-none"
        />
      </div>

      <TagInputRow
        label="* Tags"
        items={form.tags}
        placeholder="Specify some tags related to the specialty"
        onAdd={(val) => set({ tags: [...form.tags, val] })}
        onRemove={(idx) => set({ tags: form.tags.filter((_, i) => i !== idx) })}
      />

      <div className="grid grid-cols-2 gap-3">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
            form.is_active
              ? "border-[#0088B1] bg-[#E8F4F7]"
              : "border-[#E5E8E9] bg-white"
          }`}
          onClick={() => set({ is_active: !form.is_active })}
        >
          <Checkbox checked={form.is_active} />
          <div>
            <p className="text-[12px] font-medium text-[#161D1F]">
              Active Service
            </p>
            <p className="text-[10px] text-[#899193]">Visible on website</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
            form.is_featured
              ? "border-[#0088B1] bg-[#E8F4F7]"
              : "border-[#E5E8E9] bg-white"
          }`}
          onClick={() => set({ is_featured: !form.is_featured })}
        >
          <Checkbox checked={form.is_featured} />
          <div>
            <p className="text-[12px] font-medium text-[#161D1F]">
              Featured Specialty
            </p>
            <p className="text-[10px] text-[#899193]">
              Highlighted on homepage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyTab;
