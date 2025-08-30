// Staff data types
export interface Staff {
  id: string;
  name: string;
  role: string;
  initials: string;
  experience: number;
  status: "Available" | "On Duty" | "Busy";
  rating: number;
  category: string;
}

export interface AssignedStaff {
  id: string; // Ensure this is defined
  name: string;
  role: string;
  initials: string;
  experience: number;
  rating: number;
  status: "Available" | "On Duty";
}

// Mock staff data

export const staffCategories = [
  "All Staffs",
  "General Nursing",
  "Physiotherapy",
  "Caretaker",
  "Medical Procedure",
  "Critical Care Nursing",
  "Personal Care",
];
