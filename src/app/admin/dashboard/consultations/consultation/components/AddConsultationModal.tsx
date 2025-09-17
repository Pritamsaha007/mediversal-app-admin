"use client";
import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import {
  searchHospitals,
  EnumItem,
  searchDoctors,
  createOrUpdateConsultation,
  getConsultationEnumData,
} from "../service/consultationService";
import { useAdminStore } from "@/app/store/adminStore";
import { Consultation } from "../data/consultation";
import toast from "react-hot-toast";

interface AddConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConsultation: (consultation: ConsultationFormData) => void;
  editingConsultation?: Consultation | null;
  initialConsultationType: "online" | "hospital";
}
interface ConsultationFormData {
  patientName: string;
  patientContact: string;
  patientEmail: string;
  aadhaarNumber?: string;
  consultationType: "online" | "in-person";
  consultationDate: string;
  consultationTime: string;
  duration: number;
  appointedDoctor: string;
  doctorId: string;
  hospital: string;
  hospitalId: string;
  consultationLanguage: string;
  languageId: string;
  paymentMethod: string;
  paymentModeId: string;
  paymentStatus: string;
  paymentStatusId: string;
  symptoms?: string;
}

const AddConsultationModal: React.FC<AddConsultationModalProps> = ({
  isOpen,
  onClose,
  onAddConsultation,
  editingConsultation,
  initialConsultationType,
}) => {
  const [formData, setFormData] = useState<ConsultationFormData>({
    patientName: "",
    patientContact: "",
    patientEmail: "",
    aadhaarNumber: "",
    consultationType: "online",
    consultationDate: "",
    consultationTime: "",
    duration: 30,
    appointedDoctor: "",
    doctorId: "",
    hospital: "",
    hospitalId: "",
    consultationLanguage: "",
    languageId: "",
    paymentMethod: "",
    paymentModeId: "",
    paymentStatus: "pending",
    paymentStatusId: "",
    symptoms: "",
  });
  const { token } = useAdminStore();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [enumData, setEnumData] = useState<{
    paymentModes: EnumItem[];
    paymentStatuses: EnumItem[];
    languages: EnumItem[];
  }>({
    paymentModes: [],
    paymentStatuses: [],
    languages: [],
  });

  const [hospitals, setHospitals] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [doctors, setDoctors] = useState<
    Array<{ id: string; name: string; specializations: string }>
  >([]);
  const [hospitalSearchTerm, setHospitalSearchTerm] = useState("");
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.patientName.trim()) errors.push("Patient name is required");
    if (!formData.patientContact.trim())
      errors.push("Patient contact is required");
    if (!formData.patientEmail.trim()) errors.push("Patient email is required");
    if (!formData.consultationDate)
      errors.push("Consultation date is required");
    if (!formData.consultationTime)
      errors.push("Consultation time is required");
    if (!formData.appointedDoctor) errors.push("Doctor selection is required");
    if (!formData.paymentMethod) errors.push("Payment method is required");

    if (formData.consultationType === "in-person" && !formData.hospital) {
      errors.push("Hospital selection is required for in-person consultations");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.patientEmail)) {
      errors.push("Please enter a valid email address");
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.patientContact.replace(/\D/g, ""))) {
      errors.push("Please enter a valid 10-digit phone number");
    }

    if (errors.length > 0) {
      toast.error(errors[0]); // Show first error
      return false;
    }

    return true;
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadEnumData = async () => {
      if (!token) return;
      try {
        const data = await getConsultationEnumData(token);
        setEnumData({
          paymentModes: data.paymentModes,
          paymentStatuses: data.paymentStatuses,
          languages: data.languages,
        });
      } catch (error) {
        console.error("Error loading enum data:", error);
      }
    };
    loadEnumData();
  }, [token]);

  useEffect(() => {
    const searchHospitalData = async () => {
      if (!token || formData.consultationType !== "in-person") return;
      try {
        const response = await searchHospitals(
          hospitalSearchTerm || null,
          token
        );
        setHospitals(response.hospitals);
      } catch (error) {
        console.error("Error searching hospitals:", error);
      }
    };

    const debounceTimer = setTimeout(searchHospitalData, 300);
    return () => clearTimeout(debounceTimer);
  }, [hospitalSearchTerm, token, formData.consultationType]);

  useEffect(() => {
    if (editingConsultation) {
      setFormData({
        patientName: editingConsultation.patientName,
        patientContact: editingConsultation.patientContact,
        patientEmail: editingConsultation.patientEmail,
        aadhaarNumber: editingConsultation.aadhaarNumber || "",
        consultationType: editingConsultation.consultationType,
        consultationDate: editingConsultation.consultationDate,
        consultationTime: editingConsultation.consultationTime,
        duration: editingConsultation.duration,
        appointedDoctor: editingConsultation.appointedDoctor,
        doctorId: editingConsultation.doctorId || "",
        hospital: editingConsultation.hospital || "",
        hospitalId: editingConsultation.hospitalId || "",
        consultationLanguage: editingConsultation.consultationLanguage,
        languageId: editingConsultation.languageId || "",
        paymentMethod: editingConsultation.paymentMethod,
        paymentModeId: editingConsultation.paymentModeId || "",
        paymentStatus: editingConsultation.paymentStatus,
        paymentStatusId: editingConsultation.statusId || "",
        symptoms: editingConsultation.symptoms || "",
      });
    } else {
      setFormData({
        patientName: "",
        patientContact: "",
        patientEmail: "",
        aadhaarNumber: "",
        consultationType:
          initialConsultationType === "online" ? "online" : "in-person",
        consultationDate: "",
        consultationTime: "",
        duration: 30,
        appointedDoctor: "",
        doctorId: "",
        hospital: "",
        hospitalId: "",
        consultationLanguage: "",
        languageId: "",
        paymentMethod: "",
        paymentModeId: "",
        paymentStatus: "pending",
        paymentStatusId: "",
        symptoms: "",
      });
    }
  }, [editingConsultation, initialConsultationType, isOpen]);

  useEffect(() => {
    const searchDoctorData = async () => {
      if (!token) return;
      try {
        const response = await searchDoctors(doctorSearchTerm || null, token);
        setDoctors(response.doctors);
      } catch (error) {
        console.error("Error searching doctors:", error);
      }
    };

    const debounceTimer = setTimeout(searchDoctorData, 300);
    return () => clearTimeout(debounceTimer);
  }, [doctorSearchTerm, token]);

  const handleInputChange = (field: keyof ConsultationFormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // When payment method changes, also update the ID
      if (field === "paymentMethod") {
        const selectedMode = enumData.paymentModes.find(
          (mode) => mode.id === value
        );
        if (selectedMode) {
          newData.paymentModeId = selectedMode.id;
          newData.paymentMethod = selectedMode.value; // Store display value
        }
      }

      // When language changes, also update the ID
      if (field === "consultationLanguage") {
        const selectedLang = enumData.languages.find(
          (lang) => lang.id === value
        );
        if (selectedLang) {
          newData.languageId = selectedLang.id;
          newData.consultationLanguage = selectedLang.value; // Store display value
        }
      }

      if (field === "paymentStatus") {
        const selectedStatus = enumData.paymentStatuses.find(
          (status) => status.value === value
        );
        if (selectedStatus) {
          newData.paymentStatusId = selectedStatus.id;
        }
      }

      return newData;
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingConsultation
        ? "Updating consultation..."
        : "Scheduling consultation..."
    );

    try {
      const consultationData = {
        ...(editingConsultation?.id && { id: editingConsultation.id }),
        date: formData.consultationDate,
        time: formData.consultationTime,
        session_duration_in_mins: formData.duration,
        customer_id: null,
        patient_name: formData.patientName.trim(),
        phone: formData.patientContact.replace(/\D/g, ""), // Clean phone number
        email: formData.patientEmail.trim().toLowerCase(),
        date_of_birth: "1990-01-01",
        hospital_id:
          formData.consultationType === "in-person"
            ? formData.hospitalId
            : undefined,
        symptoms_desc: formData.symptoms?.trim() || "",
        payment_mode: formData.paymentModeId || "",
        total_amount: 500,
        service_fee_tax_amount: 50,
        paid_amount: 500,
        applied_coupons: null,
        status: formData.paymentStatusId || "",
        aadhar_id: formData.aadhaarNumber?.replace(/\D/g, "") || undefined, // Clean Aadhaar
        consultation_language_id: formData.languageId || "",
        staff_id: formData.doctorId || "",
      };

      await createOrUpdateConsultation(consultationData, token);

      toast.dismiss(loadingToast);
      toast.success(
        editingConsultation
          ? "Consultation updated successfully!"
          : "Consultation scheduled successfully!"
      );

      onAddConsultation(formData);
      onClose();
    } catch (error) {
      console.error("Error saving consultation:", error);
      toast.dismiss(loadingToast);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save consultation. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      patientName: "",
      patientContact: "",
      patientEmail: "",
      aadhaarNumber: "",
      consultationType: "online",
      consultationDate: "",
      consultationTime: "",
      duration: 30,
      appointedDoctor: "",
      doctorId: "",
      hospital: "",
      hospitalId: "",
      consultationLanguage: "",
      languageId: "",
      paymentMethod: "",
      paymentModeId: "",
      paymentStatus: "pending",
      paymentStatusId: "",
      symptoms: "",
    });
  };

  const DropdownSelect: React.FC<{
    value: string;
    placeholder: string;
    options: string[] | { label: string; value: any }[];
    field: keyof ConsultationFormData;
    required?: boolean;
  }> = ({ value, placeholder, options, field, required = false }) => {
    const isOpen = openDropdown === field;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : field)}
          className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg text-[#161D1F] bg-white hover:bg-gray-50 focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm flex items-center justify-between"
        >
          <span className={value ? "text-[#161D1F]" : "text-[#B0B6B8]"}>
            {value || placeholder}
          </span>
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
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.map((option, index) => {
              const optionValue =
                typeof option === "string" ? option : option.value;
              const optionLabel =
                typeof option === "string" ? option : option.label;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (
                      field === "paymentMethod" ||
                      field === "consultationLanguage"
                    ) {
                      handleInputChange(field, optionValue); // This will be the ID
                    } else {
                      handleInputChange(field, optionValue);
                    }
                    setOpenDropdown(null);
                  }}
                  className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 text-[#161D1F]"
                >
                  {optionLabel}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161d1f]">
            {editingConsultation
              ? `Edit ${
                  initialConsultationType === "online" ? "Online" : "In-Person"
                } Consultation`
              : `Schedule ${
                  initialConsultationType === "online"
                    ? "Online"
                    : "In-Person / Hospital Visit"
                } Consultation`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Add Patient Details */}
          <div className="mb-6">
            <h3 className="text-[16px] font-medium text-[#161d1f] mb-4">
              Add Patient Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Patient Name
                </label>
                <input
                  type="text"
                  placeholder="Sarah Johnson"
                  value={formData.patientName}
                  onChange={(e) =>
                    handleInputChange("patientName", e.target.value)
                  }
                  className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Patient Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit phone"
                  value={formData.patientContact}
                  onChange={(e) =>
                    handleInputChange("patientContact", e.target.value)
                  }
                  className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Patient Email
                </label>
                <input
                  type="email"
                  placeholder="e.g., info@hospital.com"
                  value={formData.patientEmail}
                  onChange={(e) =>
                    handleInputChange("patientEmail", e.target.value)
                  }
                  className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                />
              </div>
              {formData.consultationType === "in-person" && (
                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Select Hospital
                  </label>
                  <div className="relative">
                    <Search className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search hospitals..."
                      value={formData.hospital || hospitalSearchTerm}
                      onChange={(e) => {
                        setHospitalSearchTerm(e.target.value);
                        if (!e.target.value) {
                          handleInputChange("hospital", "");
                          handleInputChange("hospitalId", "");
                        }
                      }}
                      className="w-full text-[10px] pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    />
                    {hospitals.length > 0 &&
                      hospitalSearchTerm &&
                      !formData.hospital && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {hospitals.map((hospital) => (
                            <button
                              key={hospital.id}
                              type="button"
                              onClick={() => {
                                handleInputChange("hospital", hospital.name);
                                handleInputChange("hospitalId", hospital.id);
                                setHospitalSearchTerm("");
                              }}
                              className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 text-[#161D1F]"
                            >
                              {hospital.name}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              )}
              {formData.consultationType === "online" && (
                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234-5678-9012"
                    value={formData.aadhaarNumber}
                    onChange={(e) =>
                      handleInputChange("aadhaarNumber", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Appoint Doctor
                </label>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for Doctor name"
                    value={formData.appointedDoctor || doctorSearchTerm}
                    onChange={(e) => {
                      setDoctorSearchTerm(e.target.value);
                      if (!e.target.value) {
                        handleInputChange("appointedDoctor", "");
                        handleInputChange("doctorId", "");
                      }
                    }}
                    className="w-full text-[10px] pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  />
                  {doctors.length > 0 &&
                    doctorSearchTerm &&
                    !formData.appointedDoctor && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {doctors.map((doctor) => (
                          <button
                            key={doctor.id}
                            type="button"
                            onClick={() => {
                              handleInputChange("appointedDoctor", doctor.name);
                              handleInputChange("doctorId", doctor.id);
                              setDoctorSearchTerm("");
                            }}
                            className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 text-[#161D1F]"
                          >
                            {doctor.name} - {doctor.specializations}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Consultation Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.consultationDate}
                    onChange={(e) =>
                      handleInputChange("consultationDate", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Select Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.consultationTime}
                    onChange={(e) =>
                      handleInputChange("consultationTime", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Duration (minutes)
                </label>
                <DropdownSelect
                  value={formData.duration.toString()}
                  placeholder="Select Duration"
                  options={[
                    { label: "15 minutes", value: 15 },
                    { label: "30 minutes", value: 30 },
                    { label: "45 minutes", value: 45 },
                    { label: "60 minutes", value: 60 },
                  ]}
                  field="duration"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Consultation Language
                </label>
                <DropdownSelect
                  value={formData.consultationLanguage}
                  placeholder="Select Language"
                  options={enumData.languages.map((lang) => ({
                    label: lang.value,
                    value: lang.id,
                  }))}
                  field="consultationLanguage"
                  required
                />
              </div>
            </div>
          </div>

          {/* Add Payment Details */}
          <div className="mb-6">
            <h3 className="text-[16px] font-medium text-[#161D1F] mb-4">
              Add Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  Payment Status
                </label>
                <DropdownSelect
                  value={formData.paymentStatus}
                  placeholder="Choose Payment Status"
                  options={enumData.paymentStatuses.map(
                    (status) => status.value
                  )}
                  field="paymentStatus"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Payment Method
                </label>
                <DropdownSelect
                  value={formData.paymentMethod}
                  placeholder="Select Payment Method"
                  options={enumData.paymentModes.map((mode) => ({
                    label: mode.value,
                    value: mode.id,
                  }))}
                  field="paymentMethod"
                  required
                />
              </div>
            </div>
          </div>

          {/* Specify Symptoms */}
          <div className="mb-6">
            <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
              {formData.consultationType === "online"
                ? "Specify Symptoms or The Reason for the Consultation"
                : "Specify Symptoms"}
            </label>
            <textarea
              placeholder="Specify few patient symptoms here"
              value={formData.symptoms}
              onChange={(e) => handleInputChange("symptoms", e.target.value)}
              rows={4}
              className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 text-sm rounded-lg transition-all ${
              isSubmitting
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#0088B1] text-white hover:bg-[#007299]"
            }`}
          >
            {isSubmitting
              ? editingConsultation
                ? "Updating..."
                : "Scheduling..."
              : editingConsultation
              ? "Update Consultation"
              : "Schedule Consultation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddConsultationModal;
