"use client";
import React from "react";
import { Plus, Loader2 } from "lucide-react";
import { ProcedureFormData, ServiceModalMode } from "../types/serviceTypes";
import {
  ImageUploadField,
  SymptomsInlineInput,
  Checkbox,
} from "./ServiceModalShared";

interface SavedProc extends ProcedureFormData {
  _saved?: boolean;
}

interface ProcedureTabProps {
  form: ProcedureFormData;
  onChange: (form: ProcedureFormData) => void;
  addedProcs: SavedProc[];
  mode: ServiceModalMode;
  loading: boolean;
  imageUploading: boolean;
  onFileSelect: (file: File) => void;
  onAdd: () => void;
  onAddNew: () => void;
}

const DURATION_FIELDS: {
  label: string;
  key: keyof ProcedureFormData;
  placeholder: string;
}[] = [
  {
    label: "Duration of Procedure (in Hrs.)",
    key: "procedure_duration",
    placeholder: "Select Time",
  },
  {
    label: "Expected Report (in Days)",
    key: "report_time",
    placeholder: "Report Delivery Time",
  },
  {
    label: "Stay in Hospital (in Days)",
    key: "stay_in_hospital",
    placeholder: "Select Days",
  },
  {
    label: "Recovery (in Days)",
    key: "recovery",
    placeholder: "Select Date Range",
  },
];

const ProcedureTab: React.FC<ProcedureTabProps> = ({
  form,
  onChange,
  addedProcs,
  mode,
  loading,
  imageUploading,
  onFileSelect,
  onAdd,
  onAddNew,
}) => {
  const set = (patch: Partial<ProcedureFormData>) =>
    onChange({ ...form, ...patch });

  return (
    <div className="space-y-4 pb-4 animate-fade-in">
      {addedProcs.map((proc, idx) => (
        <div
          key={idx}
          className="border border-[#34C759]/40 bg-green-50 rounded-lg px-4 py-3 flex items-center justify-between"
        >
          <div>
            <p className="text-[12px] font-medium text-[#161D1F]">
              {proc.name}
            </p>
            <p className="text-[10px] text-[#899193] mt-0.5">
              {proc.description}
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-[#34C759] text-white rounded-full">
            Saved
          </span>
        </div>
      ))}

      <div className="border border-dashed border-[#0088B1] rounded-lg p-4 space-y-3 bg-[#FFF2E5]">
        <p className="text-[12px] font-semibold text-[#0088B1]">
          Procedure {addedProcs.length + 1}
        </p>

        <ImageUploadField
          label="Procedure Image"
          value={form.image_url}
          uploading={imageUploading}
          onFileSelect={onFileSelect}
        />

        <p className="text-[12px] font-semibold text-[#161D1F]">
          Basic Information
        </p>

        <div>
          <label className="block text-[12px] text-[#161D1F] mb-1">
            * Procedure Title
          </label>
          <input
            type="text"
            placeholder="Please provide a suitable procedure title"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] bg-white"
          />
        </div>

        <div>
          <label className="block text-[12px] text-[#161D1F] mb-1">
            * Description
          </label>
          <textarea
            placeholder="Brief about the medical procedure"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] resize-none bg-white"
          />
        </div>

        <p className="text-[12px] font-semibold text-[#161D1F]">
          Pricing &amp; Report Details
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] text-[#161D1F] mb-1">
              * Estimated Price ₹ (Low End)
            </label>
            <input
              type="number"
              placeholder="Enter minimum amount"
              value={form.min_cost}
              onChange={(e) => set({ min_cost: e.target.value })}
              className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] bg-white"
            />
          </div>
          <div>
            <label className="block text-[12px] text-[#161D1F] mb-1">
              * Estimated Price ₹ (High End)
            </label>
            <input
              type="number"
              placeholder="Enter maximum amount"
              value={form.max_cost}
              onChange={(e) => set({ max_cost: e.target.value })}
              className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {DURATION_FIELDS.map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-[12px] text-[#161D1F] mb-1">
                * {label}
              </label>
              <input
                type="text"
                placeholder={placeholder}
                value={form[key] as string}
                onChange={(e) => set({ [key]: e.target.value })}
                className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] bg-white"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SymptomsInlineInput
            label="* Facilities Included"
            items={form.included}
            placeholder="Mention some facilities included along with the procedure"
            onAdd={(val) => set({ included: [...form.included, val] })}
            onRemove={(idx) =>
              set({ included: form.included.filter((_, i) => i !== idx) })
            }
          />
          <SymptomsInlineInput
            label="* Pre-Procedure Checklist"
            items={form.pre_procedure_instructions}
            placeholder="Specify some precautions to be followed by patients"
            onAdd={(val) =>
              set({
                pre_procedure_instructions: [
                  ...form.pre_procedure_instructions,
                  val,
                ],
              })
            }
            onRemove={(idx) =>
              set({
                pre_procedure_instructions:
                  form.pre_procedure_instructions.filter((_, i) => i !== idx),
              })
            }
          />
        </div>

        <div
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer bg-white ${
            form.is_active
              ? "border-[#0088B1] bg-[#E8F4F7]"
              : "border-[#E5E8E9]"
          }`}
          onClick={() => set({ is_active: !form.is_active })}
        >
          <Checkbox checked={form.is_active} />
          <div>
            <p className="text-[12px] font-medium text-[#161D1F]">
              Active Procedure
            </p>
            <p className="text-[10px] text-[#899193]">
              Inactive procedures would not be displayed at website
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAdd}
            disabled={loading || imageUploading}
            className="flex items-center gap-1.5 px-5 py-2 border border-[#0088B1] text-[#0088B1] text-[12px] rounded-lg hover:bg-[#E8F4F7] transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            Add
          </button>
        </div>
      </div>

      {mode === "add" && (
        <button
          type="button"
          onClick={onAddNew}
          disabled={loading || !form.name.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#0088B1] rounded-lg text-[12px] text-[#0088B1] hover:bg-[#E8F4F7] transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          Add New Procedure
        </button>
      )}
    </div>
  );
};

export default ProcedureTab;
