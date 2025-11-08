export interface HealthPackage {
  id: string;
  name: string;
  description: string;
  image_url: string;
  linked_test_ids: string[];
  cost_price: number;
  selling_price: number;
  prepare_instructions: string[];
  is_active: boolean;
  is_popular: boolean | null;
  is_deleted: boolean;
  related_health_package_ids: string[];
  is_fasting_reqd?: boolean | null;
  in_person_visit_reqd?: boolean | null;
  is_home_collection_available?: boolean | null;
  created_by?: string;
  updated_by?: string;

  sample_type?: (string | null)[];
  test_params?: string[];
  param_count?: number;
  report_time_hrs?: number | null;
  discount_percentage?: number;
}

export interface CreateHealthPackagePayload extends Omit<HealthPackage, "id"> {
  id?: string;
}

export interface UpdateHealthPackagePayload extends Partial<HealthPackage> {
  id: string;
}
export interface SearchHealthPackagesPayload {
  start: number | null;
  max: number | null;
  filter_linked_test_ids?: string | null;
  search: string | null;
  filter_featured?: boolean | null;
  sort_by: string;
  sort_order: "ASC" | "DESC";
}
export interface statics {
  total_health_packages: number;
  total_active_health_packages: number;
  total_inactive_health_packages: number;
  popular_packages: number;
  average_discount_percentage: number;
}
