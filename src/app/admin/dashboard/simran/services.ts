import axios from "axios";

const SIMRAN_API_BASE =
  process.env.NEXT_PUBLIC_SIMRAN_API_BASE_URL ||
  "https://simran-dev-api.mediversal247.in";

export interface HeroSectionData {
  id: string;
  title: string;
  description: string;
  image_url: string[];
  is_deleted: boolean;
  patients_treated: number;
  specialist_doctors: number;
  surgeries_done: number;
  hospital_beds: number;
  created_by?: string;
  updated_by?: string;
  created_date?: string;
  updated_date?: string;
}

export interface HeroSectionReadResponse {
  heroSection: HeroSectionData[];
}

export interface HeroSectionUpsertPayload {
  id: string;
  title: string;
  description: string;
  image_url: string[];
  is_deleted: boolean;
  patients_treated: number;
  specialist_doctors: number;
  surgeries_done: number;
  hospital_beds: number;
}

export async function readHeroSection(
  token: string,
): Promise<HeroSectionReadResponse> {
  const response = await axios.post<HeroSectionReadResponse>(
    `${SIMRAN_API_BASE}/hero-section/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
}

export async function upsertHeroSection(
  payload: HeroSectionUpsertPayload,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await axios.post(
    `${SIMRAN_API_BASE}/hero-section`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  is_deleted: boolean;
  created_by?: string;
  updated_by?: string;
  created_date?: string;
  updated_date?: string;
}

export interface FAQListResponse {
  faqs: FAQItem[];
}

export interface FAQUpsertPayload {
  id: string | null;
  question: string;
  answer: string;
  is_active: boolean;
  is_deleted: boolean;
}

export async function listFAQs(token: string): Promise<FAQListResponse> {
  const response = await axios.post<FAQListResponse>(
    `${SIMRAN_API_BASE}/faqs/list`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
}

export async function upsertFAQ(
  payload: FAQUpsertPayload,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await axios.post(`${SIMRAN_API_BASE}/faqs`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
}

// ---------------------------------------------------------------------------
// Patient Stories
// ---------------------------------------------------------------------------

export interface PatientStory {
  id: string;
  customer_name: string;
  city: string;
  state: string;
  feedback: string;
  profile_pic_url: string;
  is_active: boolean;
  is_deleted?: boolean;
  feedback_date: string;
}

export interface PatientStoriesListResponse {
  patient_stories: PatientStory[];
}

export interface PatientStoriesListPayload {
  start: number;
  max: number;
  sort_by: string;
  sort_order: "ASC" | "DESC";
}

export interface PatientStoryUpsertPayload {
  id: string | null;
  customer_name: string;
  city: string;
  state: string;
  feedback: string;
  profile_pic_url: string;
  is_active: boolean;
  is_deleted: boolean;
  feedback_date: string;
}

export async function listPatientStories(
  token: string,
  payload: PatientStoriesListPayload = {
    start: 0,
    max: 20,
    sort_by: "created_date",
    sort_order: "DESC",
  },
): Promise<PatientStoriesListResponse> {
  const response = await axios.post<PatientStoriesListResponse>(
    `${SIMRAN_API_BASE}/patient-stories/list`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
}

export async function upsertPatientStory(
  payload: PatientStoryUpsertPayload,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await axios.post(
    `${SIMRAN_API_BASE}/patient-stories`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
}
