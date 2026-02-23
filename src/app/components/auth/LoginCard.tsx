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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleEmailLogin = (email: string, password: string) => {
    console.log("Email Login:", { email, password });
  };

  const handleSendOTP = (mobile: string, countryCode: string) => {
    console.log("Send OTP:", { mobile, countryCode });
    setIsOTPSent(true);
  };

  const handleMobileLogin = (otp: string) => {
    console.log("Mobile Login with OTP:", otp);
  };

  const handleResendOTP = () => {
    console.log("Resend OTP");
  };

  const handleTabChange = (tab: "email" | "mobile") => {
    setActiveTab(tab);
    setIsOTPSent(false);
  };

  return (
    <div className={`w-150 bg-white rounded-2xl shadow-lg p-8 ${className}`}>
      <div className="flex justify-between items-start mb-14">
        <h2 className="text-3xl font-bold text-[#0088B1]">Login</h2>
        <div className="text-right text-sm text-gray-600">
          <div className="text-right text-sm text-gray-600">
            <div className="font-medium" suppressHydrationWarning>
              {currentDateTime.date} | {currentDateTime.time}
            </div>
          </div>
        </div>
      </div>

      <TabSwitch activeTab={activeTab} onTabChange={handleTabChange} />

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
