"use client";
import React from "react";
import { Plus, Loader2 } from "lucide-react";
import { DepartmentFormData, ServiceModalMode } from "../types/serviceTypes";
import { SymptomsInlineInput, Checkbox } from "./ServiceModalShared";

interface SavedDept extends DepartmentFormData {
  _saved?: boolean;
}

interface SubDepartmentTabProps {
  specialtyName: string;
  form: DepartmentFormData;
  onChange: (form: DepartmentFormData) => void;
  addedDepts: SavedDept[];
  mode: ServiceModalMode;
  loading: boolean;
  onAdd: () => void;
  onAddNew: () => void;
}

const SubDepartmentTab: React.FC<SubDepartmentTabProps> = ({
  specialtyName,
  form,
  onChange,
  addedDepts,
  mode,
  loading,
  onAdd,
  onAddNew,
}) => {
  const set = (patch: Partial<DepartmentFormData>) =>
    onChange({ ...form, ...patch });

  return (
    <div className="space-y-4 pb-4">
      {/* Specialty name chip */}
      {specialtyName && (
        <div>
          <p className="text-[10px] text-[#899193] mb-1">* Speciality</p>
          <div className="px-3 py-2.5 bg-[#E8F4F7] rounded-lg text-[12px] text-[#0088B1] font-medium">
            {specialtyName}
          </div>
        </div>
      )}

      {/* Already-saved departments */}
      {addedDepts.map((dept, idx) => (
        <div
          key={idx}
          className="border border-[#34C759]/40 bg-green-50 rounded-lg px-4 py-3 flex items-center justify-between"
        >
          <div>
            <p className="text-[12px] font-medium text-[#161D1F]">
              {dept.name}
            </p>
            <p className="text-[10px] text-[#899193] mt-0.5">
              {dept.description}
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-[#34C759] text-white rounded-full">
            Saved
          </span>
        </div>
      ))}

      {/* Current draft card */}
      <div className="border border-dashed border-[#0088B1] rounded-lg p-4 space-y-3 bg-[#FEFAF4]">
        <p className="text-[12px] font-semibold text-[#0088B1]">
          Sub Department {addedDepts.length + 1}
        </p>

        <div>
          <label className="block text-[11px] text-[#161D1F] mb-1">
            * Title
          </label>
          <input
            type="text"
            placeholder="Please provide a suitable sub-department title"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#161D1F] mb-1">
            * Description
          </label>
          <textarea
            placeholder="Brief about the title"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] resize-none bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#161D1F] mb-1">
            * Symptoms
          </label>
          <SymptomsInlineInput
            items={form.symptoms}
            onAdd={(val) => set({ symptoms: [...form.symptoms, val] })}
            onRemove={(idx) =>
              set({ symptoms: form.symptoms.filter((_, i) => i !== idx) })
            }
            placeholder="Specify some warning signs related to the sub department"
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
              Active Sub-Department
            </p>
            <p className="text-[10px] text-[#899193]">
              Inactive sub-department would not be displayed at website
            </p>
          </div>
        </div>

        {/* Add button inside card */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAdd}
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 border border-[#0088B1] text-[#0088B1] text-[12px] rounded-lg hover:bg-[#E8F4F7] transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            Add
          </button>
        </div>
      </div>

      {/* Add a new sub-department button (add mode only) */}
      {mode === "add" && (
        <button
          type="button"
          onClick={onAddNew}
          disabled={loading || !form.name.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#0088B1] rounded-lg text-[12px] text-[#0088B1] hover:bg-[#E8F4F7] transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          Add a new Sub-Department
        </button>
      )}
    </div>
  );
};

export default SubDepartmentTab;
