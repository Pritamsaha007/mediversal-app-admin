"use client";
import React, { useState } from "react";

interface NotificationFormData {
  title: string;
  message: string;
}

interface NotificationPreviewProps {
  formData: NotificationFormData;
  imagePreviewUrl: string | null;
}

const NotificationPreview: React.FC<NotificationPreviewProps> = ({
  formData,
  imagePreviewUrl,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full space-y-2 border border-gray-400 bg-gray-300 rounded-xl p-4 h-full">
      {/* State Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-full bg-gray-800/60 p-0.5 backdrop-blur">
          <button
            onClick={() => setExpanded(false)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-200
        ${
          !expanded
            ? "bg-[#0088B1] text-white shadow"
            : "text-gray-300 hover:text-white"
        }`}
          >
            Initial
          </button>
          <button
            onClick={() => setExpanded(true)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-200
        ${
          expanded
            ? "bg-[#0088B1] text-white shadow"
            : "text-gray-300 hover:text-white"
        }`}
          >
            Expanded
          </button>
        </div>
      </div>

      <div className="text-left text-gray-800 font-medium text-[10px]">
        Android
      </div>
      {/* Notifications Preview - Stacked Vertically */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Android Notification */}
        <div className="space-y-2">
          <div className="bg-white rounded-t-[40px] shadow-xl overflow-hidden">
            {/* Notification Card */}
            <div className="bg-white px-2 pb-1 pt-6">
              <div className="bg-gray-900 rounded-t-2xl p-5 shadow-xl">
                {!expanded ? (
                  <>
                    <div className="text-white font-medium text-[12px] leading-snug mb-1">
                      {formData.title || "Notification title"}
                    </div>
                    <div className="text-gray-300/90 text-[10px] leading-tight">
                      {formData.message ||
                        "Short preview of the notification message goes here"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-white font-medium text-[12px] leading-snug mb-1">
                      {formData.title || "Notification title"}
                    </div>
                    <div className="text-gray-300/90 text-[10px] mb-2 leading-tight">
                      {formData.message ||
                        "This is how your full notification message will appear when expanded by the user."}
                    </div>
                    {imagePreviewUrl && (
                      <div className="rounded-md overflow-hidden">
                        <img
                          src={imagePreviewUrl}
                          alt="media"
                          className="w-full h-36 object-cover"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-left text-gray-800 font-medium text-[10px]">
          iOS
        </div>

        {/* iOS Notification */}
        <div className="space-y-2">
          <div className="bg-white rounded-t-[40px] shadow-2xl overflow-hidden relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-gray-500 rounded-b-3xl z-20" />

            {/* Notification Card */}
            <div className="bg-gray-100 px-2 pb-1 pt-10">
              <div className="bg-gray-900 rounded-t-2xl p-5 shadow-xl">
                {!expanded ? (
                  <>
                    <div className="text-white font-medium text-[12px] leading-snug mb-1">
                      {formData.title || "Notification title"}
                    </div>
                    <div className="text-gray-300/90 text-[10px] leading-tight">
                      {formData.message ||
                        "Short preview of the notification message goes here"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-white font-medium text-[12px] leading-snug mb-1">
                      {formData.title || "Notification title"}
                    </div>
                    <div className="text-gray-300/90 text-[10px] leading-tight mb-2">
                      {formData.message ||
                        "This is how your full notification message will appear when expanded by the user."}
                    </div>
                    {imagePreviewUrl && (
                      <div className="rounded-md overflow-hidden">
                        <img
                          src={imagePreviewUrl}
                          alt="media"
                          className="w-full h-36 object-cover"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreview;
