import React, { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import {
  CorporateFormData,
  CorporateTieUp,
  ModalMode,
  SECTOR_OPTIONS,
} from "../types/types";
import LogoUpload from "../components/LogoUpload";

interface CorporateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  initialData?: CorporateTieUp;
  onSubmit: (data: CorporateFormData) => void;
}

const CorporateModal: React.FC<CorporateModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CorporateFormData>({
    companyName: "",
    sector: "",
    logo: undefined,
    logoFile: undefined,
    active: false,
  });
  const [sectorOpen, setSectorOpen] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        companyName: initialData.companyName,
        sector: initialData.sector,
        logo: initialData.logo,
        logoFile: undefined,
        active: initialData.active,
      });
    } else {
      setFormData({
        companyName: "",
        sector: "",
        logo: undefined,
        logoFile: undefined,
        active: false,
      });
    }
  }, [mode, initialData, isOpen]);

  const handleReset = () => {
    if (mode === "edit" && initialData) {
      setFormData({
        companyName: initialData.companyName,
        sector: initialData.sector,
        logo: initialData.logo,
        logoFile: undefined,
        active: initialData.active,
      });
    } else {
      setFormData({
        companyName: "",
        sector: "",
        logo: undefined,
        logoFile: undefined,
        active: false,
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.companyName.trim() || !formData.sector) return;
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            {mode === "add"
              ? "Add New Corporate Tie-Up"
              : "Update Corporate Tie-Up:"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#899193] hover:text-[#161D1F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-[11px] text-[#161D1F] mb-1.5">
              * Company Name
            </label>
            <input
              type="text"
              placeholder="Enter Company Name"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
            />
          </div>
          <div className="flex-1 relative">
            <label className="block text-[11px] text-[#161D1F] mb-1.5">
              * Sector
            </label>
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] focus:outline-none focus:border-[#0088B1] hover:border-[#0088B1]"
              onClick={() => setSectorOpen(!sectorOpen)}
            >
              <span
                className={
                  formData.sector ? "text-[#161D1F]" : "text-[#B0B6B8]"
                }
              >
                {formData.sector || "Select Industry Category"}
              </span>
              <ChevronDown className="w-4 h-4 text-[#899193]" />
            </button>
            {sectorOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-[#E5E8E9] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {SECTOR_OPTIONS.map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    className="block w-full text-left px-3 py-2 text-[12px] text-[#161D1F] hover:bg-[#E8F4F7]"
                    onClick={() => {
                      setFormData({ ...formData, sector });
                      setSectorOpen(false);
                    }}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <LogoUpload
            currentLogo={formData.logo}
            label="Upload Company Logo"
            onFileSelect={(file, url) =>
              setFormData({ ...formData, logoFile: file, logo: url })
            }
          />
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
            className={`w-4 h-4 rounded flex items-center justify-center border ${
              formData.active
                ? "bg-[#0088B1] border-[#0088B1]"
                : "border-gray-300"
            }`}
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
              Active Corporate
            </p>
            <p className="text-[10px] text-[#899193]">
              Inactive corporates would not be displayed at website
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
            className="px-5 py-2 bg-[#0088B1] text-white text-[12px] rounded-lg hover:bg-[#00729A] transition-colors"
          >
            {mode === "add" ? "Add Company" : "Update Company"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorporateModal;
