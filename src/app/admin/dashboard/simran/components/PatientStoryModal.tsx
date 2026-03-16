"use client";

import { useEffect, useRef, useState } from "react";
import { X, ImagePlus } from "lucide-react";
import { PatientStory } from "../services";

// Indian states list
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

interface PatientStoryModalProps {
  mode: "add" | "edit";
  initialData?: PatientStory | null;
  onClose: () => void;
  onSubmit: (payload: {
    id: string | null;
    customer_name: string;
    city: string;
    state: string;
    feedback: string;
    profile_pic_url: string;
    is_active: boolean;
    is_deleted: boolean;
    feedback_date: string;
  }) => Promise<void>;
}

export default function PatientStoryModal({
  mode,
  initialData,
  onClose,
  onSubmit,
}: PatientStoryModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customerName, setCustomerName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [feedback, setFeedback] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [feedbackDate, setFeedbackDate] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate on edit
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setCustomerName(initialData.customer_name);
      setCity(initialData.city);
      setState(initialData.state);
      setFeedback(initialData.feedback);
      setProfilePicUrl(initialData.profile_pic_url);
      setPreviewUrl(initialData.profile_pic_url || null);
      setFileName(
        initialData.profile_pic_url
          ? initialData.profile_pic_url.split("/").pop() || null
          : null,
      );
      // Convert ISO date to YYYY-MM-DD for input
      setFeedbackDate(
        initialData.feedback_date ? initialData.feedback_date.slice(0, 10) : "",
      );
      setIsActive(initialData.is_active);
    } else {
      resetFields();
    }
  }, [mode, initialData]);

  const resetFields = () => {
    setCustomerName("");
    setCity("");
    setState("");
    setFeedback("");
    setProfilePicUrl("");
    setPreviewUrl(null);
    setFileName(null);
    setFeedbackDate("");
    setIsActive(false);
    setErrors({});
  };

  const handleFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      setProfilePicUrl(result); // In production replace with upload URL
    };
    reader.readAsDataURL(file);
    if (errors.profile_pic_url)
      setErrors((p) => ({ ...p, profile_pic_url: "" }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!customerName.trim()) e.customerName = "Patient name is required";
    if (!feedbackDate) e.feedbackDate = "Review date is required";
    if (!city.trim()) e.city = "City is required";
    if (!state) e.state = "State is required";
    if (!feedback.trim()) e.feedback = "Feedback is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      await onSubmit({
        id: mode === "edit" && initialData ? initialData.id : null,
        customer_name: customerName.trim(),
        city: city.trim(),
        state,
        feedback: feedback.trim(),
        profile_pic_url: profilePicUrl,
        is_active: isActive,
        is_deleted: false,
        feedback_date: feedbackDate
          ? new Date(feedbackDate).toISOString()
          : new Date().toISOString(),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl mx-4 p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#899193] hover:text-[#161D1F] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-[16px] font-semibold text-[#161D1F] mb-5">
          {mode === "add" ? "Add Patient Review" : "Update Patient Review"}
        </h2>

        <div className="space-y-4">
          {/* Image Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`w-full rounded-xl border-2 border-dashed px-6 py-8 flex flex-col items-center gap-2 transition cursor-pointer ${
              dragging
                ? "border-[#0088B1] bg-[#EBF7FB]"
                : "border-gray-300 bg-white"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="preview"
                  className="h-16 w-16 rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewUrl(null);
                    setFileName(null);
                    setProfilePicUrl("");
                  }}
                  className="absolute -top-1 -right-1 rounded-full bg-white border border-gray-200 p-0.5 text-gray-400 hover:text-red-500 shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <ImagePlus
                className="h-10 w-10 text-gray-400"
                strokeWidth={1.5}
              />
            )}

            {fileName ? (
              <p className="text-[13px] font-medium text-[#161D1F]">
                {fileName}
              </p>
            ) : (
              <p className="text-[13px] font-semibold text-[#161D1F]">
                <span className="text-red-500">* </span>Upload Patient Image
              </p>
            )}

            <p className="text-[12px] text-[#899193] text-center">
              Drag and drop your new image here or click to browse
              <br />
              <span className="italic">
                (supported file format .jpg, .jpeg, .png)
              </span>
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-1 rounded-lg border border-gray-300 px-5 py-1.5 text-[12px] font-medium text-[#161D1F] hover:bg-gray-50 transition"
            >
              Select File
            </button>
          </div>

          {/* 2-col: Patient Name + Review Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-1">
                * Patient Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName)
                    setErrors((p) => ({ ...p, customerName: "" }));
                }}
                placeholder="Sarah Johnson"
                className={`w-full border rounded-lg px-3 py-2 text-[12px] text-[#161D1F] placeholder:text-[#899193] focus:outline-none focus:ring-1 focus:ring-[#0088B1] ${
                  errors.customerName ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.customerName && (
                <p className="mt-1 text-[11px] text-red-500">
                  {errors.customerName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-1">
                * Review Date
              </label>
              <input
                type="date"
                value={feedbackDate}
                onChange={(e) => {
                  setFeedbackDate(e.target.value);
                  if (errors.feedbackDate)
                    setErrors((p) => ({ ...p, feedbackDate: "" }));
                }}
                className={`w-full border rounded-lg px-3 py-2 text-[12px] text-[#161D1F] focus:outline-none focus:ring-1 focus:ring-[#0088B1] ${
                  errors.feedbackDate ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.feedbackDate && (
                <p className="mt-1 text-[11px] text-red-500">
                  {errors.feedbackDate}
                </p>
              )}
            </div>
          </div>

          {/* 2-col: City + State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-1">
                * Location (City/Town)
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors((p) => ({ ...p, city: "" }));
                }}
                placeholder="Enter Patient Location"
                className={`w-full border rounded-lg px-3 py-2 text-[12px] text-[#161D1F] placeholder:text-[#899193] focus:outline-none focus:ring-1 focus:ring-[#0088B1] ${
                  errors.city ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-[11px] text-red-500">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-1">
                * State
              </label>
              <div className="relative">
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    if (errors.state) setErrors((p) => ({ ...p, state: "" }));
                  }}
                  className={`w-full border rounded-lg px-3 py-2 text-[12px] text-[#161D1F] bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#0088B1] ${
                    errors.state ? "border-red-400" : "border-gray-300"
                  } ${!state ? "text-[#899193]" : ""}`}
                >
                  <option value="">Choose State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg
                    className="h-4 w-4 text-[#899193]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              {errors.state && (
                <p className="mt-1 text-[11px] text-red-500">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-[12px] font-medium text-[#161D1F] mb-1">
              * Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                if (errors.feedback) setErrors((p) => ({ ...p, feedback: "" }));
              }}
              placeholder="Short brief about the patient review..."
              rows={5}
              className={`w-full border rounded-lg px-3 py-2 text-[12px] text-[#161D1F] placeholder:text-[#899193] focus:outline-none focus:ring-1 focus:ring-[#0088B1] resize-none ${
                errors.feedback ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.feedback && (
              <p className="mt-1 text-[11px] text-red-500">{errors.feedback}</p>
            )}
          </div>

          {/* Active Review checkbox */}
          <div>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition ${
                isActive
                  ? "border-[#0088B1] bg-[#EBF7FB]"
                  : "border-gray-300 bg-white"
              }`}
            >
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`h-4 w-4 rounded flex items-center justify-center border-2 transition ${
                    isActive
                      ? "border-[#0088B1] bg-[#0088B1]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isActive && (
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#161D1F]">
                  Active Review
                </p>
                <p className="text-[11px] text-[#899193]">
                  Inactive reviews would not be displayed at website
                </p>
              </div>
            </label>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetFields}
              disabled={submitting}
              className="px-4 py-2 text-[12px] border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 text-[12px] bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {submitting && (
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {submitting
                ? "Saving..."
                : mode === "add"
                  ? "Add Review"
                  : "Update Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
