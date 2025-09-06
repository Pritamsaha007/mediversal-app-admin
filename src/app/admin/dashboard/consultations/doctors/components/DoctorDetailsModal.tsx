"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { Doctor, weekDays } from "../data/doctorsData";

interface DoctorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onEdit?: (doctor: Doctor) => void;
}

const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onEdit,
}) => {
  const [selectedDay, setSelectedDay] = useState("Monday");

  if (!isOpen || !doctor) return null;

  const handleEdit = () => {
    if (onEdit && doctor) {
      onEdit(doctor);
      onClose();
    }
  };

  const formatTimeSlots = (day: string) => {
    const daySlots = doctor.availability?.[day] || [];
    if (daySlots.length === 0) return [];

    return daySlots
      .map((slot) => `${slot.startTime} - ${slot.endTime}`)
      .filter((slot) => slot !== " - ");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161d1f]">
            Doctor Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Doctor Name and Specialization */}
          <div className="mb-6">
            <h3 className="text-[14px] font-medium text-[#161d1f] mb-2">
              {doctor.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-[10px]">{doctor.specialization_id}</span>
              <span>|</span>
              <span className="text-[10px]">{doctor.department_id}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <span className="text-[12px] font-medium text-[#161d1f] mr-3">
              Tags:
            </span>
            <div className="inline-flex gap-2">
              <span className="px-3 py-1 text-[10px] bg-cyan-100 text-cyan-700 rounded-lg border border-cyan-200">
                {doctor.experience_in_yrs} yrs. exp.
              </span>
              <span className="px-3 py-1 text-[10px] bg-purple-100 text-purple-700 rounded-lg border border-purple-200">
                {doctor.rating || 4.2} rating
              </span>
              {doctor.is_available_online && (
                <span className="px-3 py-1 text-[10px] bg-green-100 text-green-700 rounded-lg border border-green-200">
                  Online
                </span>
              )}
              {doctor.is_available_in_person && (
                <span className="px-3 py-1 text-[10px] bg-orange-100 text-orange-700 rounded-lg border border-orange-200">
                  In-Person
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <span className="text-[10px] font-medium text-[#161d1f]">
              Description:
            </span>
            <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">
              {doctor.about ||
                `${doctor.name} is a ${doctor.specialization_id} specialist. He has trained in the best institution in India. He has done his MBBS from a prestigious university. Done his post-graduation in ${doctor.specialization_id}.`}
            </p>
          </div>

          {/* Qualifications and Consultation Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <span className="text-[10px] font-medium text-[#161d1f]">
                Qualifications:
              </span>
              <p className="text-[10px] text-gray-600 mt-1">
                {doctor.qualifications || "MBBS, MD (Oncology)"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-medium text-[#161d1f]">
                Consultation Pricing:
              </span>
              <p className="text-[10px] text-gray-600 mt-1">
                Rs. {doctor.consultation_price}
              </p>
            </div>
          </div>

          {/* Compliances */}
          <div className="mb-6">
            <h4 className="text-[10px] font-medium text-[#161d1f] mb-3">
              Compliances
            </h4>
            <div className="bg-blue-50 rounded-lg p-4 border border-[#D3D7D8]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-[10px] font-medium text-[#161d1f]">
                    MCI Registration:
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {doctor.mci || "MCI-12345-2020"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-medium text-[#161d1f]">
                    NMC Registration:
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {doctor.nmc || "NMC-12345-2020"}
                  </span>
                </div>
                <div className="flex justify-between md:col-span-2">
                  <span className="text-[10px] font-medium text-[#161d1f]">
                    State Registration:
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {doctor.state_registration || "SR-001-2024"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Available Slots */}
          <div className="mb-6">
            <h4 className="text-[10px] font-medium text-[#161d1f] mb-4">
              Available Slots
            </h4>

            {/* Day Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {weekDays.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 text-[10px] rounded-lg whitespace-nowrap ${
                    selectedDay === day
                      ? "bg-[#0088B1] text-white"
                      : "bg-gray-100 text-[#161D1F] hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Time Slots for Selected Day */}
            <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
              {formatTimeSlots(selectedDay).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {formatTimeSlots(selectedDay).map((timeSlot, index) => (
                    <div
                      key={index}
                      className="bg-white px-3 py-2 rounded-lg text-[10px] text-center text-gray-700 border"
                    >
                      {timeSlot}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[10px] text-gray-500 py-8">
                  No slots available for {selectedDay}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleEdit}
            className="px-6 py-2 text-[10px] bg-[#1BA3C7] text-white rounded-lg hover:bg-[#1591B8] transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsModal;
