export type ReportStatus = "Pending" | "No report" | "Sent" | "Under Review";

export interface LabTestReport {
  booking_id: string;
  patient_name: string;
  test_names: string[];
  category_names: string[];
  is_hospital_visit: boolean;
  report_date_time: string | null;
  booking_date: string | null;
  report_url: string | null;
  report_status: ReportStatus;
}

export interface SearchLabTestReportsResponse {
  success: boolean;
  reports: LabTestReport[];
}

export interface SearchLabTestReportsPayload {
  search_text: string | null;
  filter_report_status: ReportStatus[] | null;
  sort_by: string;
  sort_order: "ASC" | "DESC";
  start: number | null;
  max: number | null;
  start_date: string | null;
  end_date: string | null;
}
