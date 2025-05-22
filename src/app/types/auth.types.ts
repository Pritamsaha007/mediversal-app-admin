export interface LoginCardProps {
  className?: string;
}

export interface TabSwitchProps {
  activeTab: "email" | "mobile";
  onTabChange: (tab: "email" | "mobile") => void;
}

export interface EmailLoginProps {
  onLogin: (email: string, password: string) => void;
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
