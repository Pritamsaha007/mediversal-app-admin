"use client";
import React, { useState, useEffect } from "react";

interface ResendTimerProps {
  onResend: () => void;
}

const ResendTimer: React.FC<ResendTimerProps> = ({ onResend }) => {
  const [timeLeft, setTimeLeft] = useState(50);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResend = () => {
    if (canResend) {
      setTimeLeft(50);
      setCanResend(false);
      onResend();
    }
  };

  return (
    <div className="text-center mt-4">
      {canResend ? (
        <button
          onClick={handleResend}
          className="text-[#0088B1] hover:underline text-sm"
        >
          Resend OTP
        </button>
      ) : (
        <span className="text-gray-500 text-sm">Resend OTP in {timeLeft}s</span>
      )}
    </div>
  );
};

export default ResendTimer;
