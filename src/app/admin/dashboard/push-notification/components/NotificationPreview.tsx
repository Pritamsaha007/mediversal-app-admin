"use client";
import React from "react";
import { NotificationFormData } from "../types/types";

interface NotificationPreviewProps {
  formData: NotificationFormData;
  imagePreviewUrl: string | null;
}

const NotificationPreview: React.FC<NotificationPreviewProps> = ({
  formData,
  imagePreviewUrl,
}) => {
  return (
    <div className="bg-[#E8F4F7] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-[#161D1F]">
          Live Preview
        </h3>
        <div className="text-[10px] text-[#0088B1] font-medium">
          Mobile (Android + iOS)
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-4 mx-auto max-w-sm">
        {/* Phone Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              <div className="w-1 h-3 bg-[#161D1F] rounded-sm"></div>
              <div className="w-1 h-3 bg-[#161D1F] rounded-sm"></div>
              <div className="w-1 h-3 bg-[#161D1F] rounded-sm"></div>
              <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
            </div>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>

        {/* Notification Content */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-[#0088B1] rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-semibold text-[#0088B1]">
                  Mediversal 24/7
                </div>
                <div className="text-[8px] text-[#899193]">now</div>
              </div>
              <div className="text-[12px] font-semibold text-[#161D1F] mb-1 line-clamp-2">
                {formData.title || ""}
              </div>
              <div className="text-[10px] text-[#899193] line-clamp-2">
                {formData.message || ""}
              </div>
            </div>
            <button className="flex-shrink-0 text-gray-400 hover:text-gray-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Image Preview */}
          {imagePreviewUrl && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={imagePreviewUrl}
                alt="Notification preview"
                className="w-full h-32 object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-center text-[8px] text-[#899193]">
        Preview updates in real-time as you type
      </div>
    </div>
  );
};

export default NotificationPreview;
