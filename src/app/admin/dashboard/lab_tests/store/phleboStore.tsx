import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PhlebotomistSlot } from "../bookings/type";

interface PhlebotomistAssignment {
  phlebotomist: PhlebotomistSlot;
  selectedSlot: PhlebotomistSlot;
  bookingId: string;
  assignedAt: string;
}

interface PhlebotomistAssignmentStore {
  assignments: Record<string, PhlebotomistAssignment>;

  addAssignment: (
    bookingId: string,
    phlebotomist: PhlebotomistSlot,
    selectedSlot: PhlebotomistSlot
  ) => void;

  removeAssignment: (bookingId: string) => void;

  getAssignment: (bookingId: string) => PhlebotomistAssignment | null;

  hasAssignment: (bookingId: string) => boolean;

  clearAllAssignments: () => void;

  updateAssignment: (
    bookingId: string,
    updates: Partial<PhlebotomistAssignment>
  ) => void;
}

export const usePhlebotomistAssignmentStore =
  create<PhlebotomistAssignmentStore>()(
    persist(
      (set, get) => ({
        assignments: {},

        addAssignment: (
          bookingId: string,
          phlebotomist: PhlebotomistSlot,
          selectedSlot: PhlebotomistSlot
        ) => {
          set((state) => ({
            assignments: {
              ...state.assignments,
              [bookingId]: {
                phlebotomist,
                selectedSlot,
                bookingId,
                assignedAt: new Date().toISOString(),
              },
            },
          }));
        },

        removeAssignment: (bookingId: string) => {
          set((state) => {
            const { [bookingId]: removed, ...rest } = state.assignments;
            return { assignments: rest };
          });
        },

        getAssignment: (bookingId: string) => {
          return get().assignments[bookingId] || null;
        },

        hasAssignment: (bookingId: string) => {
          return !!get().assignments[bookingId];
        },

        clearAllAssignments: () => {
          set({ assignments: {} });
        },

        updateAssignment: (
          bookingId: string,
          updates: Partial<PhlebotomistAssignment>
        ) => {
          set((state) => {
            const existingAssignment = state.assignments[bookingId];
            if (!existingAssignment) return state;

            return {
              assignments: {
                ...state.assignments,
                [bookingId]: {
                  ...existingAssignment,
                  ...updates,
                },
              },
            };
          });
        },
      }),
      {
        name: "phlebotomist-assignments-storage",
        partialize: (state) => ({ assignments: state.assignments }),
      }
    )
  );
