"use client";
import React, { useState } from "react";
import LoginCard from "../components/auth/LoginCard";
import AdminLoginCard from "../components/auth/AdminLoginCard";
import Image from "next/image";
import Vector1 from "../../../public/Vector1.svg";

export default function LoginScreen() {
  const [mode, setMode] = useState<"user" | "admin">("user");

  const handleModeToggle = () => {
    setMode((prev) => (prev === "user" ? "admin" : "user"));
  };

  return (
    <div className="w-screen h-screen bg-[#E8E8E8] flex flex-col lg:flex-row overflow-hidden relative">
      {/* SVG Background Image */}
      <Image
        src={Vector1}
        alt="Background"
        fill
        className="object-bottom opacity-10 z-0 bg-[#0088B1]"
        priority
      />

      {/* Toggle Button (Top Right) */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleModeToggle}
          className="bg-[#0088B1] text-white border border-[#0088B1] rounded-md px-4 py-1 text-sm font-semibold shadow hover:bg-white hover:text-[#0088B1] transition"
        >
          {mode === "user" ? "Admin Login" : "User Login"}
        </button>
      </div>

      {/* Foreground Content */}
      <div className="w-full flex flex-col items-center justify-center text-center p-4 lg:p-8 relative z-10">
        <h3 className="text-lg sm:text-xl lg:text-2xl mb-2 text-black">
          Welcome to the
        </h3>
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-2 text-[#0088B1]">
          Mediversal Healthcare
        </h1>
        <h3 className="text-lg sm:text-xl lg:text-2xl mb-8 text-black">
          App Management Panel
        </h3>

        {/* Conditional Login Component */}
        {mode === "user" ? <LoginCard /> : <AdminLoginCard />}
      </div>
    </div>
  );
}
