import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PhlebotomistSlot } from "../bookings/type";

interface AssignedPhlebotomist {
  phlebotomist: PhlebotomistSlot;
  selectedSlot: PhlebotomistSlot;
  bookingId: string;
  assignedAt: string;
}

interface PhlebotomistAssignmentState {
  assignments: Record<string, AssignedPhlebotomist>;
  setAssignment: (
    bookingId: string,
    assignment: Omit<AssignedPhlebotomist, "bookingId" | "assignedAt">
  ) => void;
  getAssignment: (bookingId: string) => AssignedPhlebotomist | null;
  removeAssignment: (bookingId: string) => void;
  clearAllAssignments: () => void;
}

export const usePhlebotomistAssignmentStore =
  create<PhlebotomistAssignmentState>()(
    persist(
      (set, get) => ({
        assignments: {},

        setAssignment: (bookingId, assignment) => {
          set((state) => ({
            assignments: {
              ...state.assignments,
              [bookingId]: {
                ...assignment,
                bookingId,
                assignedAt: new Date().toISOString(),
              },
            },
          }));
        },

        getAssignment: (bookingId) => {
          return get().assignments[bookingId] || null;
        },

        removeAssignment: (bookingId) => {
          set((state) => {
            const newAssignments = { ...state.assignments };
            delete newAssignments[bookingId];
            return { assignments: newAssignments };
          });
        },

        clearAllAssignments: () => {
          set({ assignments: {} });
        },
      }),
      {
        name: "phlebotomist-assignments-storage",
      }
    )
  );
