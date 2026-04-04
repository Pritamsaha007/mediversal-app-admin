import { create } from "zustand";
import { RadiologyTest } from "../types";

interface RadiologyTestStore {
  radiologyTests: RadiologyTest[];
  setRadiologyTests: (tests: RadiologyTest[]) => void;
  getPathologyTests: () => RadiologyTest[];
}

export const useRadiologyTestStore = create<RadiologyTestStore>((set, get) => ({
  radiologyTests: [],
  setRadiologyTests: (tests) => set({ radiologyTests: tests }),
  getPathologyTests: () => get().radiologyTests,
}));
