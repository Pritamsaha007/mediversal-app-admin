"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface EmailLoginProps {
  onLogin: (email: string, password: string) => void;
}

const EmailLogin: React.FC<EmailLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes("@")) {
      const [localPart] = value.split("@");
      setEmail(localPart + "@mediversal.in");
    } else {
      setEmail(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="relative">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            className="w-full px-4 py-3 border text-[#B0B6B8] bg-[#F8F8F8] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
            required
          />
          {email && !email.includes("@") && (
            <span className="absolute right-3 top-3 text-[#0088B1] font-medium">
              @mediversal.in
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 text-[#B0B6B8] border bg-[#F8F8F8] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent pr-12"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-[#0088B1] text-white py-3 rounded-lg hover:bg-[#0088B1]/90 transition-colors font-medium"
      >
        Login
      </button>
    </form>
  );
};

export default EmailLogin;
