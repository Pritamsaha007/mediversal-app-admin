"use client";
import React, { useState } from "react";
import CountryCodePicker from "./CountryCodePicker";
import OTPInput from "./OTPInput";
import ResendTimer from "./ResendTimer";

interface MobileLoginProps {
  onSendOTP: (mobile: string, countryCode: string) => void;
  onLogin: (otp: string) => void;
  onResendOTP: () => void;
  isOTPSent: boolean;
}

const MobileLogin: React.FC<MobileLoginProps> = ({
  onSendOTP,
  onLogin,
  onResendOTP,
  isOTPSent,
}) => {
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOTP] = useState(["", "", "", "", "", ""]);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    onSendOTP(mobile, countryCode);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(otp.join(""));
  };

  return (
    <div className="space-y-4">
      <div className="flex">
        <CountryCodePicker value={countryCode} onChange={setCountryCode} />
        <input
          type="tel"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="flex-1 px-4 py-3 border text-[#B0B6B8] bg-[#F8F8F8] border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent border-l-0"
          required
        />
      </div>

      {!isOTPSent ? (
        <button
          onClick={handleSendOTP}
          className="w-full bg-[#0088B1] text-white py-3 rounded-lg hover:bg-[#0088B1]/90 transition-colors font-medium"
        >
          Send OTP
        </button>
      ) : (
        <>
          <div>
            {/* <p className="text-sm text-gray-600 mb-2 text-center">
              Enter the 6-digit OTP sent to {countryCode} {mobile}
            </p> */}
            <OTPInput value={otp} onChange={setOTP} />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-[#0088B1] text-white py-3 rounded-lg hover:bg-[#0088B1]/90 transition-colors font-medium"
          >
            Login
          </button>

          <ResendTimer onResend={onResendOTP} />
        </>
      )}
    </div>
  );
};

export default MobileLogin;
