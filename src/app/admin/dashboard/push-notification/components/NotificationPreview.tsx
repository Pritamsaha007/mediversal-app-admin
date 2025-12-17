"use client";
import React, { useState } from "react";
import Image from "next/image";
import logo from "../../../../../../public/logo.svg";
import { NotificationFormData } from "../types/types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface NotificationPreviewProps {
  formData: NotificationFormData;
  imagePreviewUrl: string | null;
}

const NotificationPreview: React.FC<NotificationPreviewProps> = ({
  formData,
  imagePreviewUrl,
}) => {
  const [platform, setPlatform] = useState<"android" | "ios">("android");
  const [darkMode, setDarkMode] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const bg = darkMode ? "bg-[#0F172A]" : "bg-[#F9FAFB]";
  const card = darkMode ? "bg-[#020617] text-white" : "bg-white text-[#161D1F]";

  return (
    <div className="bg-[#02c1f0] rounded-xl p-4 space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setPlatform("android")}
            className={`px-3 py-1 text-xs rounded-full ${
              platform === "android"
                ? "bg-[#0088B1] text-white"
                : "bg-white text-gray-600"
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setPlatform("ios")}
            className={`px-3 py-1 text-xs rounded-full ${
              platform === "ios"
                ? "bg-[#0088B1] text-white"
                : "bg-white text-gray-600"
            }`}
          >
            iOS
          </button>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1 text-xs rounded-full bg-black text-white"
        >
          {darkMode ? "Light" : "Dark"} Mode
        </button>
      </div>

      {/* Phone */}
      <div className="mx-auto max-w-[280px] bg-black rounded-[32px] p-3 shadow-xl">
        <div className={`${bg} rounded-[24px] h-[430px] overflow-hidden`}>
          {/* Status Bar */}
          <div
            className={`flex justify-between px-4 py-2 text-[10px] ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <span>9:41</span>
            <span>{platform === "ios" ? "🔋" : "📶 🔋"}</span>
          </div>

          {/* Notification */}
          <div className="px-3 mt-3">
            <div className={`${card} rounded-2xl shadow-sm p-3 space-y-2`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0088B1] rounded-full flex items-center justify-center">
                  <Image src={logo} alt="logo" width={18} height={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[#0088B1]">
                    Mediversal 247
                  </div>
                  <div className="text-[9px] opacity-60">now</div>
                </div>
                <button onClick={() => setExpanded(!expanded)}>
                  {expanded ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
              </div>

              <div className="text-sm font-semibold line-clamp-2">
                {formData.title || "Notification title"}
              </div>

              <div
                className={`text-xs opacity-80 ${
                  expanded ? "line-clamp-none" : "line-clamp-2"
                }`}
              >
                {formData.message ||
                  "Notification message will appear here for preview."}
              </div>

              {imagePreviewUrl && expanded && (
                <div className="rounded-xl overflow-hidden mt-2">
                  <img
                    src={imagePreviewUrl}
                    alt="media"
                    className="w-full h-28 object-cover"
                  />
                </div>
              )}

              {/* Action Buttons */}
              {expanded && (
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-[#0088B1] text-white">
                    View
                  </button>
                  <button
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${
                      darkMode
                        ? "border-gray-600 text-gray-300"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[9px] text-gray-500">
        Live preview — platform, theme & expansion supported
      </p>
    </div>
  );
};

export default NotificationPreview;
