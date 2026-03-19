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
  initialTab?: ServiceModalTab;
  initialService?: ServiceAPI;
  initialDepartment?: DepartmentAPI;
  initialProcedure?: ProcedureAPI;
  contextServiceId?: string;
  contextDepartmentId?: string;
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

const TABS: { id: ServiceModalTab; label: string }[] = [
  { id: "specialty", label: "Specialty" },
  { id: "sub-department", label: "Sub-Departments" },
  { id: "procedure", label: "Procedures" },
];

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialTab = "specialty",
  initialService,
  initialDepartment,
  initialProcedure,
  contextServiceId,
  contextDepartmentId,
  onSuccess,
}) => {
  const { token } = useAdminStore();
  const [activeTab, setActiveTab] = useState<ServiceModalTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [serviceForm, setServiceForm] =
    useState<ServiceFormData>(defaultServiceForm());
  const [savedServiceName, setSavedServiceName] = useState("");
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
  const [addedDepts, setAddedDepts] = useState<
    Array<DepartmentFormData & { _saved?: boolean }>
  >([]);

  const [procForm, setProcForm] = useState<ProcedureFormData>(
    defaultProcedureForm(),
  );
  const [addedProcs, setAddedProcs] = useState<
    Array<ProcedureFormData & { _saved?: boolean }>
  >([]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
    setAddedDepts([]);
    setAddedProcs([]);
    if (contextServiceId) setServiceId(contextServiceId);
    else setServiceId("");
    setSavedServiceName("");

    if (mode === "edit") {
      if (initialService) {
        setSavedServiceName(initialService.name);
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
    initialTab,
    contextServiceId,
  ]);

  if (!isOpen) return null;

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
      const res: any = await createOrUpdateService(payload, token);
      const newId =
        res?.id ||
        res?.data?.id ||
        res?.service?.id ||
        res?.result?.id ||
        initialService?.id ||
        "";
      setServiceId(newId);
      setSavedServiceName(serviceForm.name);
      toast.success(
        mode === "add"
          ? "Specialty added! Now add sub-departments."
          : "Service updated",
      );
      if (mode === "add") setActiveTab("sub-department");
      else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!token) return;
    // Read from ref — always the latest, no React batching delay
    const serviceId =
      mode === "edit"
        ? initialDepartment?.simran_healthcare_service_id ||
          serviceIdRef.current
        : serviceIdRef.current;
    if (!serviceId) {
      toast.error("Please complete the Specialty step first");
      return;
    }
    if (!deptForm.name.trim()) {
      toast.error("Please provide a department title");
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
        mode === "edit" ? "Department updated" : "Sub-Department added!",
      );
      if (mode === "edit") {
        onSuccess();
        onClose();
      } else {
        setAddedDepts((prev) => [...prev, { ...deptForm, _saved: true }]);
        setDeptForm(defaultDepartmentForm());
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save department");
    } finally {
      setLoading(false);
    }
  };

  const handleDeptNext = async () => {
    if (deptForm.name.trim()) await handleAddDepartment();
    setActiveTab("procedure");
  };

  const handleAddProcedure = async () => {
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
      toast.error("Please complete the Specialty step first");
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
      if (mode === "edit") {
        onSuccess();
        onClose();
      } else {
        setAddedProcs((prev) => [...prev, { ...procForm, _saved: true }]);
        setProcForm(defaultProcedureForm());
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save procedure");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async () => {
    if (procForm.name.trim()) await handleAddProcedure();
    onSuccess();
    onClose();
  };

  const handleReset = () => {
    if (mode === "edit") {
      if (activeTab === "specialty" && initialService) {
        setServiceForm({
          name: initialService.name,
          image_url: initialService.image_url,
          description: initialService.description,
          tags: initialService.tags || [],
          is_active: initialService.is_active,
          is_featured: initialService.is_featured,
        });
      } else if (activeTab === "sub-department" && initialDepartment) {
        setDeptForm({
          name: initialDepartment.name,
          description: initialDepartment.description,
          symptoms: initialDepartment.symptoms || [],
          is_active: initialDepartment.is_active,
        });
      } else if (activeTab === "procedure" && initialProcedure) {
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
      ? activeTab === "specialty"
        ? "Update Specialty"
        : activeTab === "sub-department"
          ? "Update Sub-Department"
          : "Update Procedure"
      : activeTab === "specialty"
        ? "Add Specialty"
        : activeTab === "sub-department"
          ? "Next"
          : "Done";

  const handleFooterAction = () => {
    if (activeTab === "specialty") handleSubmitService();
    else if (activeTab === "sub-department")
      mode === "edit" ? handleAddDepartment() : handleDeptNext();
    else mode === "edit" ? handleAddProcedure() : handleDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            {mode === "edit" ? "Edit" : "Add New Service"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#899193] hover:text-[#161D1F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex mx-6 mb-4 rounded-lg overflow-hidden border border-[#E5E8E9] flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-2 text-[12px] font-medium transition-colors ${activeTab === tab.id ? "bg-[#0088B1] text-white" : "bg-white text-[#899193] hover:bg-gray-50"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-6">
          {activeTab === "specialty" && (
            <SpecialtyTab
              form={serviceForm}
              onChange={setServiceForm}
              imageUploading={imageUploading}
              onFileSelect={(file) => handleImageUpload(file, "service")}
            />
          )}
          {activeTab === "sub-department" && (
            <SubDepartmentTab
              specialtyName={savedServiceName || serviceForm.name}
              form={deptForm}
              onChange={setDeptForm}
              addedDepts={addedDepts}
              mode={mode}
              loading={loading}
              onAdd={handleAddDepartment}
              onAddNew={handleAddDepartment}
            />
          )}
          {activeTab === "procedure" && (
            <ProcedureTab
              form={procForm}
              onChange={setProcForm}
              addedProcs={addedProcs}
              mode={mode}
              loading={loading}
              imageUploading={imageUploading}
              onFileSelect={(file) => handleImageUpload(file, "procedure")}
              onAdd={handleAddProcedure}
              onAddNew={handleAddProcedure}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E5E8E9] flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleReset}
            disabled={loading}
            className="text-[12px] text-[#161D1F] hover:underline"
          >
            Reset
          </button>
          <button
            onClick={handleFooterAction}
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
