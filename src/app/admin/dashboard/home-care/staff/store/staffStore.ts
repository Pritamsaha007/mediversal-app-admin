import { create } from "zustand";
import { ApiStaff, Staff } from "../types";

interface StaffStore {
  staff: ApiStaff[];
  setStaff: (staff: ApiStaff[]) => void;
}

export const useStaffStore = create<StaffStore>((set, get) => ({
  staff: [],
  setStaff: (staff) => set({ staff }),
}));
