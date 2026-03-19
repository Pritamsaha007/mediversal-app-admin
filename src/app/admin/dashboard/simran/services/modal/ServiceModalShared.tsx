"use client";
import React, { useRef, useState } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";

// ─── Checkbox ─────────────────────────────────────────────────────────────────
export const Checkbox: React.FC<{ checked: boolean }> = ({ checked }) => (
  <div
    className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 ${
      checked ? "bg-[#0088B1] border-[#0088B1]" : "border-gray-300"
    }`}
  >
    {checked && (
      <svg
        className="w-3 h-3 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </svg>
    )}
  </div>
);

// ─── TagInputRow ──────────────────────────────────────────────────────────────
export const TagInputRow: React.FC<{
  label: string;
  items: string[];
  onAdd: (val: string) => void;
  onRemove: (idx: number) => void;
  placeholder?: string;
}> = ({ label, items, onAdd, onRemove, placeholder }) => {
  const [val, setVal] = useState("");
  return (
    <div>
      <label className="block text-[11px] text-[#161D1F] mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && val.trim()) {
              e.preventDefault();
              onAdd(val.trim());
              setVal("");
            }
          }}
          placeholder={placeholder || "Type and press Enter"}
          className="flex-1 px-3 py-2 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
        />
        <button
          type="button"
          onClick={() => {
            if (val.trim()) {
              onAdd(val.trim());
              setVal("");
            }
          }}
          className="px-3 py-2 text-[12px] bg-[#E8F4F7] text-[#0088B1] rounded-lg hover:bg-[#0088B1] hover:text-white transition-colors"
        >
          Add
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#E8F4F7] text-[#0088B1] rounded-full text-[11px]"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── SymptomsInlineInput ──────────────────────────────────────────────────────
export const SymptomsInlineInput: React.FC<{
  label?: string;
  items: string[];
  onAdd: (val: string) => void;
  onRemove: (idx: number) => void;
  placeholder?: string;
}> = ({ label, items, onAdd, onRemove, placeholder }) => {
  const [val, setVal] = useState("");
  return (
    <div>
      {label && (
        <label className="block text-[11px] text-[#161D1F] mb-1">{label}</label>
      )}
      <div className="relative border border-[#E5E8E9] rounded-lg bg-white min-h-[80px] p-3">
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && val.trim()) {
              e.preventDefault();
              onAdd(val.trim());
              setVal("");
            }
          }}
          placeholder={placeholder || "Type and press Enter or click Add"}
          rows={2}
          className="w-full text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none resize-none bg-transparent pr-10"
        />
        <button
          type="button"
          onClick={() => {
            if (val.trim()) {
              onAdd(val.trim());
              setVal("");
            }
          }}
          className="absolute top-3 right-3 text-[12px] text-[#0088B1] font-medium hover:underline"
        >
          Add
        </button>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {items.map((item, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-[#E8F4F7] text-[#0088B1] rounded-full text-[11px]"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ImageUploadField: React.FC<{
  value: string;
  uploading: boolean;
  onFileSelect: (file: File) => void;
  label?: string;
}> = ({ value, uploading, onFileSelect, label = "Cover Image" }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-[11px] text-[#161D1F] mb-1">* {label}</label>
      <div
        className="border-2 border-dashed border-[#E5E8E9] rounded-lg p-5 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#0088B1] transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-[#0088B1] animate-spin" />
        ) : value ? (
          <>
            <img
              src={value}
              alt="preview"
              className="h-14 w-auto object-contain"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <p className="text-[10px] text-[#899193] mt-1">Click to change</p>
          </>
        ) : (
          <>
            <ImagePlus className="w-7 h-7 text-[#899193]" />
            <p className="text-[11px] font-medium text-[#161D1F]">
              Upload Image
            </p>
            <p className="text-[10px] text-[#899193]">
              Drag and drop or click to browse
            </p>
            <p className="text-[10px] text-[#899193]">
              (supported: .jpg, .jpeg, .png)
            </p>
            <button
              type="button"
              className="mt-1 px-3 py-1 border border-gray-300 rounded text-[11px] text-[#161D1F] hover:bg-gray-50"
            >
              Select File
            </button>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
      </div>
    </div>
  );
};
