"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
  ServiceAPI,
  DepartmentAPI,
  ProcedureAPI,
  ServiceFormData,
  DepartmentFormData,
  ProcedureFormData,
  ServiceModalTab,
  ServiceModalMode,
  CreateUpdateServicePayload,
  CreateUpdateDepartmentPayload,
  CreateUpdateProcedurePayload,
} from "../types/serviceTypes";
import {
  createOrUpdateService,
  createOrUpdateDepartment,
  createOrUpdateProcedure,
  uploadServiceImage,
} from "../service/serviceApi";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import SpecialtyTab from "./SpecialtyTab";
import SubDepartmentTab from "./SubDepartmentTab";
import ProcedureTab from "./ProcedureTab";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ServiceModalMode;
  /** Determines which form to show — always fixed, no wizard navigation */
  initialTab: ServiceModalTab;
  initialService?: ServiceAPI;
  initialDepartment?: DepartmentAPI;
  initialProcedure?: ProcedureAPI;
  contextServiceId?: string;
  contextDepartmentId?: string;
  contextServiceName?: string;
  contextDepartmentName?: string;
  onSuccess: () => void;
}

const defaultServiceForm = (): ServiceFormData => ({
  name: "",
  image_url: "",
  description: "",
  tags: [],
  is_active: true,
  is_featured: false,
});

const defaultDepartmentForm = (): DepartmentFormData => ({
  name: "",
  description: "",
  symptoms: [],
  is_active: true,
});

const defaultProcedureForm = (): ProcedureFormData => ({
  name: "",
  image_url: "",
  description: "",
  included: [],
  min_cost: "",
  max_cost: "",
  procedure_duration: "",
  report_time: "",
  stay_in_hospital: "",
  recovery: "",
  procedure_inclusions: [],
  pre_procedure_instructions: [],
  is_active: true,
});

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialTab,
  initialService,
  initialDepartment,
  initialProcedure,
  contextServiceId,
  contextDepartmentId,
  contextServiceName,
  contextDepartmentName,
  onSuccess,
}) => {
  const { token } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [serviceForm, setServiceForm] =
    useState<ServiceFormData>(defaultServiceForm());
  const serviceIdRef = useRef<string>(contextServiceId || "");
  const setServiceId = (id: string) => {
    serviceIdRef.current = id;
  };

  if (contextServiceId && !serviceIdRef.current) {
    serviceIdRef.current = contextServiceId;
  }

  const [deptForm, setDeptForm] = useState<DepartmentFormData>(
    defaultDepartmentForm(),
  );
  const [procForm, setProcForm] = useState<ProcedureFormData>(
    defaultProcedureForm(),
  );

  // Populate forms when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (contextServiceId) setServiceId(contextServiceId);
    else setServiceId("");

    if (mode === "edit") {
      if (initialService) {
        setServiceId(initialService.id);
        setServiceForm({
          name: initialService.name,
          image_url: initialService.image_url,
          description: initialService.description,
          tags: initialService.tags || [],
          is_active: initialService.is_active,
          is_featured: initialService.is_featured,
        });
      }
      if (initialDepartment) {
        setServiceId(initialDepartment.simran_healthcare_service_id);
        setDeptForm({
          name: initialDepartment.name,
          description: initialDepartment.description,
          symptoms: initialDepartment.symptoms || [],
          is_active: initialDepartment.is_active,
        });
      }
      if (initialProcedure) {
        setServiceId(initialProcedure.simran_healthcare_service_id);
        setProcForm({
          name: initialProcedure.name,
          image_url: initialProcedure.image_url,
          description: initialProcedure.description,
          included: initialProcedure.included || [],
          min_cost: initialProcedure.min_cost,
          max_cost: initialProcedure.max_cost,
          procedure_duration: initialProcedure.procedure_duration,
          report_time: initialProcedure.report_time,
          stay_in_hospital: initialProcedure.stay_in_hospital,
          recovery: initialProcedure.recovery,
          procedure_inclusions: initialProcedure.procedure_inclusions || [],
          pre_procedure_instructions:
            initialProcedure.pre_procedure_instructions || [],
          is_active: initialProcedure.is_active,
        });
      }
    } else {
      setServiceForm(defaultServiceForm());
      setDeptForm(defaultDepartmentForm());
      setProcForm(defaultProcedureForm());
    }
  }, [
    isOpen,
    mode,
    initialService,
    initialDepartment,
    initialProcedure,
    contextServiceId,
  ]);

  if (!isOpen) return null;

  // ─── Modal title ──────────────────────────────────────────────────────────
  const getTitle = () => {
    if (mode === "edit") {
      if (initialTab === "specialty")
        return `Edit Specialty: ${initialService?.name || ""}`;
      if (initialTab === "sub-department")
        return `Edit Sub-Department: ${initialDepartment?.name || ""}`;
      if (initialTab === "procedure")
        return `Edit Procedure: ${initialProcedure?.name || ""}`;
    }
    if (initialTab === "specialty") return "Add New Specialty";
    if (initialTab === "sub-department") {
      const parent = contextServiceName;
      return parent
        ? `Add Sub-Department under ${parent}`
        : "Add Sub-Department";
    }
    if (initialTab === "procedure") {
      const parent = contextDepartmentName;
      return parent ? `Add Procedure under ${parent}` : "Add Procedure";
    }
    return "";
  };

  const getSubtitle = () => {
    if (mode === "add") {
      if (initialTab === "sub-department" && contextServiceName) {
        return { label: "Specialty", value: contextServiceName };
      }
      if (initialTab === "procedure" && contextDepartmentName) {
        return { label: "Sub-Department", value: contextDepartmentName };
      }
    }
    return null;
  };

  const subtitle = getSubtitle();

  // ─── Image upload ─────────────────────────────────────────────────────────
  const handleImageUpload = async (
    file: File,
    target: "service" | "procedure",
  ) => {
    if (!token) return;
    setImageUploading(true);
    try {
      const folder =
        target === "service" ? "healthcare/services" : "healthcare/procedures";
      const url = await uploadServiceImage(token, file, folder);
      if (target === "service")
        setServiceForm((p) => ({ ...p, image_url: url }));
      else setProcForm((p) => ({ ...p, image_url: url }));
    } catch (err: any) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  // ─── Submit: Specialty ────────────────────────────────────────────────────
  const handleSubmitService = async () => {
    if (!token) return;
    if (!serviceForm.name.trim()) {
      toast.error("Please provide a specialty title");
      return;
    }
    setLoading(true);
    try {
      const payload: CreateUpdateServicePayload = {
        ...(mode === "edit" && initialService ? { id: initialService.id } : {}),
        name: serviceForm.name,
        image_url: serviceForm.image_url,
        description: serviceForm.description,
        tags: serviceForm.tags,
        is_active: serviceForm.is_active,
        is_featured: serviceForm.is_featured,
        is_deleted: false,
      };
      await createOrUpdateService(payload, token);
      toast.success(mode === "edit" ? "Specialty updated" : "Specialty added!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save specialty");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDepartment = async () => {
    if (!token) return;
    const serviceId =
      mode === "edit"
        ? initialDepartment?.simran_healthcare_service_id ||
          serviceIdRef.current
        : serviceIdRef.current;
    if (!serviceId) {
      toast.error("Service context missing");
      return;
    }
    if (!deptForm.name.trim()) {
      toast.error("Please provide a sub-department title");
      return;
    }
    setLoading(true);
    try {
      const payload: CreateUpdateDepartmentPayload = {
        ...(mode === "edit" && initialDepartment
          ? { id: initialDepartment.id }
          : {}),
        simran_healthcare_service_id: serviceId,
        name: deptForm.name,
        description: deptForm.description,
        symptoms: deptForm.symptoms,
        is_active: deptForm.is_active,
        is_deleted: false,
      };
      await createOrUpdateDepartment(payload, token);
      toast.success(
        mode === "edit" ? "Sub-department updated" : "Sub-department added!",
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save sub-department");
    } finally {
      setLoading(false);
    }
  };

  // ─── Submit: Procedure ────────────────────────────────────────────────────
  const handleSubmitProcedure = async () => {
    if (!token) return;
    const serviceId =
      mode === "edit"
        ? initialProcedure?.simran_healthcare_service_id || serviceIdRef.current
        : serviceIdRef.current;
    const deptId =
      mode === "edit"
        ? initialProcedure?.simran_healthcare_department_id ||
          contextDepartmentId ||
          ""
        : contextDepartmentId || "";
    if (!serviceId) {
      toast.error("Service context missing");
      return;
    }
    if (!procForm.name.trim()) {
      toast.error("Please provide a procedure title");
      return;
    }
    setLoading(true);
    try {
      const payload: CreateUpdateProcedurePayload = {
        ...(mode === "edit" && initialProcedure
          ? { id: initialProcedure.id }
          : {}),
        simran_healthcare_service_id: serviceId,
        simran_healthcare_department_id: deptId,
        name: procForm.name,
        image_url: procForm.image_url,
        description: procForm.description,
        included: procForm.included,
        min_cost: Number(procForm.min_cost) || 0,
        max_cost: Number(procForm.max_cost) || 0,
        procedure_duration: procForm.procedure_duration,
        report_time: procForm.report_time,
        stay_in_hospital: procForm.stay_in_hospital,
        recovery: procForm.recovery,
        procedure_inclusions: procForm.procedure_inclusions,
        pre_procedure_instructions: procForm.pre_procedure_instructions,
        is_active: procForm.is_active,
        is_deleted: false,
      };
      await createOrUpdateProcedure(payload, token);
      toast.success(mode === "edit" ? "Procedure updated" : "Procedure added!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save procedure");
    } finally {
      setLoading(false);
    }
  };

  // ─── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    if (mode === "edit") {
      if (initialTab === "specialty" && initialService) {
        setServiceForm({
          name: initialService.name,
          image_url: initialService.image_url,
          description: initialService.description,
          tags: initialService.tags || [],
          is_active: initialService.is_active,
          is_featured: initialService.is_featured,
        });
      } else if (initialTab === "sub-department" && initialDepartment) {
        setDeptForm({
          name: initialDepartment.name,
          description: initialDepartment.description,
          symptoms: initialDepartment.symptoms || [],
          is_active: initialDepartment.is_active,
        });
      } else if (initialTab === "procedure" && initialProcedure) {
        setProcForm({
          name: initialProcedure.name,
          image_url: initialProcedure.image_url,
          description: initialProcedure.description,
          included: initialProcedure.included || [],
          min_cost: initialProcedure.min_cost,
          max_cost: initialProcedure.max_cost,
          procedure_duration: initialProcedure.procedure_duration,
          report_time: initialProcedure.report_time,
          stay_in_hospital: initialProcedure.stay_in_hospital,
          recovery: initialProcedure.recovery,
          procedure_inclusions: initialProcedure.procedure_inclusions || [],
          pre_procedure_instructions:
            initialProcedure.pre_procedure_instructions || [],
          is_active: initialProcedure.is_active,
        });
      }
    } else {
      setServiceForm(defaultServiceForm());
      setDeptForm(defaultDepartmentForm());
      setProcForm(defaultProcedureForm());
    }
  };

  const primaryLabel =
    mode === "edit"
      ? initialTab === "specialty"
        ? "Update Specialty"
        : initialTab === "sub-department"
          ? "Update Sub-Department"
          : "Update Procedure"
      : initialTab === "specialty"
        ? "Add Specialty"
        : initialTab === "sub-department"
          ? "Add Sub-Department"
          : "Add Procedure";

  const handlePrimary = () => {
    if (initialTab === "specialty") handleSubmitService();
    else if (initialTab === "sub-department") handleSubmitDepartment();
    else handleSubmitProcedure();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[92vh]">
        {/* Header — no tabs ever */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 flex-shrink-0 border-b border-[#E5E8E9]">
          <div>
            <h2 className="text-[15px] font-semibold text-[#161D1F]">
              {getTitle()}
            </h2>
            {subtitle && (
              <p className="text-[11px] text-[#899193] mt-0.5">
                {subtitle.label}:{" "}
                <span className="font-medium text-[#0088B1]">
                  {subtitle.value}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#899193] hover:text-[#161D1F] hover:bg-gray-100 rounded-lg transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body — only the relevant form, no tab strip */}
        <div className="overflow-y-auto flex-1 px-6 pt-4">
          {initialTab === "specialty" && (
            <SpecialtyTab
              form={serviceForm}
              onChange={setServiceForm}
              imageUploading={imageUploading}
              onFileSelect={(file) => handleImageUpload(file, "service")}
            />
          )}
          {initialTab === "sub-department" && (
            <SubDepartmentTab
              specialtyName={contextServiceName || ""}
              form={deptForm}
              onChange={setDeptForm}
              addedDepts={[]}
              mode={mode}
              loading={loading}
              onAdd={handleSubmitDepartment}
              onAddNew={() => {}}
            />
          )}
          {initialTab === "procedure" && (
            <ProcedureTab
              form={procForm}
              onChange={setProcForm}
              addedProcs={[]}
              mode={mode}
              loading={loading}
              imageUploading={imageUploading}
              onFileSelect={(file) => handleImageUpload(file, "procedure")}
              onAdd={handleSubmitProcedure}
              onAddNew={() => {}}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E8E9] flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleReset}
            disabled={loading}
            className="text-[12px] text-[#899193] hover:text-[#161D1F] hover:underline transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-[#E5E8E9] text-[12px] text-[#161D1F] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrimary}
            disabled={loading || imageUploading}
            className="flex items-center gap-2 px-5 py-2 bg-[#0088B1] text-white text-[12px] rounded-lg hover:bg-[#00729A] transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
