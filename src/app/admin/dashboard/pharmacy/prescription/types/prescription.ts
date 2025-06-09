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
