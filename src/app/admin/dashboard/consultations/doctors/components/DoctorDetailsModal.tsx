"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { Doctor } from "../data/doctorsData";
import { EnumItem } from "../services/doctorService";

interface DoctorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onEdit?: (doctor: Doctor) => void;
  enumData: {
    departments: EnumItem[];
    specializations: EnumItem[];
    languages: EnumItem[];
    days: EnumItem[];
  };
}

const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onEdit,
  enumData,
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
      .filter((slot) => slot.startTime && slot.endTime) // Filter out empty slots
      .map((slot) => ({
        time: `${slot.startTime} - ${slot.endTime}`,
        capacity: slot.maxPatientsPerSlot || "0",
      }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
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
            <h4 className="text-[12px] font-medium text-[#161d1f] mb-4">
              Weekly Schedule
            </h4>
            <div className="mb-6">
              <div className="space-y-4">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((dayName) => {
                  // Get slots from availability if available
                  let daySlots = doctor.availability?.[dayName] || [];

                  // If no slots in availability, get from doctor_slots
                  if (daySlots.length === 0 && doctor.doctor_slots) {
                    daySlots = doctor.doctor_slots
                      .filter((slot) => slot.day === dayName)
                      .map((slot) => ({
                        id: slot.id,
                        startTime: slot.start_time.substring(0, 5),
                        endTime: slot.end_time.substring(0, 5),
                        maxPatientsPerSlot: slot.slot_capacity.toString(),
                      }));
                  }

                  const hasSlots =
                    daySlots.length > 0 &&
                    daySlots.some((slot) => slot.startTime && slot.endTime);

                  return (
                    <div
                      key={dayName}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-[11px] font-medium text-[#161d1f]">
                          {dayName}
                        </h5>
                        <span className="text-[9px] text-gray-500">
                          {
                            daySlots.filter(
                              (slot) => slot.startTime && slot.endTime
                            ).length
                          }{" "}
                          slots
                        </span>
                      </div>

                      {hasSlots ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {daySlots
                            .filter((slot) => slot.startTime && slot.endTime)
                            .map((slot, index) => (
                              <div
                                key={index}
                                className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-center"
                              >
                                <div className="text-[10px] font-medium text-blue-800">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                <div className="text-[8px] text-blue-600 mt-1">
                                  Max {slot.maxPatientsPerSlot || 0} patients
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 text-[10px] text-gray-400 bg-gray-50 rounded-lg">
                          No slots available
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
