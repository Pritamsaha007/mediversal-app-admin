import { create } from "zustand";
import { PathologyTest } from "../types";

interface PathologyTestStore {
  pathologyTests: PathologyTest[];
  setPathologyTests: (tests: PathologyTest[]) => void;
  getPathologyTests: () => PathologyTest[];
}

export const usePathologyTestStore = create<PathologyTestStore>((set, get) => ({
  pathologyTests: [],
  setPathologyTests: (tests) => set({ pathologyTests: tests }),
  getPathologyTests: () => get().pathologyTests,
}));
