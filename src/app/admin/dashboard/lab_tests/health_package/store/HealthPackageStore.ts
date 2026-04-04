import { create } from "zustand";
import { HealthPackage } from "../types";

interface HealthPackageStore {
  healthPackages: HealthPackage[];
  setHealthPackages: (packages: HealthPackage[]) => void;
  getHealthPackages: () => HealthPackage[];
}

export const useHealthPackageStore = create<HealthPackageStore>((set, get) => ({
  healthPackages: [],
  setHealthPackages: (packages) => set({ healthPackages: packages }),
  getHealthPackages: () => get().healthPackages,
}));
