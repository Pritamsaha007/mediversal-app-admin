"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Staff } from "../types";
import {
  createUpdateStaff,
  CreateUpdateStaffPayload,
  fetchRoles,
  RoleApiResponse,
} from "../service/api/staff";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: Staff) => void;
  initialData?: Staff;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.name || "",
    phoneNumber: initialData?.phone || "",
    experience: initialData?.experience || "",
    specialization: "",
    role: initialData?.position || "",
    emailAddress: initialData?.email || "",
    location: initialData?.address || "",
    certifications: "",
  });

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [specializationTags, setSpecializationTags] = useState<string[]>(
    initialData?.departments || []
  );
  const [certificationTags, setCertificationTags] = useState<string[]>(
    initialData?.certifications || []
  );
  const [specializationInput, setSpecializationInput] = useState("");
  const [certificationInput, setCertificationInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [roleOptions, setRoleOptions] = useState<RoleApiResponse[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    initialData?.position || ""
  );

  // const roleOptions = [
  //   "Senior Nurse",
  //   "Staff Nurse",
  //   "Nursing Assistant",
  //   "Charge Nurse",
  //   "Clinical Specialist",
  //   "Nurse Practitioner",
  //   "Head Nurse",
  //   "ICU Nurse",
  //   "Emergency Nurse",
  //   "Physiotherapist",
  // ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.name,
        phoneNumber: initialData.phone,
        experience: initialData.experience,
        specialization: "",
        role: initialData.position,
        emailAddress: initialData.email || "",
        location: initialData.address || "",
        certifications: "",
      });
      setSpecializationTags(initialData.departments || []);
      setCertificationTags(initialData.certifications || []);
    } else {
      setFormData({
        fullName: "",
        phoneNumber: "",
        experience: "",
        specialization: "",
        role: "",
        emailAddress: "",
        location: "",
        certifications: "",
      });
      setSpecializationTags([]);
      setCertificationTags([]);
    }
  }, [initialData]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        setRoleOptions(roles);

        // If editing, find the role ID from the role name
        if (initialData?.position) {
          const matchingRole = roles.find(
            (role) => role.role_name === initialData.position
          );
          if (matchingRole) {
            setSelectedRoleId(matchingRole.id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };

    if (isOpen) {
      loadRoles();
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoleSelect = (role: RoleApiResponse) => {
    handleInputChange("role", role.role_name);
    setSelectedRoleId(role.id);
    setRoleDropdownOpen(false);
  };

  const addSpecializationTag = () => {
    if (
      specializationInput.trim() &&
      !specializationTags.includes(specializationInput.trim())
    ) {
      setSpecializationTags((prev) => [...prev, specializationInput.trim()]);
      setSpecializationInput("");
    }
  };

  const addCertificationTag = () => {
    if (
      certificationInput.trim() &&
      !certificationTags.includes(certificationInput.trim())
    ) {
      setCertificationTags((prev) => [...prev, certificationInput.trim()]);
      setCertificationInput("");
    }
  };

  const removeSpecializationTag = (tagToRemove: string) => {
    setSpecializationTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const removeCertificationTag = (tagToRemove: string) => {
    setCertificationTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    type: "specialization" | "certification"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "specialization") {
        addSpecializationTag();
      } else {
        addCertificationTag();
      }
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.fullName.trim()) {
      alert("Please enter full name");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      alert("Please enter phone number");
      return;
    }
    if (!formData.role) {
      alert("Please select a role");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Parse experience with fallbacks
      const experienceYears =
        formData.experience.match(/(\d+)\s*years?/i)?.[1] || "0";
      const experienceMonths =
        formData.experience.match(/(\d+)\s*months?/i)?.[1] || "0";

      const payload: CreateUpdateStaffPayload = {
        ...(initialData?.id ? { id: initialData.id } : {}),
        name: formData.fullName,
        mobile_number: formData.phoneNumber,
        role: selectedRoleId,
        email: formData.emailAddress || "",
        experience_in_yrs: parseInt(experienceYears),
        experience_in_months: parseInt(experienceMonths),
        experience_in_days: 0,
        specializations:
          specializationTags.length > 0 ? specializationTags : ["General"],
        certifications: certificationTags,
        rating: initialData?.rating
          ? parseFloat(initialData.rating.toString())
          : 5.0,
        profile_image_url: "https://example.com/default-profile.jpg",
      };
      console.log(
        "Submitting Staff Payload:",
        JSON.stringify(payload, null, 2)
      );

      if (initialData?.id) {
        payload.id = initialData.id;
      }

      await createUpdateStaff(payload);
      console.log("Submitting payload:", payload);

      const staffData: Staff = {
        id: initialData?.id || `temp-${Date.now()}`,
        name: formData.fullName,
        phone: formData.phoneNumber,
        address: formData.location || "Not provided",
        experience: formData.experience || "Not specified",
        rating: payload.rating,
        status: initialData?.status || "Available",
        departments: payload.specializations,
        position: formData.role,
        joinDate:
          initialData?.joinDate || new Date().toISOString().split("T")[0],
        email: formData.emailAddress,
        certifications: certificationTags,
      };

      onSubmit(staffData);
      handleReset();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save staff"
      );
      console.error("Error saving staff:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!initialData) {
      setFormData({
        fullName: "",
        phoneNumber: "",
        experience: "",
        specialization: "",
        role: "",
        emailAddress: "",
        location: "",
        certifications: "",
      });
      setSpecializationTags([]);
      setCertificationTags([]);
      setSpecializationInput("");
      setCertificationInput("");
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".role-dropdown")) {
        setRoleDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#161D1F]">
            {initialData ? "Edit Staff Member" : "Add New Staff Member"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none text-[10px] placeholder-[#899193] text-black"
                placeholder="Enter Full Name"
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-2 relative">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="role-dropdown relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none text-[10px] text-left flex items-center justify-between  "
                >
                  <span
                    className={
                      formData.role ? "text-gray-900" : "text-[#899193]"
                    }
                  >
                    {formData.role || "Select Role"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      roleDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {roleDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {roleOptions.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[10px] border-b border-gray-100 last:border-b-0 text-black"
                      >
                        {role.role_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none text-[10px] placeholder-[#899193] text-black"
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                Email Address
              </label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) =>
                  handleInputChange("emailAddress", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none text-[10px] placeholder-[#899193] text-black"
                placeholder="name@example.com"
              />
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                Experience
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) =>
                  handleInputChange("experience", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none text-[10px] placeholder-[#899193] text-black"
                placeholder="e.g. 5 years"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none text-[10px] placeholder-[#899193] text-black"
                placeholder="Area, City, State"
              />
            </div>
          </div>

          {/* Specialization */}
          <div className="space-y-2 mt-6">
            <label className="block text-[10px] font-medium text-[#161D1F]">
              Specialization
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, "specialization")}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none text-[10px] placeholder-[#899193] text-black"
                placeholder="Enter specialization and press Enter"
              />
              <button
                type="button"
                onClick={addSpecializationTag}
                className="px-4 py-3 bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors text-[10px] font-medium"
              >
                Add
              </button>
            </div>
            {/* Specialization Tags */}
            {specializationTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {specializationTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-[#0088B1] text-white rounded-full text-[10px]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeSpecializationTag(tag)}
                      className="text-white hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="space-y-2 mt-6">
            <label className="block text-[10px] font-medium text-[#161D1F]">
              Certifications
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={certificationInput}
                onChange={(e) => setCertificationInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, "certification")}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none text-[10px] placeholder-[#899193]"
                placeholder="Enter certification and press Enter"
              />
              <button
                type="button"
                onClick={addCertificationTag}
                className="px-4 py-3 bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors text-[10px] font-medium"
              >
                Add
              </button>
            </div>
            {/* Certification Tags */}
            {certificationTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {certificationTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-[#0088B1] text-white rounded-full text-[10px]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeCertificationTag(tag)}
                      className="text-white hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors text-[10px] font-medium"
          >
            Reset
          </button>
          {/* Add error message above buttons */}
          {submitError && (
            <div className="px-6 py-2 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}

          {/* Update the submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0088B1] hover:bg-[#00729A]"
            } text-white rounded-lg transition-colors text-[10px] font-medium`}
          >
            {isSubmitting
              ? initialData
                ? "Updating..."
                : "Adding..."
              : initialData
              ? "Update Staff"
              : "Add Staff Member"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddStaffModal;
