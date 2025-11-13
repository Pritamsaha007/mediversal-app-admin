export interface RadiologyTest {
  id: string;
  name: string;
  description: string;
  code: string;
  category_id: string;
  sample_type_ids: string[];
  test_params: string[];
  report_time_hrs: number;
  cost_price: number;
  selling_price: number;
  preparation_instructions: string[];
  precautions: string[];
  is_fasting_reqd: boolean;
  in_person_visit_reqd: boolean;
  is_featured_lab_test: boolean;
  is_home_collection_available: boolean;
  is_active: boolean;
  image_url: string;
  is_deleted: boolean;
  created_by: string;
  updated_by: string;
  modality_type_id: string;
  inspection_parts_ids: string[];
  related_lab_test_ids: string[];
  average_discount_percentage?: string;
  duration_range?: string;
}

export interface CreateRadiologyTestPayload {
  name: string;
  description: string;
  code: string;
  category_id: string;
  sample_type_ids: string[];
  test_params: string[];
  report_time_hrs: number;
  cost_price: number;
  selling_price: number;
  preparation_instructions: string[];
  precautions: string[];
  is_fasting_reqd: boolean;
  in_person_visit_reqd: boolean;
  is_featured_lab_test: boolean;
  is_home_collection_available: boolean;
  is_active: boolean;
  image_url: string;
  modality_type_id: string;
  inspection_parts_ids: string[];
  related_lab_test_ids: string[];
}

export interface UpdateRadiologyTestPayload {
  id: string;
  name: string;
  description: string;
  code: string;
  category_id: string;
  sample_type_ids?: string[];
  test_params?: string[];
  report_time_hrs: number;
  cost_price: number;
  selling_price: number;
  preparation_instructions: string[];
  precautions?: string[];
  is_fasting_reqd: boolean;
  in_person_visit_reqd: boolean;
  is_featured_lab_test: boolean;
  is_home_collection_available: boolean;
  is_active: boolean;
  image_url: string;
  modality_type_id?: string;
  inspection_parts_ids?: string[];
  related_lab_test_ids: string[];
}
