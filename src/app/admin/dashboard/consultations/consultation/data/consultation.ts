// types/consultation.ts
export interface Consultation {
  id: string;
  bookingId: string;
  patientName: string;
  patientContact: string;
  patientEmail: string;
  aadhaarNumber?: string;
  consultationType: "online" | "in-person";
  consultationDate: string;
  consultationTime: string;
  duration: number; // in minutes
  appointedDoctor: string;
  doctorSpecialization: string;
  hospital?: string;
  hospitalLocation?: string;
  consultationLanguage: string;
  consultationFee: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "cancelled" | "refunded";
  status: "scheduled" | "completed" | "cancelled" | "in-progress";
  symptoms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationFormData {
  patientName: string;
  patientContact: string;
  patientEmail: string;
  aadhaarNumber?: string;
  consultationType: "online" | "in-person";
  consultationDate: string;
  consultationTime: string;
  duration: number;
  appointedDoctor: string;
  hospital?: string;
  consultationLanguage: string;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "cancelled" | "refunded";
  symptoms?: string;
}

// data/consultationsData.ts
export const consultationsData: Consultation[] = [
  {
    id: "1",
    bookingId: "MH0003456",
    patientName: "Harish Gupta",
    patientContact: "+91 62017 53532",
    patientEmail: "harish.gupta@email.com",
    aadhaarNumber: "1234-5678-9012",
    consultationType: "online",
    consultationDate: "15/09/2025",
    consultationTime: "11:30 AM",
    duration: 30,
    appointedDoctor: "Dr. Rajesh Sharma",
    doctorSpecialization: "Cardiology",
    consultationLanguage: "Hindi",
    consultationFee: 599,
    paymentMethod: "UPI",
    paymentStatus: "paid",
    status: "completed",
    symptoms: "Chest pain and shortness of breath",
    createdAt: "2025-09-10T10:00:00Z",
    updatedAt: "2025-09-15T11:30:00Z",
  },
  {
    id: "2",
    bookingId: "MH0003457",
    patientName: "Anjali Mehta",
    patientContact: "+91 62017 53532",
    patientEmail: "anjali.mehta@email.com",
    aadhaarNumber: "1234-5678-9013",
    consultationType: "in-person",
    consultationDate: "15/09/2025",
    consultationTime: "11:30 AM",
    duration: 45,
    appointedDoctor: "Dr. Vikram Singh",
    doctorSpecialization: "Pediatrics",
    hospital: "Mediversal Multi Super Speciality Hospital",
    hospitalLocation: "Doctors Colony, Kankarbagh, Patna",
    consultationLanguage: "English",
    consultationFee: 799,
    paymentMethod: "Card",
    paymentStatus: "paid",
    status: "scheduled",
    symptoms: "Regular checkup for child",
    createdAt: "2025-09-10T10:00:00Z",
    updatedAt: "2025-09-10T10:00:00Z",
  },
  {
    id: "3",
    bookingId: "MH0003458",
    patientName: "Anjali Mehta",
    patientContact: "+91 62017 53532",
    patientEmail: "anjali.mehta@email.com",
    consultationType: "online",
    consultationDate: "15/09/2025",
    consultationTime: "11:30 AM",
    duration: 30,
    appointedDoctor: "Dr. Raghav Mukherjee",
    doctorSpecialization: "Neurology",
    consultationLanguage: "English",
    consultationFee: 699,
    paymentMethod: "UPI",
    paymentStatus: "pending",
    status: "in-progress",
    symptoms: "Headache and dizziness",
    createdAt: "2025-09-08T10:00:00Z",
    updatedAt: "2025-09-15T11:30:00Z",
  },
  {
    id: "4",
    bookingId: "MH0004832",
    patientName: "Neha Rani",
    patientContact: "+91 93251 47326",
    patientEmail: "neha.rani@email.com",
    aadhaarNumber: "1234-5678-9014",
    consultationType: "in-person",
    consultationDate: "15/09/2025",
    consultationTime: "11:30 AM",
    duration: 30,
    appointedDoctor: "Dr. Mukesh Ranjan",
    doctorSpecialization: "Ophthalmology",
    hospital: "Mediversal Health Studio",
    hospitalLocation: "Gandhi Maidan, Patna",
    consultationLanguage: "Hindi",
    consultationFee: 599,
    paymentMethod: "Cash",
    paymentStatus: "paid",
    status: "cancelled",
    symptoms: "Eye examination",
    createdAt: "2025-09-05T10:00:00Z",
    updatedAt: "2025-09-14T10:00:00Z",
  },
  {
    id: "5",
    bookingId: "MH0003459",
    patientName: "Abhijeet Kumar",
    patientContact: "+91 62017 53532",
    patientEmail: "abhijeet.kumar@email.com",
    consultationType: "online",
    consultationDate: "15/09/2025",
    consultationTime: "11:30 AM",
    duration: 30,
    appointedDoctor: "Dr. Priya Sharma",
    doctorSpecialization: "Dermatology",
    consultationLanguage: "English",
    consultationFee: 499,
    paymentMethod: "UPI",
    paymentStatus: "paid",
    status: "scheduled",
    symptoms: "Skin rash and allergies",
    createdAt: "2025-09-12T10:00:00Z",
    updatedAt: "2025-09-12T10:00:00Z",
  },
];

export const doctorsList = [
  "Dr. Rajesh Sharma",
  "Dr. Vikram Singh",
  "Dr. Raghav Mukherjee",
  "Dr. Mukesh Ranjan",
  "Dr. Priya Sharma",
  "Dr. Amit Verma",
  "Dr. Sunita Yadav",
];

export const hospitalsList = [
  "Mediversal Multi Super Speciality Hospital",
  "Mediversal Health Studio",
  "City Hospital",
  "Apollo Hospital",
  "Max Healthcare",
];

export const languagesList = [
  "Hindi",
  "English",
  "Bengali",
  "Gujarati",
  "Tamil",
];

export const paymentMethods = ["UPI", "Card", "Cash", "Net Banking"];

export const durationOptions = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "60 minutes", value: 60 },
];
