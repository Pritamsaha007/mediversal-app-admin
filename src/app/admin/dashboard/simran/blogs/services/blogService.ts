import {
  BlogSearchParams,
  BlogSearchResponse,
  CreateUpdateBlogPayload,
  DoctorOption,
} from "../types/types";

const SIMRAN_API_BASE = "https://simran-dev-api.mediversal247.in";
const CLINIC_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev-api.mediversal247.in";

export async function searchBlogs(
  params: BlogSearchParams,
  token: string,
): Promise<BlogSearchResponse> {
  const response = await fetch(`${SIMRAN_API_BASE}/blog/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function createOrUpdateBlog(
  payload: CreateUpdateBlogPayload,
  token: string,
): Promise<{ success: boolean; blog?: any; message?: string }> {
  const response = await fetch(`${SIMRAN_API_BASE}/blog`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function toggleBlogActive(
  blog: CreateUpdateBlogPayload,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  return createOrUpdateBlog({ ...blog, is_active: !blog.is_active }, token);
}

export async function deleteBlog(
  blog: CreateUpdateBlogPayload,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  return createOrUpdateBlog({ ...blog, is_deleted: true }, token);
}

export async function searchDoctors(
  search: string,
  token: string,
): Promise<DoctorOption[]> {
  const response = await fetch(`${CLINIC_API_BASE}/api/clinic/doctors/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      search_text: search || null,
      online_available: null,
      in_person_available: null,
      filter_available_slot_start_time: null,
      filter_available_slot_end_time: null,
      limit_count: 100,
      offset_count: 0,
      filter_specializations: null,
      filter_departments: null,
      min_experience: null,
      max_experience: null,
      sort_by: null,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return (data.doctors || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    specializations: d.specializations,
    profile_image_url: d.profile_image_url,
  }));
}
