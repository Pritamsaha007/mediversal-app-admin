"use client";
import React, { useState, useEffect } from "react";
import EmailLogin from "./EmailLogin";
import { getCurrentDateTime } from "../../utils/date.utils";
import { AdminLoginCardProps } from "../../types/auth.types";
import { useAdminStore } from "@/app/store/adminStore";
import { useRouter } from "next/navigation";

import { adminLogin } from "@/app/service/api/adminAuth";

import { toast } from "react-hot-toast";

const AdminLoginCard: React.FC<AdminLoginCardProps> = ({ className = "" }) => {
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());
  const router = useRouter();
  const setAdminData = useAdminStore((state) => state.setAdminData);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAdminLogin = async (email: string, password: string) => {
    try {
      toast.loading("Logging in...", { id: "admin-login" });
      const response = await adminLogin({ email, password });
      setAdminData(response);
      toast.success("Login successful", { id: "admin-login" });
      router.push("/admin/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "Login failed", { id: "admin-login" });
    }
  };

  return (
    <div className={`w-150  bg-white rounded-2xl shadow-lg p-8 ${className}`}>
      <div className="flex justify-between items-start mb-14">
        <h2 className="text-3xl font-bold text-[#0088B1]">Admin Login</h2>
        <div className="text-right text-sm text-gray-600">
          <div className="font-medium">
            {currentDateTime.date} | {currentDateTime.time}
          </div>
        </div>
      </div>
      <EmailLogin onLogin={handleAdminLogin} />
    </div>
  );
};

export default AdminLoginCard;
