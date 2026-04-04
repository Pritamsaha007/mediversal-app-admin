import { create } from "zustand";
import { Hospital } from "../types";

interface HospitalStore {
  hospitals: Hospital[];
  setHospitals: (hospitals: Hospital[]) => void;
  getAllHospitals: () => Hospital[];

  clearHospitals: () => void;
}

export const useHospitalStore = create<HospitalStore>((set, get) => ({
  hospitals: [],

  setHospitals: (hospitals) => set({ hospitals }),

  getAllHospitals: () => get().hospitals,

  clearHospitals: () => set({ hospitals: [] }),
}));
