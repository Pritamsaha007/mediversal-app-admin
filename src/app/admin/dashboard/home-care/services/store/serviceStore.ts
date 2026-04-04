import { create } from "zustand";
import { HomecareService } from "../types";

interface ServiceStore {
  services: HomecareService[];
  setServices: (services: HomecareService[]) => void;
  getServices: () => HomecareService[];
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: [],
  setServices: (services) => set({ services }),
  getServices: () => get().services,
}));
