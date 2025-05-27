"use client";
import React, { useState, useEffect } from "react";
import TabSwitch from "./TabSwitch";
import EmailLogin from "./EmailLogin";
import MobileLogin from "./MobileLogin";
import { getCurrentDateTime } from "../../utils/date.utils";
import { LoginCardProps } from "../../types/auth.types";

const LoginCard: React.FC<LoginCardProps> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState<"email" | "mobile">("email");
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());

  // Update date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleEmailLogin = (email: string, password: string) => {
    console.log("Email Login:", { email, password });
    // Handle email login logic here
    // You can integrate with your authentication API
  };

  const handleSendOTP = (mobile: string, countryCode: string) => {
    console.log("Send OTP:", { mobile, countryCode });
    setIsOTPSent(true);
    // Handle send OTP logic here
    // You can integrate with your SMS service
  };

  const handleMobileLogin = (otp: string) => {
    console.log("Mobile Login with OTP:", otp);
    // Handle mobile login logic here
    // You can verify OTP with your backend
  };

  const handleResendOTP = () => {
    console.log("Resend OTP");
    // Handle resend OTP logic here
  };

  const handleTabChange = (tab: "email" | "mobile") => {
    setActiveTab(tab);
    setIsOTPSent(false); // Reset OTP state when switching tabs
  };

  return (
    <div className={`w-150 bg-white rounded-2xl shadow-lg p-8 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-14">
        <h2 className="text-3xl font-bold text-[#0088B1]">Login</h2>
        <div className="text-right text-sm text-gray-600">
          <div className="text-right text-sm text-gray-600">
            <div className="font-medium">
              {currentDateTime.date} | {currentDateTime.time}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switch */}
      <TabSwitch activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Login Forms */}
      {activeTab === "email" ? (
        <EmailLogin onLogin={handleEmailLogin} />
      ) : (
        <MobileLogin
          onSendOTP={handleSendOTP}
          onLogin={handleMobileLogin}
          onResendOTP={handleResendOTP}
          isOTPSent={isOTPSent}
        />
      )}
    </div>
  );
};

export default LoginCard;
