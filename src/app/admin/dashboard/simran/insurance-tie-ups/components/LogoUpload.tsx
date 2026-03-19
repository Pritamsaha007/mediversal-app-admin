import React, { useRef, useState, useEffect } from "react";
import { ImagePlus } from "lucide-react";

interface LogoUploadProps {
  currentLogo?: string;
  onFileSelect: (file: File, previewUrl: string) => void;
  label: string;
}

const LogoUpload: React.FC<LogoUploadProps> = ({
  currentLogo,
  onFileSelect,
  label,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(currentLogo);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  useEffect(() => {
    setPreview(currentLogo);
    setFileName(undefined);
  }, [currentLogo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
    onFileSelect(file, url);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
    onFileSelect(file, url);
  };

  return (
    <div
      className="border-2 border-dashed border-[#E5E8E9] rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#0088B1] transition-colors"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {preview ? (
        <>
          <img
            src={preview}
            alt="logo preview"
            className="h-16 w-auto object-contain"
          />
          <p className="text-[12px] text-[#161D1F] font-medium">
            {fileName || "Current Logo"}
          </p>
          <p className="text-[10px] text-[#899193]">
            Drag and drop your new image here or click to browse
          </p>
          <p className="text-[10px] text-[#899193]">
            (supported file format .jpg, .jpeg, .png)
          </p>
          <button
            type="button"
            className="mt-1 px-4 py-1.5 border border-gray-300 rounded text-[12px] text-[#161D1F] hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Upload a New File
          </button>
        </>
      ) : (
        <>
          <ImagePlus className="w-8 h-8 text-[#899193]" />
          <p className="text-[12px] font-medium text-[#161D1F]">* {label}</p>
          <p className="text-[10px] text-[#899193]">
            Drag and drop your new image here or click to browse
          </p>
          <p className="text-[10px] text-[#899193]">
            (supported file format .jpg, .jpeg, .png)
          </p>
          <button
            type="button"
            className="mt-1 px-4 py-1.5 border border-gray-300 rounded text-[12px] text-[#161D1F] hover:bg-gray-50"
          >
            Select File
          </button>
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default LogoUpload;
