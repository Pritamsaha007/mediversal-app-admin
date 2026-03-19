import { LeadAPIItem } from "../services/leadService";

// ─── Domain Model ─────────────────────────────────────────────────────────────

export interface DoctorConsultationDetails {
  chosenDoctor: string;
  doctorQualifications: string;
  consultationFee: number | null;
  requestedDateTime: string | null;
}

export interface Lead {
  id: string;
  patientName: string;
  phone: string;
  dob?: string;
  email: string;
  visitType: string | null;
  /** maps to lead_type from API */
  inquiryType: string;
  /** formatted from created_date */
  dateRequested: string;
  leadStatus: string;
  doctorDetails?: DoctorConsultationDetails;
  procedureName: string | null;
  serviceName: string | null;
  departmentName: string | null;
  packageName: string | null;
  minCost: number | null;
  maxCost: number | null;
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

export const ALL_LEADS_FILTER = "All Leads";

// ─── Utility: map raw API item → Lead ────────────────────────────────────────

/** Normalise doc_certfications which may be string[] or null */
const normaliseCerts = (certs: string[] | string | null): string => {
  if (!certs) return "";
  if (Array.isArray(certs)) return certs.join(", ");
  return certs;
};

export function mapApiItemToLead(item: LeadAPIItem): Lead {
  const qualifications = [
    item.doc_qualifications,
    normaliseCerts(item.doc_certfications),
  ]
    .filter(Boolean)
    .join(", ");

  const doctorDetails: DoctorConsultationDetails | undefined = item.doctor_name
    ? {
        chosenDoctor: item.doctor_name,
        doctorQualifications: qualifications,
        consultationFee: item.consultation_price ?? null,
        requestedDateTime: item.slot_date
          ? `${item.slot_date}${item.slot_time ? " " + item.slot_time : ""}`
          : null,
      }
    : undefined;

  return {
    id: item.id,
    patientName: item.patient_name,
    phone: item.mobile_number,
    dob: item.dob ?? undefined,
    email: item.email,
    visitType: item.visit_type,
    inquiryType: item.lead_type || "General Inquiry",
    dateRequested: item.created_date
      ? new Date(item.created_date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",
    leadStatus: item.lead_status,
    doctorDetails,
    procedureName: item.procedure_name,
    serviceName: item.service_name,
    departmentName: item.department_name,
    packageName: item.package_name,
    minCost: item.min_cost,
    maxCost: item.max_cost,
  };
}
