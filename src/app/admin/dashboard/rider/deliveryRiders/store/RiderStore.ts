import { create } from "zustand";
import { DeliveryRider } from "../../types";

interface RiderStore {
  riders: DeliveryRider[];
  setRiders: (riders: DeliveryRider[]) => void;
  getRiders: () => DeliveryRider[];
  clearRiders: () => void;
}

export const useRiderStore = create<RiderStore>((set, get) => ({
  riders: [],
  setRiders: (riders) => set({ riders }),
  getRiders: () => get().riders,
  clearRiders: () => set({ riders: [] }),
}));
