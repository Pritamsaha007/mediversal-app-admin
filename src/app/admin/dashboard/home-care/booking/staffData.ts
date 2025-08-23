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
  id: string;
  name: string;
  role: string;
  initials: string;
  experience: number;
  rating: number;
  status: "Available" | "On Duty";
}

// Mock staff data
export const mockStaffs: Staff[] = [
  {
    id: "SW001",
    name: "Sarah Wilson",
    role: "Registered Nurse",
    initials: "SW",
    experience: 8,
    status: "Available",
    rating: 4.9,
    category: "General Nursing",
  },
  {
    id: "MJ001",
    name: "Michael Johnson",
    role: "Paramedic",
    initials: "MJ",
    experience: 12,
    status: "Available",
    rating: 4.7,
    category: "General Nursing",
  },
  {
    id: "EC001",
    name: "Emily Chen",
    role: "Nurse Practitioner",
    initials: "EC",
    experience: 10,
    status: "Available",
    rating: 5.0,
    category: "General Nursing",
  },
  {
    id: "DR001",
    name: "David Rodriguez",
    role: "Physical Therapist",
    initials: "DR",
    experience: 6,
    status: "Available",
    rating: 4.8,
    category: "Physiotherapy",
  },

  {
    id: "RT001",
    name: "Robert Taylor",
    role: "Medical Technician",
    initials: "RT",
    experience: 7,
    status: "Available",
    rating: 4.5,
    category: "Medical Procedure",
  },
];

export const staffCategories = [
  "All Staffs",
  "General Nursing",
  "Physiotherapy",
  "Caretaker",
  "Medical Procedure",
  "Critical Care Nursing",
  "Personal Care",
];
