import { Prescription } from "../types/prescription";

export const dummyPrescriptions: Prescription[] = [
  {
    id: "1",
    patientName: "John Doe",
    prescriptionId: "RX-1001",
    date: "2023-05-15",
    status: "Active",
    verificationStatus: "Verified",
    source: "In-Clinic",
    refillable: true,
    updatedAt: "2023-05-15T10:30:00Z",
    doctorName: "Dr. Smith",
    medications: [
      {
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "7 days",
      },
    ],
  },
  {
    id: "2",
    patientName: "Jane Smith",
    prescriptionId: "RX-1002",
    date: "2023-05-16",
    status: "Pending",
    verificationStatus: "Need Verification",
    source: "Telemedicine",
    refillable: false,
    updatedAt: "2023-05-16T14:45:00Z",
    doctorName: "Dr. Johnson",
    medications: [
      {
        name: "Ibuprofen",
        dosage: "200mg",
        frequency: "Every 6 hours",
        duration: "5 days",
      },
    ],
  },
];

export const statusOptions = [
  "Active",
  "Pending",
  "Complete",
  "Cancelled",
  "Draft",
];
export const sourceOptions = [
  "In-Clinic",
  "Telemedicine",
  "Mobile App",
  "Website",
  "Whatsapp",
  "External",
];
export const verificationOptions = [
  "All Verified",
  "Verified",
  "Need Verification",
  "Rejected",
  "Awaiting Confirmation",
];
export const sortOptions = [
  "Update (latest)",
  "Update (old)",
  "By Status",
  "By Verification Status",
];
