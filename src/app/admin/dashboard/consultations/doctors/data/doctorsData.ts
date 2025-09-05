// data/doctorsData.ts

export interface TimeSlot {
  startTime: string;
  endTime: string;
  maxPatientsPerSlot: string;
}
export interface Doctor {
  id: string;
  name: string;
  mobile_number: string;
  specialization_id: string;
  department_id: string;
  experience_in_yrs: number;
  consultation_price: number;
  about: string;
  qualifications: string;
  languages_known: string[]; // Array of UUIDs from backend
  hospitals_id: string[]; // Array of UUIDs from backend
  is_available_online: boolean;
  is_available_in_person: boolean;
  mci: string;
  nmc: string;
  state_registration: string;
  is_available: boolean;
  profile_image_url: string | File | null; // Support both for display and form
  created_by?: string;
  updated_by?: string;

  // Additional fields for display/frontend only
  rating?: number;
  specializations?: string; // Display name for specialization

  // Availability schedule
  availability: Record<string, TimeSlot[]>;
}

export const doctorsData: Doctor[] = [
  {
    id: "f4d5c1b8-3e77-4d2e-b25d-11e6a3c41b77",
    name: "Dr. Ananya Sharma",
    mobile_number: "9876543210",
    specialization_id: "1a2b3c4d-1234-5678-9abc-abcdef123456",
    department_id: "abc12345-6789-4def-9012-9876543210ff",
    experience_in_yrs: 10,
    consultation_price: 800,
    about: "Experienced cardiologist with a focus on preventive heart care.",
    qualifications: "MBBS, MD (Internal Medicine), DM (Cardiology)",
    languages_known: ["a1b2c3d4-5678-9101-1121-314151617181"],
    hospitals_id: ["b1234567-89ab-cdef-0123-456789abcdef"],
    is_available_online: true,
    is_available_in_person: true,
    mci: "MCI/12345",
    nmc: "NMC/2023/6789",
    state_registration: "DL/2020/54321",
    is_available: true,
    profile_image_url: "https://example.com/images/doctors/ananya.jpg",
    created_by: "7d9f1e72-2e90-45c4-a4b0-5c76b8e62b91",
    updated_by: "d6a2cb34-9d41-4c78-bfd8-0d25172f13de",
    rating: 4.7,
    specializations: "Cardiology",
    availability: {
      Monday: [
        { startTime: "10:00 AM", endTime: "10:30 AM", maxPatientsPerSlot: "5" },
        { startTime: "10:30 AM", endTime: "11:00 AM", maxPatientsPerSlot: "5" },
      ],
      Tuesday: [],
    },
  },
  {
    id: "a3b2c1d4-5678-4abc-9123-7890def45678",
    name: "Dr. Rohan Mehta",
    mobile_number: "9123456789",
    specialization_id: "2b3c4d5e-1234-5678-9abc-abcdef654321",
    department_id: "def12345-6789-4def-9012-9876543210aa",
    experience_in_yrs: 5,
    consultation_price: 500,
    about: "Specialist in skin care and cosmetic treatments.",
    qualifications: "MBBS, MD (Dermatology)",
    languages_known: ["b2c3d4e5-6789-1234-5678-abcdef987654"],
    hospitals_id: ["c1234567-89ab-cdef-0123-456789abcdee"],
    is_available_online: true,
    is_available_in_person: false,
    mci: "MCI/67890",
    nmc: "NMC/2024/1122",
    state_registration: "MH/2021/98765",
    is_available: true,
    profile_image_url: "https://example.com/images/doctors/rohan.jpg",
    created_by: "9f7c1d11-8b56-4e3d-9f12-7c65d9822d61",
    updated_by: "1d2e3f4a-5678-9101-1121-314151617181",
    rating: 4.3,
    specializations: "Dermatology",
    availability: {
      Monday: [
        { startTime: "10:00 AM", endTime: "10:30 AM", maxPatientsPerSlot: "5" },
        { startTime: "10:30 AM", endTime: "11:00 AM", maxPatientsPerSlot: "5" },
      ],
      Tuesday: [],
    },
  },
  {
    id: "b1c2d3e4-5678-9abc-def0-123456789012",
    name: "Dr. Rajesh Sharma",
    mobile_number: "9988776655",
    specialization_id: "3c4d5e6f-2345-6789-abcd-bcdef1234567",
    department_id: "ghi12345-6789-4def-9012-9876543210bb",
    experience_in_yrs: 8,
    consultation_price: 1000,
    about: "Senior cardiologist specializing in interventional cardiology.",
    qualifications:
      "MBBS, MD (Cardiology), Fellowship in Interventional Cardiology",
    languages_known: ["c3d4e5f6-7890-2345-6789-bcdef0123456"],
    hospitals_id: ["d2345678-90ab-cdef-1234-56789abcdef0"],
    is_available_online: true,
    is_available_in_person: true,
    mci: "MCI/54321",
    nmc: "NMC/2022/3456",
    state_registration: "UP/2019/12345",
    is_available: true,
    profile_image_url: "https://example.com/images/doctors/rajesh.jpg",
    created_by: "8e7d6c5b-4a39-2817-1695-483726152019",
    updated_by: "9f8e7d6c-5b4a-3928-1706-594837261520",
    rating: 4.5,
    specializations: "Cardiology",
    availability: {
      Monday: [
        { startTime: "10:00 AM", endTime: "10:30 AM", maxPatientsPerSlot: "5" },
        { startTime: "10:30 AM", endTime: "11:00 AM", maxPatientsPerSlot: "5" },
      ],
      Tuesday: [],
    },
  },
  {
    id: "c2d3e4f5-6789-abcd-ef01-234567890123",
    name: "Dr. Rekha Verma",
    mobile_number: "9876543201",
    specialization_id: "4d5e6f7g-3456-789a-bcde-cdef12345678",
    department_id: "jkl12345-6789-4def-9012-9876543210cc",
    experience_in_yrs: 15,
    consultation_price: 700,
    about: "Experienced orthopedic surgeon specializing in joint replacement.",
    qualifications: "MBBS, MS (Orthopedics), DNB (Orthopedics)",
    languages_known: ["d4e5f6g7-8901-3456-789a-cdef01234567"],
    hospitals_id: ["e3456789-01ab-cdef-2345-6789abcdef01"],
    is_available_online: true,
    is_available_in_person: true,
    mci: "MCI/98765",
    nmc: "NMC/2021/7890",
    state_registration: "RJ/2018/67890",
    is_available: true,
    profile_image_url: "https://example.com/images/doctors/rekha.jpg",
    created_by: "7f6e5d4c-3b2a-1908-7654-321098765432",
    updated_by: "8g7f6e5d-4c3b-2a19-0876-543210987654",
    rating: 4.4,
    specializations: "Orthopaedics",
    availability: {
      Monday: [
        { startTime: "10:00 AM", endTime: "10:30 AM", maxPatientsPerSlot: "5" },
        { startTime: "10:30 AM", endTime: "11:00 AM", maxPatientsPerSlot: "5" },
      ],
      Tuesday: [],
    },
  },
  {
    id: "d3e4f5g6-789a-bcde-f012-345678901234",
    name: "Dr. Emily Carter",
    mobile_number: "9123456780",
    specialization_id: "5e6f7g8h-4567-89ab-cdef-def123456789",
    department_id: "mno12345-6789-4def-9012-9876543210dd",
    experience_in_yrs: 6,
    consultation_price: 400,
    about: "Specialized in providing non-medical support and social care.",
    qualifications: "BA (Social Work), MSW, PhD (Social Sciences)",
    languages_known: ["e5f6g7h8-9012-4567-89ab-def012345678"],
    hospitals_id: ["f4567890-12ab-cdef-3456-789abcdef012"],
    is_available_online: true,
    is_available_in_person: false,
    mci: "MCI/11111",
    nmc: "NMC/2023/1234",
    state_registration: "KA/2020/11111",
    is_available: true,
    profile_image_url: "https://example.com/images/doctors/emily.jpg",
    created_by: "6e5d4c3b-2a19-0876-5432-109876543210",
    updated_by: "7f6e5d4c-3b2a-1987-6543-210987654321",
    rating: 4.1,
    specializations: "Non-medical support and socialization",
    availability: {
      Monday: [
        { startTime: "10:00 AM", endTime: "10:30 AM", maxPatientsPerSlot: "5" },
        { startTime: "10:30 AM", endTime: "11:00 AM", maxPatientsPerSlot: "5" },
      ],
      Tuesday: [],
    },
  },
];

// Generate time slots for demonstration
export const generateTimeSlots = () => {
  const slots = [];

  // Morning slots
  for (let hour = 10; hour <= 11; hour++) {
    slots.push(`${hour}:00 AM`);
    slots.push(`${hour}:15 AM`);
    slots.push(`${hour}:30 AM`);
    slots.push(`${hour}:45 AM`);
  }

  // Afternoon slots
  for (let hour = 1; hour <= 4; hour++) {
    slots.push(`${hour}:00 PM`);
    slots.push(`${hour}:15 PM`);
    slots.push(`${hour}:30 PM`);
    slots.push(`${hour}:45 PM`);
  }

  return slots;
};

export const tabs = [
  "Basic Information",
  "Doctor Details",
  "Availability",
  "Compliance",
];
export const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export const languageOptions = [
  "English",
  "Hindi",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Gujarati",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Assamese",
  "Urdu",
];

export const specializationOptions = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "Oncology",
  "Gynecology",
];

export const departmentOptions = [
  "Emergency Medicine",
  "Internal Medicine",
  "Surgery",
  "Pediatrics",
  "Obstetrics & Gynecology",
  "Radiology",
  "Pathology",
  "Anesthesiology",
];
