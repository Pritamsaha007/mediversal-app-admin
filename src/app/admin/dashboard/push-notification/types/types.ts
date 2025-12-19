export interface CustomScheduleDay {
  [day: string]: string[];
}

export interface Notification {
  id: string;
  notification_type: string;
  customer_id: string;
  targeted_users_id: string;
  targeted_user_group_code: string;
  targeted_user_group_value: string;
  message_title: string;
  message_body: string;
  app_uri?: string;
  image_url: string;
  schedule_id: string;
  frequency_type_id: string;
  frequency_code: string;
  frequency_value: string;
  notification_time: string;
  start_date: string;
  end_date: string;
  days_selected: { id: string; value: string }[] | null;
  custom_schedule: CustomScheduleDay[] | null;
  status: "LIVE" | "SCHEDULED" | "COMPLETED" | "INACTIVE";
}

export interface SearchNotificationParams {
  search_text?: string | null;
  p_notification_queue_id?: string | null;
  p_customer_id?: string | null;
  p_status?: string | null;
  limit_count: number;
  offset_count: number;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
}

export interface NotificationFilters {
  status: string;
  userGroup: string;
}

export interface EnumItem {
  id: string;
  slno: number;
  code: string;
  value: string;
  description: string | null;
  metadata: any | null;
}

export interface EnumResponse {
  success: boolean;
  roles: EnumItem[];
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  city: string;
  state: string;
  country: string;
  last_logged_in_at: string;
  membership_date: string;
  gender: string;
  birthday: string;
  age: {
    years: number;
    months: number;
    days: number;
  };
  status: string;
  total_spent: number | null;
  total_orders: string;
}

export interface CustomerSearchResponse {
  success: boolean;
  customers: Customer[];
}

export interface CreateNotificationPayload {
  queue_id?: string | null;
  is_enabled: boolean;
  is_deleted: boolean;
  notification_type: "BROADCAST" | "UNICAST";
  customer_id: string;
  targeted_users_id: string;
  message_title: string;
  message_body: string;
  app_uri?: string;
  image_url: string;
  schedule_id?: string | null;
  frequency_type_id: string;
  notification_time: string | null;
  start_date: string;
  end_date: string | null;
  day_id: string[];
  custom_schedule: CustomSchedulePayload | null;
}

export interface CustomSchedulePayload {
  schedule: Array<{ [key: string]: string[] }>;
}

export interface NotificationFormData {
  title: string;
  message: string;
  targetUserGroup: string;
  targetUserGroupId: string;
  selectedCustomer: Customer | null;
  appUri?: string;
  imageFile: File | null;
  imageUrl: string;
  frequencyType: string;
  frequencyTypeId: string;
  startDate: string;
  endDate: string;
  notificationTime: string;
  selectedDays: string[];
  customSchedule: { [dayId: string]: string[] };
}
