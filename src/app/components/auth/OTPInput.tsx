"use client";
import React from "react";

interface OTPInputProps {
  value: string[];
  onChange: (otp: string[]) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange }) => {
  const handleChange = (index: number, val: string) => {
    if (val.length > 1) return;

    const newOTP = [...value];
    newOTP[index] = val;
    onChange(newOTP);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-evenly mb-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          type="text"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-10 h-10 text-center border text-[#B0B6B8] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
        />
      ))}
    </div>
  );
};

export default OTPInput;
