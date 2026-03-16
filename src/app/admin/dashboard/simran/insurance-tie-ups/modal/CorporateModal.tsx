import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CorporateTieUp, CorporateFormData, ModalMode } from "../types/types";
import { EnumItem } from "../services/insuranceCorporateService";
import LogoUpload from "../components/LogoUpload";

interface CorporateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  initialData?: CorporateTieUp;
  onSubmit: (data: CorporateFormData) => void;
  sectorEnums: EnumItem[];
}

const CorporateModal: React.FC<CorporateModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  sectorEnums,
}) => {
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setCompanyName(initialData.companyName);
        const match = sectorEnums.find((e) => e.value === initialData.sector);
        setSector(match?.id || initialData.sector);
        setLogo(initialData.logo);
        setActive(initialData.active);
      } else {
        setCompanyName("");
        setSector("");
        setLogo(undefined);
        setActive(true);
      }
    }
  }, [isOpen, mode, initialData, sectorEnums]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !sector) return;
    setSubmitting(true);
    try {
      await onSubmit({ companyName: companyName.trim(), sector, logo, active });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#899193] hover:text-[#161D1F] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-[16px] font-semibold text-[#161D1F] mb-5">
          {mode === "add" ? "Add Corporate Tie-Up" : "Edit Corporate Tie-Up"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#161D1F] mb-1">
              * Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[12px] text-[#161D1F] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#161D1F] mb-1">
              * Sector
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[12px] text-[#161D1F] focus:outline-none focus:ring-1 focus:ring-[#0088B1] bg-white"
            >
              <option value="">Select sector</option>
              {sectorEnums.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          <LogoUpload
            currentLogo={logo}
            onFileSelect={(_file, previewUrl) => setLogo(previewUrl)}
            label="Upload Company Logo"
          />

          <div className="flex items-center gap-3">
            <label className="text-[12px] font-medium text-[#161D1F]">
              Status
            </label>
            <button
              type="button"
              onClick={() => setActive((v) => !v)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                active ? "bg-[#0088B1]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  active ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-[12px] text-[#899193]">
              {active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[12px] border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-[12px] bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors disabled:opacity-60"
            >
              {submitting ? "Saving..." : mode === "add" ? "Add" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CorporateModal;
