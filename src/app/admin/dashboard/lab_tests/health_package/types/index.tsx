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
  is_popular: boolean;
  is_deleted: boolean;
  related_health_package_ids?: string[];
  is_fasting_reqd?: boolean;
  in_person_visit_reqd?: boolean;
  is_home_collection_available?: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface CreateHealthPackagePayload extends Omit<HealthPackage, "id"> {
  id?: string;
}

export interface UpdateHealthPackagePayload extends Partial<HealthPackage> {
  id: string;
}
export interface SearchHealthPackagesPayload {
  start: number;
  max: number | null;
  filter_linked_test_ids?: string | null;
  search: string | null;
  filter_featured?: boolean | null;
  sort_by: string;
  sort_order: "ASC" | "DESC";
}
