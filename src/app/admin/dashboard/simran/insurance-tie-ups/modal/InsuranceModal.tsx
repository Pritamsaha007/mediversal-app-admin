import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { InsuranceFormData, InsurancePartner, ModalMode } from "../types/types";
import LogoUpload from "../components/LogoUpload";
import { uploadFile } from "@/app/admin/dashboard/lab_tests/services";
import { fileToBase64 } from "@/app/utils/functions";
import { useAdminStore } from "@/app/store/adminStore";

const FOLDER_PATH = "simran/insurance-partners/logos";

const getBucketName = (): string => {
  const bucket =
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_DEV
      : process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_PROD;
  if (!bucket) throw new Error("AWS bucket name not configured");
  return bucket;
};

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  initialData?: InsurancePartner;
  onSubmit: (data: InsuranceFormData) => void;
}

const InsuranceModal: React.FC<InsuranceModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
}) => {
  const { token } = useAdminStore();

  const [formData, setFormData] = useState<InsuranceFormData>({
    name: "",
    logo: undefined,
    logoFile: undefined,
    active: false,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        logo: initialData.logo,
        logoFile: undefined,
        active: initialData.active,
      });
    } else {
      setFormData({
        name: "",
        logo: undefined,
        logoFile: undefined,
        active: false,
      });
    }
    setUploadError(null);
  }, [mode, initialData, isOpen]);

  const handleReset = () => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        logo: initialData.logo,
        logoFile: undefined,
        active: initialData.active,
      });
    } else {
      setFormData({
        name: "",
        logo: undefined,
        logoFile: undefined,
        active: false,
      });
    }
    setUploadError(null);
  };

  const handleFileSelect = async (file: File, _previewUrl: string) => {
    setUploadError(null);
    setUploading(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      const base64 = await fileToBase64(objectUrl);
      URL.revokeObjectURL(objectUrl);

      const res = await uploadFile(token, {
        bucketName: getBucketName(),
        folderPath: FOLDER_PATH,
        fileName: `insurance-logo-${Date.now()}-${file.name}`,
        fileContent: base64,
      });

      if (!res.success) throw new Error("Upload failed");
      setFormData((prev) => ({ ...prev, logo: res.result, logoFile: file }));
    } catch (err: any) {
      setUploadError(err?.message || "Image upload failed");
      setFormData((prev) => ({
        ...prev,
        logo: undefined,
        logoFile: undefined,
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || uploading) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            {mode === "add"
              ? "Add New Insurance Partner"
              : "Update Insurance Partner:"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#899193] hover:text-[#161D1F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] text-[#161D1F] mb-1.5">
            * Insurance Partner Name
          </label>
          <input
            type="text"
            placeholder="Please enter your insurance partner"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
          />
        </div>

        <div className="mb-4">
          <LogoUpload
            currentLogo={formData.logo}
            label="Upload Insurance Partner Logo"
            onFileSelect={handleFileSelect}
          />
          {uploading && (
            <div className="mt-2 flex items-center gap-2 text-[12px] text-[#0088B1]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading logo…
            </div>
          )}
          {uploadError && (
            <p className="mt-1 text-[11px] text-red-500">{uploadError}</p>
          )}
        </div>

        <div
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer mb-5 ${
            formData.active
              ? "border-[#0088B1] bg-[#E8F4F7]"
              : "border-[#E5E8E9] bg-white"
          }`}
          onClick={() => setFormData({ ...formData, active: !formData.active })}
        >
          <div
            className={`w-4 h-4 rounded flex items-center justify-center border ${formData.active ? "bg-[#0088B1] border-[#0088B1]" : "border-gray-300"}`}
          >
            {formData.active && (
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
          <div>
            <p className="text-[12px] font-medium text-[#161D1F]">
              Active Insurance
            </p>
            <p className="text-[10px] text-[#899193]">
              Inactive insurance would not be displayed at website
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleReset}
            className="text-[12px] text-[#161D1F] hover:underline"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || submitting}
            className="px-5 py-2 bg-[#0088B1] text-white text-[12px] rounded-lg hover:bg-[#00729A] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {(uploading || submitting) && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {uploading
              ? "Uploading..."
              : submitting
                ? "Saving..."
                : mode === "add"
                  ? "Add Insurance"
                  : "Update Insurance"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceModal;
