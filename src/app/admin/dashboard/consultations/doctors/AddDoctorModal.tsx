"use client";
import React, { useState } from "react";
import { X, Upload, Plus, Trash2, ImagePlus } from "lucide-react";
import {
  tabs,
  weekDays,
  languageOptions,
  specializationOptions,
  departmentOptions,
} from "./data/doctorsData";

// Types
interface TimeSlot {
  startTime: string;
  endTime: string;
  maxPatientsPerSlot: string;
}

interface DoctorFormData {
  // Basic Information
  profile_image_url: File | null;
  name: string;
  specializations: string;
  department_id: string;
  experience_in_yrs: string;
  experience_in_months: string;
  experience_in_days: string;
  mobile_number: string;
  email: string;

  // Doctor Details
  about: string;
  qualifications: string;
  consultation_price: string;
  hospitals_id: string;
  is_available_online: boolean;
  is_available_in_person: boolean;
  languages_known: string[];

  // Availability
  availability: Record<string, TimeSlot[]>;

  // Compliance
  mci: string;
  nmc: string;
  state_registration: string;
}

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDoctor: (doctorData: DoctorFormData) => void;
}

const AddDoctorModal: React.FC<AddDoctorModalProps> = ({
  isOpen,
  onClose,
  onAddDoctor,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<DoctorFormData>({
    // Basic Information
    profile_image_url: null,
    name: "",
    specializations: "",
    department_id: "",
    experience_in_yrs: "",
    experience_in_months: "",
    experience_in_days: "",
    mobile_number: "",
    email: "",

    // Doctor Details
    about: "",
    qualifications: "",
    consultation_price: "",
    hospitals_id: "",
    is_available_online: true,
    is_available_in_person: false,
    languages_known: [],

    // Availability
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },

    // Compliance
    mci: "",
    nmc: "",
    state_registration: "",
  });

  const handleInputChange = (field: keyof DoctorFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const isTimeSlotOverlapping = (
    day: string,
    newStartTime: string,
    newEndTime: string,
    currentIndex: number = -1
  ) => {
    return formData.availability[day].some((slot, index) => {
      if (index === currentIndex) return false;
      const existingStart = slot.startTime;
      const existingEnd = slot.endTime;

      if (!existingStart || !existingEnd || !newStartTime || !newEndTime)
        return false;

      // Check for overlap
      return (
        (newStartTime >= existingStart && newStartTime < existingEnd) ||
        (newEndTime > existingStart && newEndTime <= existingEnd) ||
        (newStartTime <= existingStart && newEndTime >= existingEnd)
      );
    });
  };

  const handleArrayToggle = (field: keyof DoctorFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter((item) => item !== value)
        : [...(prev[field] as string[]), value],
    }));
  };

  const handleFileUpload = (field: keyof DoctorFormData, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };
  type TimeSlotField = keyof TimeSlot;

  const addTimeSlot = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: [
          ...prev.availability[day],
          { startTime: "", endTime: "", maxPatientsPerSlot: "" },
        ],
      },
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].filter((_, i) => i !== index),
      },
    }));
  };

  const updateTimeSlot = (
    day: string,
    index: number,
    field: TimeSlotField,
    value: string
  ) => {
    const currentSlot = formData.availability[day][index];
    const updatedSlot = { ...currentSlot, [field]: value };

    // Check for overlapping only if both start and end times are set
    if (updatedSlot.startTime && updatedSlot.endTime) {
      if (
        isTimeSlotOverlapping(
          day,
          updatedSlot.startTime,
          updatedSlot.endTime,
          index
        )
      ) {
        alert(
          "Time slot overlaps with existing slot. Please choose different times."
        );
        return;
      }

      // Validate that start time is before end time
      if (updatedSlot.startTime >= updatedSlot.endTime) {
        alert("Start time must be before end time.");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };
  const handleSubmit = () => {
    // Convert languages array to comma-separated string to match Doctor interface
    const processedData = {
      ...formData,
      languages_known: formData.languages_known.join(","),
    };

    console.log("Doctor Data:", processedData);
    onAddDoctor(formData);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      profile_image_url: null,
      name: "",
      specializations: "",
      department_id: "",
      experience_in_yrs: "",
      experience_in_months: "",
      experience_in_days: "",
      mobile_number: "",
      email: "",
      about: "",
      qualifications: "",
      consultation_price: "",
      hospitals_id: "",
      is_available_online: true,
      is_available_in_person: false,
      languages_known: [],
      availability: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      },
      mci: "",
      nmc: "",
      state_registration: "",
    });
    setActiveTab(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161d1f]">
            Add New Doctor
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-2">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex-1 py-3 px-3 ${
                activeTab === index
                  ? "bg-[#0088B1] text-white rounded-lg text-[10px]"
                  : "bg-gray-100 text-[#161D1F] text-[10px]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {/* Tab 1: Basic Information */}
          {activeTab === 0 && (
            <div className="space-y-8">
              {/* Doctor Image Upload */}
              <div className="flex flex-col items-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 h-auto w-full text-center hover:border-[#1BA3C7] transition-colors">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload(
                        "profile_image_url",
                        e.target.files?.[0] || null
                      )
                    }
                    className="hidden"
                    id="doctorImage"
                    accept=".jpg,.jpeg,.png"
                  />
                  <label htmlFor="doctorImage" className="cursor-pointer">
                    <div className="flex items-center justify-center mx-auto mb-4">
                      <ImagePlus
                        className="w-16 h-16 text-[#161D1F]"
                        strokeWidth={1}
                      />
                    </div>
                    <h3 className="text-[12px] font-medium text-[#161d1f] mb-2">
                      Upload Doctor Image
                    </h3>
                    <p className="text-gray-500 mb-2 text-[10px]">
                      {formData.profile_image_url
                        ? formData.profile_image_url.name
                        : "Drag and drop your new image here or click to browse"}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      (supported file format .jpg, .jpeg, .png)
                    </p>
                  </label>
                  {!formData.profile_image_url && (
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("doctorImage")?.click()
                      }
                      className="mt-4 text-[10px] px-6 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
                    >
                      Select File
                    </button>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Doctor Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    placeholder="Dr. Sarah Johnson"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) =>
                      handleInputChange("mobile_number", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    placeholder="doctor@hospital.com"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Specialization
                  </label>
                  <select
                    value={formData.specializations}
                    onChange={(e) =>
                      handleInputChange("specializations", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  >
                    <option value="">Select Specialization</option>
                    {specializationOptions.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Department
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) =>
                      handleInputChange("department_id", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  >
                    <option value="">Select a Department</option>
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={formData.experience_in_yrs}
                    onChange={(e) =>
                      handleInputChange("experience_in_yrs", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    placeholder="Years of experience"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Doctor Details */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> About Doctor
                </label>
                <textarea
                  value={formData.about}
                  onChange={(e) => handleInputChange("about", e.target.value)}
                  rows={4}
                  className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  placeholder="Brief description of the doctor's expertise & experience"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Qualifications
                </label>
                <textarea
                  value={formData.qualifications}
                  onChange={(e) =>
                    handleInputChange("qualifications", e.target.value)
                  }
                  rows={3}
                  className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  placeholder="Add qualifications (e.g., MBBS - AIIMS Delhi)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Consultation Price
                    (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.consultation_price}
                    onChange={(e) =>
                      handleInputChange("consultation_price", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Assign Hospital
                  </label>
                  <input
                    type="text"
                    value={formData.hospitals_id}
                    onChange={(e) =>
                      handleInputChange("hospitals_id", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    placeholder="Hospital Name"
                  />
                </div>
              </div>

              {/* Consultation Mode */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.is_available_online}
                      onChange={(e) =>
                        handleInputChange(
                          "is_available_online",
                          e.target.checked
                        )
                      }
                      className="w-3 h-3 text-[#1BA3C7] border-gray-300 rounded focus:ring-[#1BA3C7]"
                    />
                    <span className="text-[10px] font-medium text-gray-700">
                      Available for Online Consultations
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.is_available_in_person}
                      onChange={(e) =>
                        handleInputChange(
                          "is_available_in_person",
                          e.target.checked
                        )
                      }
                      className="w-3 h-3 text-[#1BA3C7] border-gray-300 rounded focus:ring-[#1BA3C7]"
                    />
                    <span className="text-[10px] font-medium text-gray-700">
                      Available for In-Person Consultations
                    </span>
                  </label>
                </div>
              </div>

              {/* Languages Known */}
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Languages Known
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {languageOptions.map((lang) => (
                    <label key={lang} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.languages_known.includes(lang)}
                        onChange={() =>
                          handleArrayToggle("languages_known", lang)
                        }
                        className="w-3 h-3 text-[#1BA3C7] border-gray-300 rounded focus:ring-[#1BA3C7]"
                      />
                      <span className="text-[10px] text-gray-700">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Availability */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-[10px] font-medium text-[#161D1F] mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#1BA3C7] rounded-full"></div>
                  Availability (Set slots for each day)
                </h3>
                <p className="text-[10px] text-gray-500">
                  Configure your consultation time slots for each day of the
                  week
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 h-96 flex flex-col"
                  >
                    {/* Day Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-t-xl border-b border-gray-100 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#1BA3C7] rounded-lg flex items-center justify-center">
                            <span className="text-white text-[10px] font-medium">
                              {day.substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-medium text-[#161D1F]">
                              {day}
                            </h4>
                            <p className="text-[10px] text-gray-500">
                              {formData.availability[day].length} slot
                              {formData.availability[day].length !== 1
                                ? "s"
                                : ""}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addTimeSlot(day)}
                          className="flex items-center gap-2 px-3 py-2 text-[10px] bg-[#1BA3C7] text-white rounded-lg hover:bg-[#1591B8] transition-colors shadow-sm hover:shadow-md"
                        >
                          <Plus className="w-3 h-3" />
                          Add Slot
                        </button>
                      </div>
                    </div>

                    {/* Time Slots - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {formData.availability[day].length > 0 ? (
                        <div className="space-y-3">
                          {formData.availability[day].map((slot, index) => (
                            <div
                              key={index}
                              className="group bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                {/* Time Inputs Container */}
                                <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                                  <div className="flex flex-col">
                                    <label className="text-[10px] text-gray-500 mb-1">
                                      Start Time
                                    </label>
                                    <input
                                      type="time"
                                      value={slot.startTime}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          day,
                                          index,
                                          "startTime",
                                          e.target.value
                                        )
                                      }
                                      className="text-[10px] px-2 py-1 border border-gray-200 rounded focus:border-[#1BA3C7] focus:ring-1 focus:ring-[#1BA3C7] outline-none text-[#161D1F] font-medium"
                                      style={{ colorScheme: "light" }}
                                    />
                                  </div>

                                  <div className="flex items-center justify-center px-2">
                                    <div className="w-3 h-0.5 bg-gray-300"></div>
                                  </div>

                                  <div className="flex flex-col">
                                    <label className="text-[10px] text-gray-500 mb-1">
                                      End Time
                                    </label>
                                    <input
                                      type="time"
                                      value={slot.endTime}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          day,
                                          index,
                                          "endTime",
                                          e.target.value
                                        )
                                      }
                                      className="text-[10px] px-2 py-1 border border-gray-200 rounded focus:border-[#1BA3C7] focus:ring-1 focus:ring-[#1BA3C7] outline-none text-[#161D1F] font-medium"
                                      style={{ colorScheme: "light" }}
                                    />
                                  </div>
                                </div>

                                {/* Max Patients Input */}
                                <div className="flex flex-col bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                                  <label className="text-[10px] text-gray-500 mb-1">
                                    Patients
                                  </label>
                                  <input
                                    type="number"
                                    value={slot.maxPatientsPerSlot}
                                    onChange={(e) =>
                                      updateTimeSlot(
                                        day,
                                        index,
                                        "maxPatientsPerSlot",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Max"
                                    min="1"
                                    className="w-16 text-[10px] px-2 py-1 border border-gray-200 rounded focus:border-[#1BA3C7] focus:ring-1 focus:ring-[#1BA3C7] outline-none text-center text-[#161D1F] font-medium"
                                  />
                                </div>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => removeTimeSlot(day, index)}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Time Display */}
                              {/* {slot.startTime && slot.endTime && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="px-2 py-1 bg-[#1BA3C7] bg-opacity-10 text-[#1BA3C7] rounded text-[10px] font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </div>
                                  {slot.maxPatientsPerSlot && (
                                    <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-medium">
                                      Max {slot.maxPatientsPerSlot} patients
                                    </div>
                                  )}
                                </div>
                              )} */}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 flex-1 flex flex-col justify-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Plus className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-[10px] text-gray-500 mb-2">
                            No slots added for {day}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Click "Add Slot" to create your first time slot
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Compliance */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <h3 className="text-[10px] font-semibold text-[#161d1f] mb-6">
                Indian Healthcare Compliance
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    MCI Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.mci}
                    onChange={(e) => handleInputChange("mci", e.target.value)}
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    placeholder="Ex. - MCI-12345-2020"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    NMC Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.nmc}
                    onChange={(e) => handleInputChange("nmc", e.target.value)}
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    placeholder="Ex. - NMC-12345-2020"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  State Registration (Optional)
                </label>
                <input
                  type="text"
                  value={formData.state_registration}
                  onChange={(e) =>
                    handleInputChange("state_registration", e.target.value)
                  }
                  className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  placeholder="Ex. - SR-12345-2020"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 gap-4">
          <button
            onClick={resetForm}
            className="px-6 py-2 text-[#161D1F] text-[10px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>

          {activeTab > 0 && (
            <button
              onClick={() => setActiveTab(activeTab - 1)}
              className="px-6 py-2 text-[#16181b] text-[10px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}

          {activeTab < tabs.length - 1 ? (
            <button
              onClick={() => setActiveTab(activeTab + 1)}
              className="px-6 py-2 text-[#16181b] text-[10px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 text-[#fffff] text-[10px] bg-[#1BA3C7] border border-gray-300 rounded-lg hover:bg-[#1BA3C7] transition-colors"
            >
              Add Doctor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDoctorModal;
