import { create } from "zustand";
import { ServiceAPI, DepartmentAPI } from "../types/serviceTypes";

interface ServiceStore {
  viewLevel: "services" | "departments" | "procedures";
  selectedService: ServiceAPI | null;
  selectedDepartment: DepartmentAPI | null;

  serviceRefreshKey: number;
  departmentRefreshKey: number;
  procedureRefreshKey: number;

  navigateToServices: () => void;
  navigateToDepartments: (service: ServiceAPI) => void;
  navigateToProcedures: (dept: DepartmentAPI) => void;
  triggerServiceRefresh: () => void;
  triggerDepartmentRefresh: () => void;
  triggerProcedureRefresh: () => void;
}

export const useServiceStore = create<ServiceStore>((set) => ({
  viewLevel: "services",
  selectedService: null,
  selectedDepartment: null,
  serviceRefreshKey: 0,
  departmentRefreshKey: 0,
  procedureRefreshKey: 0,

  navigateToServices: () =>
    set({
      viewLevel: "services",
      selectedService: null,
      selectedDepartment: null,
    }),

  navigateToDepartments: (service) =>
    set({
      viewLevel: "departments",
      selectedService: service,
      selectedDepartment: null,
    }),

  navigateToProcedures: (dept) =>
    set({ viewLevel: "procedures", selectedDepartment: dept }),

  triggerServiceRefresh: () =>
    set((s) => ({ serviceRefreshKey: s.serviceRefreshKey + 1 })),

  triggerDepartmentRefresh: () =>
    set((s) => ({ departmentRefreshKey: s.departmentRefreshKey + 1 })),

  triggerProcedureRefresh: () =>
    set((s) => ({ procedureRefreshKey: s.procedureRefreshKey + 1 })),
}));
