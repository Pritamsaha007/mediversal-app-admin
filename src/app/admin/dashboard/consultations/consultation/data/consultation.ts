// Add these new interfaces to map API response to UI
export interface ConsultationFromAPI {
  id: string;
  consultation_date: string;
  consultation_time: string;
  session_duration_in_mins: number;
  patient_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  hospital_id: string;
  symptoms_desc: string;
  payment_mode: string;
  total_amount: string;
  service_fee_tax_amount: string;
  paid_amount: string;
  applied_coupons: string[];
  status: string;
  aadhar_id: string;
  consultation_language: string;
  doc_id: string;
  doc_name: string;
  consultation_type: string;
  payment_status: string;
  customer_id: string | null;
  customer_name: string | null;
}

// Update existing Consultation interface
export interface Consultation {
  id: string;
  bookingId: string;
  patientName: string;
  patientContact: string;
  patientEmail: string;
  aadhaarNumber?: string;
  customer_id: string | null;
  consultationType: "online" | "in-person";
  consultationDate: string;
  consultationTime: string;
  duration: number;
  appointedDoctor: string;
  doctorSpecialization: string;
  hospital?: string;
  hospitalLocation?: string;
  consultationLanguage: string;
  consultationFee: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  symptoms?: string;
  hospitalId?: string;
  doctorId?: string;
  paymentModeId?: string;
  languageId?: string;
  statusId?: string;
}

export function transformAPIToConsultation(
  apiData: ConsultationFromAPI
): Consultation {
  return {
    id: apiData.id,
    bookingId: apiData.id.substring(0, 6).toUpperCase(),
    patientName: apiData.patient_name,
    patientContact: apiData.phone,
    patientEmail: apiData.email,
    customer_id: apiData.customer_id ?? "",
    aadhaarNumber: apiData.aadhar_id,

    consultationType:
      apiData.consultation_type?.toLowerCase() === "online"
        ? "online"
        : "in-person",
    consultationDate: apiData.consultation_date.split("T")[0],
    consultationTime: apiData.consultation_time,
    duration: apiData.session_duration_in_mins,
    appointedDoctor: apiData.doc_name,
    doctorSpecialization: "General Medicine",
    consultationLanguage: apiData.consultation_language,
    consultationFee: parseInt(apiData.total_amount),
    paymentMethod: apiData.payment_mode,
    paymentStatus: apiData.payment_status,
    status: apiData.status,
    symptoms: apiData.symptoms_desc,
    hospitalId: apiData.hospital_id,
    doctorId: apiData.doc_id,
  };
}

export const durationOptions = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "60 minutes", value: 60 },
];
