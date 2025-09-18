"use client";
import React, { useEffect, useState } from "react";
import { X, Plus, ImagePlus, Edit } from "lucide-react";
import { tabs, Doctor, convertAvailabilityToSlots } from "../data/doctorsData";
import { EnumItem } from "../services/doctorService";
import HospitalSearchInput from "./HospitalSearchInput";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDoctor: (doctorData: Doctor) => void;
  editingDoctor?: Doctor | null;
  enumData: {
    departments: EnumItem[];
    specializations: EnumItem[];
    languages: EnumItem[];
    days: EnumItem[];
  };
}
const AddDoctorModal: React.FC<AddDoctorModalProps> = ({
  isOpen,
  onClose,
  onAddDoctor,
  editingDoctor,
  enumData,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [editingSlot, setEditingSlot] = useState<{
    day: string;
    index: number;
  } | null>(null);
  const { token } = useAdminStore();

  const [formData, setFormData] = useState<Doctor>({
    id: "",
    profile_image_url: null,
    name: "",
    specialization_id: "",
    department_id: "",
    experience_in_yrs: 0,
    mobile_number: "",
    about: "",
    qualifications: "",
    consultation_price: 0,
    hospitals_id: [],
    is_available_online: true,
    is_available_in_person: false,
    is_available: true,
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

  const [selectedDay, setSelectedDay] = useState<string>("");
  const [newSlot, setNewSlot] = useState({
    startTime: "",
    endTime: "",
    maxPatientsPerSlot: "1",
  });

  const handleInputChange = (field: keyof Doctor, value: any) => {
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

  const handleAddTimeSlot = () => {
    if (!selectedDay || !newSlot.startTime || !newSlot.endTime) {
      toast.error("Please select day and fill all time slot fields");
      return;
    }

    if (newSlot.startTime >= newSlot.endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    // Check for overlapping slots
    if (
      isTimeSlotOverlapping(selectedDay, newSlot.startTime, newSlot.endTime)
    ) {
      toast.error(
        "Time slot overlaps with existing slot. Please choose different times."
      );
      return;
    }

    // Add the new slot directly without calling addTimeSlot
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [selectedDay]: [
          ...prev.availability[selectedDay],
          {
            startTime: newSlot.startTime,
            endTime: newSlot.endTime,
            maxPatientsPerSlot: newSlot.maxPatientsPerSlot,
          },
        ],
      },
    }));

    // Reset the form
    setNewSlot({
      startTime: "",
      endTime: "",
      maxPatientsPerSlot: "1",
    });
  };

  useEffect(() => {
    if (editingDoctor) {
      const completeAvailability = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
        ...editingDoctor.availability,
      };

      setFormData({
        ...editingDoctor,
        profile_image_url: editingDoctor.profile_image_url || null,
        availability: completeAvailability,
      });
    } else {
      resetForm();
    }
  }, [editingDoctor, isOpen]);

  const handleArrayToggle = (field: keyof Doctor, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter((item) => item !== value)
        : [...(prev[field] as string[]), value],
    }));
  };

  const handleFileUpload = (field: keyof Doctor, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
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

  const handleEditSlot = (day: string, index: number) => {
    const slot = formData.availability[day][index];
    setNewSlot({
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxPatientsPerSlot: slot.maxPatientsPerSlot,
    });
    setEditingSlot({ day, index });
  };

  const handleUpdateSlot = () => {
    if (!editingSlot || !newSlot.startTime || !newSlot.endTime) {
      toast.error("Please fill all time slot fields");
      return;
    }

    if (newSlot.startTime >= newSlot.endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    // Check for overlapping slots (excluding the current slot being edited)
    if (
      isTimeSlotOverlapping(
        editingSlot.day,
        newSlot.startTime,
        newSlot.endTime,
        editingSlot.index
      )
    ) {
      toast.error(
        "Time slot overlaps with existing slot. Please choose different times."
      );
      return;
    }

    // Update the slot
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [editingSlot.day]: prev.availability[editingSlot.day].map(
          (slot, index) =>
            index === editingSlot.index
              ? {
                  ...slot,
                  startTime: newSlot.startTime,
                  endTime: newSlot.endTime,
                  maxPatientsPerSlot: newSlot.maxPatientsPerSlot,
                }
              : slot
        ),
      },
    }));

    // Reset form and editing state
    setNewSlot({
      startTime: "",
      endTime: "",
      maxPatientsPerSlot: "1",
    });
    setEditingSlot(null);
  };

  const handleCancelEdit = () => {
    setNewSlot({
      startTime: "",
      endTime: "",
      maxPatientsPerSlot: "1",
    });
    setEditingSlot(null);
  };

  const handleSubmit = async () => {
    if (!enumData.days || enumData.days.length === 0) {
      toast.error("Day data not loaded. Please try again.");
      return;
    }

    const daysMapping: Record<string, string> = {};
    enumData.days.forEach((day) => {
      daysMapping[day.value] = day.id;
    });

    const doctorSlots = convertAvailabilityToSlots(
      formData.availability,
      daysMapping
    );

    console.log("Converted doctor slots:", doctorSlots);

    const submitData = {
      ...formData,
      doctor_slots: doctorSlots,
    };

    console.log("Doctor Data:", submitData);

    try {
      await onAddDoctor(submitData);
      toast.success(
        editingDoctor
          ? "Doctor updated successfully!"
          : "Doctor created successfully!"
      );
      onClose();
      resetForm();
    } catch (error) {
      toast.error(
        editingDoctor ? "Failed to update doctor" : "Failed to create doctor"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      profile_image_url: null,
      name: "",
      specializations: "",
      specialization_id: "",
      department_id: "",
      experience_in_yrs: 0,
      mobile_number: "",
      about: "",
      qualifications: "",
      consultation_price: 0,
      hospitals_id: [],
      is_available_online: true,
      is_available_in_person: false,
      is_available: true,
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
    setEditingSlot(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161d1f]">
            {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
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
                        ? typeof formData.profile_image_url === "object" &&
                          "name" in formData.profile_image_url
                          ? formData.profile_image_url.name
                          : formData.profile_image_url
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
                    <span className="text-red-500">*</span> Specialization
                  </label>
                  <select
                    value={formData.specialization_id}
                    onChange={(e) =>
                      handleInputChange("specialization_id", e.target.value)
                    }
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  >
                    <option value="">Select Specialization</option>
                    {enumData.specializations.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.value}
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
                    {enumData.departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.value}
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
                  <HospitalSearchInput
                    selectedHospitals={formData.hospitals_id}
                    onHospitalChange={(hospitalIds) =>
                      handleInputChange("hospitals_id", hospitalIds)
                    }
                    token={token}
                    initialHospitalNames={editingDoctor?.hospitalNamesMap || {}}
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
                  {enumData.languages.map((lang) => (
                    <label
                      key={lang.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={formData.languages_known.includes(lang.id)}
                        onChange={() =>
                          handleArrayToggle("languages_known", lang.id)
                        }
                        className="w-3 h-3 text-[#1BA3C7] border-gray-300 rounded focus:ring-[#1BA3C7]"
                      />
                      <span className="text-[10px] text-gray-700">
                        {lang.value}
                      </span>
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
                <h3 className="text-[12px] font-medium text-[#161D1F] mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#1BA3C7] rounded-full"></div>
                  Doctor Availability Schedule
                </h3>
                <p className="text-[10px] text-gray-500">
                  Set up consultation time slots for each day of the week
                </p>
              </div>

              {/* Days Selection */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {enumData.days.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDay(day.value)}
                    className={`p-3 rounded-lg text-[10px] font-medium transition-all ${
                      selectedDay === day.value
                        ? "bg-[#1BA3C7] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">
                        {day.value.substring(0, 3)}
                      </div>
                      <div className="text-[8px] mt-1">
                        {(formData.availability[day.value] || []).length} slots
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedDay && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-[12px] font-medium text-[#161D1F] mb-4">
                    {editingSlot
                      ? `Edit Time Slot for ${selectedDay}`
                      : `Add Time Slot for ${selectedDay}`}
                  </h4>

                  {/* Time Slot Input Form */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) =>
                          setNewSlot((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                        className="w-full text-black text-[10px] px-3 py-2 border border-gray-300 rounded-lg focus:border-[#1BA3C7] focus:ring-1 focus:ring-[#1BA3C7] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) =>
                          setNewSlot((prev) => ({
                            ...prev,
                            endTime: e.target.value,
                          }))
                        }
                        className="w-full text-black text-[10px] px-3 py-2 border border-gray-300 rounded-lg focus:border-[#1BA3C7] focus:ring-1 focus:ring-[#1BA3C7] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                        Max Patients
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newSlot.maxPatientsPerSlot}
                        onChange={(e) =>
                          setNewSlot((prev) => ({
                            ...prev,
                            maxPatientsPerSlot: e.target.value,
                          }))
                        }
                        placeholder="1"
                        className="w-full text-black text-[10px] px-3 py-2 border border-gray-300 rounded-lg focus:border-[#1BA3C7] focus:ring-1 focus:ring-[#1BA3C7] outline-none"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      {editingSlot ? (
                        <>
                          <button
                            type="button"
                            onClick={handleUpdateSlot}
                            className="flex-1 px-4 py-2 bg-green-600 text-white text-[10px] font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-500 text-white text-[10px] font-medium rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={handleAddTimeSlot}
                          className="w-full px-4 py-2 bg-[#1BA3C7] text-white text-[10px] font-medium rounded-lg hover:bg-[#1591B8] transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Slot
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Created Slots List */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-medium text-gray-600 border-b border-gray-200 pb-2">
                      Created Slots (
                      {(formData.availability[selectedDay] || []).length})
                    </h5>

                    {(formData.availability[selectedDay] || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Plus className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-[10px]">
                          No slots added for {selectedDay}
                        </p>
                        <p className="text-[8px] text-gray-400 mt-1">
                          Add your first time slot above
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {(formData.availability[selectedDay] || []).map(
                          (slot, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                            >
                              <div className="flex items-center gap-4">
                                <div className="text-[10px] font-medium text-[#1BA3C7]">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                <div className="text-[8px] text-gray-600 bg-white px-2 py-1 rounded border">
                                  Max {slot.maxPatientsPerSlot} patients
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditSlot(selectedDay, index)
                                }
                                className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit slot"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              {editingDoctor ? "Update Doctor" : "Add Doctor"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDoctorModal;
