"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, Plus, ImagePlus, Clock, Search, Loader2 } from "lucide-react";
import {
  BlogAPI,
  BlogFormData,
  BlogFormSection,
  BlogModalMode,
  BlogModalStep,
  DoctorOption,
} from "../types/types";
import { searchDoctors } from "../services/blogService";
import { useAdminStore } from "@/app/store/adminStore";
import { uploadFile } from "@/app/admin/dashboard/lab_tests/services";
import { fileToBase64 } from "@/app/utils/functions";

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: BlogModalMode;
  initialData?: BlogAPI;
  onSubmit: (data: BlogFormData) => Promise<void>;
  loading?: boolean;
}

const emptySection = (): BlogFormSection => ({
  id: crypto.randomUUID(),
  subtitle: "",
  content: "",
});

const defaultForm = (): BlogFormData => ({
  title: "",
  description: "",
  doctorId: null,
  doctorName: "",
  estimatedReadTime: "",
  publishDate: "",
  coverImageUrl: "",
  sections: [emptySection()],
  active: false,
});

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const BlogModal: React.FC<BlogModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  loading = false,
}) => {
  const { token } = useAdminStore();
  const [step, setStep] = useState<BlogModalStep>("basic");
  const [formData, setFormData] = useState<BlogFormData>(defaultForm());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorResults, setDoctorResults] = useState<DoctorOption[]>([]);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const doctorRef = useRef<HTMLDivElement>(null);
  const debouncedDoctorSearch = useDebounce(doctorSearch, 400);
  const FOLDER_PATH = "simran/blogs/cover-images";
  const getBucketName = () => {
    const bucket =
      process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_DEV
        : process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_PROD;
    if (!bucket) throw new Error("AWS bucket name not configured");
    return bucket;
  };

  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  const handleCoverImageUpload = async (file: File) => {
    setImageUploadError(null);
    setImageUploading(true);
    setImageFileName(file.name);
    try {
      const objectUrl = URL.createObjectURL(file);
      const base64 = await fileToBase64(objectUrl);
      URL.revokeObjectURL(objectUrl);
      const res = await uploadFile(token, {
        bucketName: getBucketName(),
        folderPath: FOLDER_PATH,
        fileName: `cover-${Date.now()}-${file.name}`,
        fileContent: base64,
      });
      if (!res.success) throw new Error("Upload failed");
      setFormData((prev) => ({ ...prev, coverImageUrl: res.result }));
    } catch (err: any) {
      setImageUploadError(err?.message || "Image upload failed");
      setImageFileName(null);
      setFormData((prev) => ({ ...prev, coverImageUrl: "" }));
    } finally {
      setImageUploading(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (doctorRef.current && !doctorRef.current.contains(e.target as Node)) {
        setShowDoctorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isOpen || !token) return;
    setDoctorLoading(true);
    searchDoctors(debouncedDoctorSearch, token)
      .then((doctors) => {
        setDoctorResults(doctors);
        setShowDoctorDropdown(true);
      })
      .catch(() => setDoctorResults([]))
      .finally(() => setDoctorLoading(false));
  }, [debouncedDoctorSearch, isOpen, token]);

  useEffect(() => {
    if (!isOpen) {
      setStep("basic");
      return;
    }
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        doctorId: initialData.doctor_id ?? null,
        doctorName: initialData.doctor_name || "",
        estimatedReadTime: initialData.estimated_read_time_mins,
        publishDate: initialData.published_at?.split("T")[0] || "",
        coverImageUrl: initialData.image_url?.[0] || "",
        sections: initialData.sections?.length
          ? initialData.sections.map((s) => ({
              id: crypto.randomUUID(),
              subtitle: s.heading,
              content: s.content,
            }))
          : [emptySection()],
        active: initialData.is_active,
      });
      setDoctorSearch(initialData.doctor_name || "");
      setImageFileName(
        initialData.image_url?.[0]
          ? initialData.image_url[0].split("/").pop() || "Cover image"
          : null,
      );
      setImageUploadError(null);
    } else {
      setFormData(defaultForm());
      setDoctorSearch("");
      setImageFileName(null);
      setImageUploadError(null);
    }
    setStep("basic");
    setShowDoctorDropdown(false);
  }, [isOpen, mode, initialData]);

  const handleSectionChange = (
    id: string,
    field: "subtitle" | "content",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === id ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const handleAddSection = () =>
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, emptySection()],
    }));

  const handleRemoveSection = (id: string) =>
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));

  const handleReset = () => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        doctorId: initialData.doctor_id ?? null,
        doctorName: initialData.doctor_name || "",
        estimatedReadTime: initialData.estimated_read_time_mins,
        publishDate: initialData.published_at?.split("T")[0] || "",
        coverImageUrl: initialData.image_url?.[0] || "",
        sections: initialData.sections?.map((s) => ({
          id: crypto.randomUUID(),
          subtitle: s.heading,
          content: s.content,
        })) || [emptySection()],
        active: initialData.is_active,
      });
      setDoctorSearch(initialData.doctor_name || "");
      setImageFileName(
        initialData.image_url?.[0]
          ? initialData.image_url[0].split("/").pop() || "Cover image"
          : null,
      );
      setImageUploadError(null);
    } else {
      setFormData(defaultForm());
      setDoctorSearch("");
      setImageFileName(null);
      setImageUploadError(null);
    }
    setStep("basic");
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const selectDoctor = (doctor: DoctorOption) => {
    setFormData((prev) => ({
      ...prev,
      doctorId: doctor.id,
      doctorName: doctor.name,
    }));
    setDoctorSearch(doctor.name);
    setShowDoctorDropdown(false);
  };

  if (!isOpen) return null;
  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            {isEdit ? "Update Blog:" : "Create New Blog"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#899193] hover:text-[#161D1F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex mx-6 mb-4 rounded-lg overflow-hidden border border-[#E5E8E9] flex-shrink-0">
          {(["basic", "sections"] as BlogModalStep[]).map((s) => (
            <button
              key={s}
              className={`flex-1 py-2 text-[12px] font-medium transition-colors ${
                step === s
                  ? "bg-[#0088B1] text-white"
                  : "bg-white text-[#899193]"
              }`}
              onClick={() => setStep(s)}
            >
              {s === "basic" ? "Basic Information" : "Blog Sections"}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-6">
          {step === "basic" ? (
            <div className="space-y-4 pb-4">
              <div>
                <label className="block text-[12px] text-[#161D1F] mb-1">
                  * Cover Image URL
                </label>
                <div
                  className="border-2 border-dashed border-[#E5E8E9] rounded-lg p-5 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#0088B1] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-7 h-7 animate-spin text-[#0088B1]" />
                      <p className="text-[12px] text-[#0088B1] font-medium">
                        Uploading image…
                      </p>
                    </div>
                  ) : formData.coverImageUrl ? (
                    <>
                      <img
                        src={formData.coverImageUrl}
                        alt="cover"
                        className="h-14 w-auto object-contain"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                      <p className="text-[12px] text-[#161D1F] font-medium mt-1">
                        {imageFileName || "Cover image uploaded"}
                      </p>
                      <p className="text-[10px] text-[#899193]">
                        Click to change
                      </p>
                      {imageUploadError && (
                        <p className="text-[12px] text-red-500">
                          {imageUploadError}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-7 h-7 text-[#899193]" />
                      <p className="text-[12px] font-medium text-[#161D1F]">
                        * Upload Blog Cover Image
                      </p>
                      <p className="text-[10px] text-[#899193]">
                        Drag and drop or click to browse
                      </p>
                      <p className="text-[10px] text-[#899193]">
                        (supported file format .jpg, .jpeg, .png)
                      </p>
                      <button
                        type="button"
                        className="mt-1 px-3 py-1 border border-gray-300 rounded text-[12px] text-[#161D1F] hover:bg-gray-50"
                      >
                        Select File
                      </button>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCoverImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-[#161D1F] mb-1">
                  * Title
                </label>
                <input
                  type="text"
                  placeholder="Please provide a suitable blog title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#161D1F] mb-1">
                  * Short Description
                </label>
                <textarea
                  placeholder="Brief about the blog post"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1" ref={doctorRef}>
                  <label className="block text-[12px] text-[#161D1F] mb-1">
                    * Author (Doctor)
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search doctor name..."
                      value={doctorSearch}
                      onChange={(e) => {
                        setDoctorSearch(e.target.value);
                        if (!e.target.value) {
                          setFormData((prev) => ({
                            ...prev,
                            doctorId: null,
                            doctorName: "",
                          }));
                        }
                        setShowDoctorDropdown(true);
                      }}
                      onFocus={() => setShowDoctorDropdown(true)}
                      className="w-full pl-8 pr-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
                    />
                    {doctorLoading && (
                      <Loader2 className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0088B1] animate-spin" />
                    )}
                    {showDoctorDropdown && doctorResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#E5E8E9] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {doctorResults.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => selectDoctor(doc)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-[#E8F4F7] transition-colors"
                          >
                            {doc.profile_image_url && (
                              <img
                                src={doc.profile_image_url}
                                alt={doc.name}
                                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                              />
                            )}
                            <div>
                              <p className="text-[12px] text-[#161D1F] font-medium">
                                {doc.name}
                              </p>
                              {doc.specializations && (
                                <p className="text-[10px] text-[#899193]">
                                  {doc.specializations}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {showDoctorDropdown &&
                      !doctorLoading &&
                      doctorResults.length === 0 &&
                      doctorSearch && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#E5E8E9] rounded-lg shadow-lg px-3 py-2">
                          <p className="text-[12px] text-[#899193]">
                            No doctors found
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-[12px] text-[#161D1F] mb-1">
                    * Read Time (min.)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      value={formData.estimatedReadTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedReadTime:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2.5 pr-8 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
                    />
                    <Clock className="w-4 h-4 text-[#899193] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-[#161D1F] mb-1">
                  * Publish Date
                </label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) =>
                    setFormData({ ...formData, publishDate: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              <p className="text-[12px] text-[#161D1F] font-medium">
                Blog Section{" "}
                <span className="text-[#899193] font-normal">
                  (Subtitle + Content)
                </span>
              </p>

              {formData.sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="border border-dashed border-[#0088B1] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] font-semibold text-[#0088B1]">
                      Section {idx + 1}
                    </p>
                    {formData.sections.length > 1 && (
                      <button
                        onClick={() => handleRemoveSection(section.id)}
                        className="text-[#899193] hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="block text-[12px] text-[#161D1F] mb-1">
                      * Blog Subtitle
                    </label>
                    <input
                      type="text"
                      placeholder="Please provide a suitable subtitle"
                      value={section.subtitle}
                      onChange={(e) =>
                        handleSectionChange(
                          section.id,
                          "subtitle",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#161D1F] mb-1">
                      * Content
                    </label>
                    <textarea
                      placeholder="Write section content..."
                      value={section.content}
                      onChange={(e) =>
                        handleSectionChange(
                          section.id,
                          "content",
                          e.target.value,
                        )
                      }
                      rows={4}
                      className="w-full px-3 py-2.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] resize-none"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddSection}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#0088B1] rounded-lg text-[12px] text-[#0088B1] hover:bg-[#E8F4F7] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Another Section
              </button>

              <div
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                  formData.active
                    ? "border-[#0088B1] bg-[#E8F4F7]"
                    : "border-[#E5E8E9] bg-white"
                }`}
                onClick={() =>
                  setFormData({ ...formData, active: !formData.active })
                }
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                    formData.active
                      ? "bg-[#0088B1] border-[#0088B1]"
                      : "border-gray-300"
                  }`}
                >
                  {formData.active && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-[12px] font-medium text-[#161D1F]">
                    Active Blog
                  </p>
                  <p className="text-[10px] text-[#899193]">
                    Inactive blogs would not be displayed at website
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E5E8E9] flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleReset}
            disabled={loading || imageUploading}
            className="text-[12px] text-[#161D1F] hover:underline"
          >
            Reset
          </button>
          {step === "basic" ? (
            <button
              onClick={() => setStep("sections")}
              className="px-5 py-2 bg-[#0088B1] text-white text-[12px] rounded-lg hover:bg-[#00729A] transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-[#0088B1] text-white text-[12px] rounded-lg hover:bg-[#00729A] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEdit ? "Update Blog" : "Create Blog"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogModal;
