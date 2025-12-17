"use client";
import React from "react";
import { NotificationFormData } from "../types/types";
import { CircleDotIcon } from "lucide-react";
import Image from "next/image";
import logo from "../../../../../../public/logo.svg";

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

      <div className="bg-white rounded-2xl p-4 mx-auto max-w-sm h-80">
        {/* Phone Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100"></div>

        {/* Notification Content */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-[#0088B1] rounded-full flex items-center justify-center">
              <Image src={logo} alt="Mediversal" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-semibold text-[#0088B1]">
                  Mediversal 247
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
            <button className="flex-shrink-0 text-gray-400 hover:text-gray-600"></button>
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
