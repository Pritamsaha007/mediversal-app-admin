export interface Prescription {
  refillable: unknown;
  id: string;
  patientName: string;
  prescriptionId: string;
  doctorName: string;
  date: string;
  status: "Active" | "Pending" | "Complete" | "Cancelled" | "Draft";
  verificationStatus:
    | "Verified"
    | "Need Verification"
    | "Rejected"
    | "Awaiting Confirmation";
  source:
    | "In-Clinic"
    | "Telemedicine"
    | "Mobile App"
    | "Website"
    | "Whatsapp"
    | "External";
  medications: Medication[];
  updatedAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface StatsCardProps {
  title: string;
  stats: Status[];
  icon?: React.ReactNode;
  color?: string;
}

interface Status {
  label: string;
  value: number | string;
}

export interface PrescriptionData {
  patientInfo: {
    patientId: string;
    patientName: string;
  };
  doctorInfo: {
    doctorRegistrationNumber: string;
    doctorName: string;
    doctorSpecialty: string;
  };
  prescriptionDetails: {
    expiryDate: string;
    status: string;
    source: string;
    isRefillable: boolean;
    refillsAllowed: number;
    diagnosis: string;
    notes: string;
  };
  medications: Array<{
    id: string;
    productName: string;
    price: number;
    medCode: string;
    provider: string;
    category: string;
    quantity: number;
    dosage: number;
    frequency: number;
    duration: number;
  }>;
}

export interface MedicationTab {
  id: string;
  productName: string;
  price: number;
  medCode: string;
  provider: string;
  category: string;
  generic: string;
}
