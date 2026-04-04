import { create } from "zustand";
import { Doctor } from "../types";

interface DoctorStore {
  doctors: Doctor[];
  setDoctors: (doctors: Doctor[]) => void;
  getDoctors: () => Doctor[];
  clearDoctors: () => void;
}

export const useDoctorStore = create<DoctorStore>((set, get) => ({
  doctors: [],
  setDoctors: (doctors) => set({ doctors }),
  getDoctors: () => get().doctors,
  clearDoctors: () => set({ doctors: [] }),
}));
