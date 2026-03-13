export type LeadStatus =
  | "New"
  | "In-Progress"
  | "Follow Up"
  | "Converted"
  | "Closed";
export type InquiryType =
  | "Doctor Appointment"
  | "Service Booking"
  | "Health Package";

export interface DoctorConsultationDetails {
  requestedDateTime: string;
  chosenDoctor: string;
  doctorQualifications: string;
  consultationFee: number;
}

export interface Lead {
  id: string;
  patientName: string;
  phone: string;
  dob?: string;
  inquiryType: InquiryType;
  emailId: string;
  dateRequested: string;
  leadStatus: LeadStatus;
  doctorDetails?: DoctorConsultationDetails;
}

export const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  "New",
  "In-Progress",
  "Follow Up",
  "Converted",
  "Closed",
];

export const INQUIRY_TYPE_OPTIONS: InquiryType[] = [
  "Doctor Appointment",
  "Service Booking",
  "Health Package",
];

export const ALL_LEADS_FILTER = "All Leads";
export const LEAD_FILTER_OPTIONS = [ALL_LEADS_FILTER, ...LEAD_STATUS_OPTIONS];
