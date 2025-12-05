import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DeliveryRider } from "../types";

interface RiderAssignment {
  rider: DeliveryRider;
  orderId: string;
  assignedAt: string;
}

interface RiderAssignmentStore {
  assignments: Record<string, RiderAssignment>;

  addAssignment: (orderId: string, rider: DeliveryRider) => void;

  removeAssignment: (orderId: string) => void;

  getAssignment: (orderId: string) => RiderAssignment | null;

  hasAssignment: (orderId: string) => boolean;

  clearAllAssignments: () => void;
}

export const useRiderAssignmentStore = create<RiderAssignmentStore>()(
  persist(
    (set, get) => ({
      assignments: {},

      addAssignment: (orderId: string, rider: DeliveryRider) => {
        set((state) => ({
          assignments: {
            ...state.assignments,
            [orderId]: {
              rider,
              orderId,
              assignedAt: new Date().toISOString(),
            },
          },
        }));
      },

      removeAssignment: (orderId: string) => {
        set((state) => {
          const { [orderId]: removed, ...rest } = state.assignments;
          return { assignments: rest };
        });
      },

      getAssignment: (orderId: string) => {
        return get().assignments[orderId] || null;
      },

      hasAssignment: (orderId: string) => {
        return !!get().assignments[orderId];
      },

      clearAllAssignments: () => {
        set({ assignments: {} });
      },
    }),
    {
      name: "rider-assignments-storage",

      partialize: (state) => ({ assignments: state.assignments }),
    }
  )
);
