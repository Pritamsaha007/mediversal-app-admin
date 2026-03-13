export interface BlogSectionAPI {
  heading: string;
  content: string;
}

export interface BlogAPI {
  id: string;
  title: string;
  description: string;
  image_url: string[];
  sections: BlogSectionAPI[];
  doctor_id?: string | null;
  doctor_name?: string;
  author_name?: string;
  published_at: string;
  estimated_read_time_mins: number;
  is_active: boolean;
  is_deleted: boolean;
  created_by: null;
  updated_by: null;
}

export interface BlogSearchResponse {
  success: boolean;
  blogs: BlogAPI[];
  total?: number;
}

export interface CreateUpdateBlogPayload {
  id: string | null;
  title: string;
  description: string;
  image_url: string[];
  sections: BlogSectionAPI[];
  doctor_id: string | null;
  published_at: string;
  estimated_read_time_mins: number;
  is_active: boolean;
  is_deleted: boolean;
  created_by: null;
  updated_by: null;
}

export interface BlogSearchParams {
  start: number;
  max: number;
  search: string | null;
  filter_active: boolean | null;
  filter_specialization_name: string | null;
  sort_by: string;
  sort_order: string;
}

// ---- Doctor API shape ----
export interface DoctorOption {
  id: string;
  name: string;
  specializations?: string;
  profile_image_url?: string;
}

// ---- UI form types ----
export interface BlogFormSection {
  id: string; // local only, not sent to API
  subtitle: string;
  content: string;
}

export interface BlogFormData {
  title: string;
  description: string;
  doctorId: string | null;
  doctorName: string;
  estimatedReadTime: number | "";
  publishDate: string;
  coverImageUrl: string;
  sections: BlogFormSection[];
  active: boolean;
}

export type BlogModalStep = "basic" | "sections";
export type BlogModalMode = "add" | "edit";
