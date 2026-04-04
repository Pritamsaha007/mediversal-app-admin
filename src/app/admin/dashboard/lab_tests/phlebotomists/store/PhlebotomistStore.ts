import { create } from "zustand";
import { Phlebotomist } from "../type";

interface PhlebotomistStore {
  phlebotomists: Phlebotomist[];
  setPhlebotomists: (phlebotomists: Phlebotomist[]) => void;
  getPhlebotomists: () => Phlebotomist[];
}

export const usePhlebotomistStore = create<PhlebotomistStore>((set, get) => ({
  phlebotomists: [],
  setPhlebotomists: (phlebotomists) => set({ phlebotomists }),
  getPhlebotomists: () => get().phlebotomists,
}));
