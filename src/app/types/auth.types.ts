export interface LoginCardProps {
  className?: string;
}

export interface TabSwitchProps {
  activeTab: "email" | "mobile";
  onTabChange: (tab: "email" | "mobile") => void;
}

export interface AdminLoginCardProps {
  className?: string;
}

export interface EmailLoginProps {
  onLogin: (email: string, password: string) => void;
}
export interface LoginCardProps {
  className?: string;
}

export interface MobileLoginProps {
  onSendOTP: (mobile: string, countryCode: string) => void;
  onLogin: (otp: string) => void;
  onResendOTP: () => void;
  isOTPSent: boolean;
}

export interface CountryCodePickerProps {
  value: string;
  onChange: (code: string) => void;
}

export interface OTPInputProps {
  value: string[];
  onChange: (otp: string[]) => void;
}

export interface ResendTimerProps {
  onResend: () => void;
}

export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}
export interface CouponItem {
  id: number;
  coupon_name: string;
  coupon_code: string;
  discount_type: "fixed" | "percentage"; // Assuming these are the two possible values
  discount_value: string; // Could also be number if you parse it
  minimum_order_value: string; // Could also be number if you parse it
  start_date: string; // ISO date string
  expiry_date: string; // ISO date string
  uses_limit: number | null;
  category: string;
  description: string;
  status: "active" | "inactive" | "expired";
  is_for_first_time_user: 0 | 1;
  is_for_comeback_user: 0 | 1;
  is_for_loyal_user: 0 | 1;
  is_for_birthday_user: 0 | 1;
  is_general_coupon: 0 | 1;
  is_for_new_customer: 0 | 1;
  is_for_existing_customer: 0 | 1;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
export interface AddCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (coupon: CouponItem) => void;
  editItem?: CouponItem | null;
  mode: "add" | "edit";
}
