import { Consultation, ConsultationFromAPI } from "../types";

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
