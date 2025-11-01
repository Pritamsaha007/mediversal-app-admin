"use client";
import React, { useState, useEffect } from "react";
import { X, Search, Star, Clock, Calendar } from "lucide-react";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import {
  fetchPhleboSpecializations,
  EnumItem,
  updateLabTestBooking,
  AvailableSlotsPayload,
  fetchAvailableSlots,
} from "../../services";
import { PhlebotomistSlot } from "../type";

interface AssignPhlebotomistModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onAssignmentSuccess?: () => void;
}

export const AssignPhlebotomistModal: React.FC<
  AssignPhlebotomistModalProps
> = ({ isOpen, onClose, booking, onAssignmentSuccess }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Phlebotomists");
  const [assignedPhlebotomist, setAssignedPhlebotomist] = useState<{
    phlebotomist: PhlebotomistSlot;
    selectedSlot: PhlebotomistSlot;
  } | null>(null);
  const [phlebotomistSlots, setPhlebotomistSlots] = useState<
    PhlebotomistSlot[]
  >([]);
  const [specializations, setSpecializations] = useState<EnumItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [openTimeDropdown, setOpenTimeDropdown] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { token } = useAdminStore();

  const fetchSpecializations = async () => {
    setLoadingSpecializations(true);
    try {
      const response = await fetchPhleboSpecializations(token);
      if (response.success) {
        setSpecializations(response.roles);
      } else {
        toast.error("Failed to fetch specializations");
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
      toast.error("Error loading specializations");
    } finally {
      setLoadingSpecializations(false);
    }
  };

  const getCategories = () => {
    const baseCategories = ["All Phlebotomists"];
    if (specializations.length > 0) {
      const specializationCategories = specializations.map(
        (spec) => spec.value
      );
      return [...baseCategories, ...specializationCategories];
    }

    return [
      "All Phlebotomists",
      "General Collection",
      "Pediatric Collection",
      "Senior Citizens",
      "Home Collection",
      "Critical Care",
    ];
  };

  const categories = getCategories();

  const fetchAvailableSlotsData = async () => {
    setLoading(true);
    try {
      const payload: AvailableSlotsPayload = {
        search_text: searchTerm || null,
        city_id: null,
        area_id: null,
        date: selectedDate || new Date().toISOString().split("T")[0], // Default to today
      };

      const response = await fetchAvailableSlots(payload, token);

      if (response.success) {
        setPhlebotomistSlots(response.slots);
      } else {
        toast.error("Failed to fetch available slots");
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Error loading available slots");
    } finally {
      setLoading(false);
    }
  };

  // Group slots by phlebotomist
  const getGroupedPhlebotomists = () => {
    const grouped: { [key: string]: PhlebotomistSlot[] } = {};

    phlebotomistSlots.forEach((slot) => {
      if (!grouped[slot.phlebo_id]) {
        grouped[slot.phlebo_id] = [];
      }
      grouped[slot.phlebo_id].push(slot);
    });

    return grouped;
  };

  const groupedPhlebotomists = getGroupedPhlebotomists();

  // Filter phlebotomists based on search and category
  const filteredPhlebotomistIds = Object.keys(groupedPhlebotomists).filter(
    (phleboId) => {
      const slots = groupedPhlebotomists[phleboId];
      const firstSlot = slots[0];

      const matchesSearch =
        firstSlot.phlebo_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        firstSlot.specialization_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Phlebotomists" ||
        firstSlot.specialization_name === selectedCategory;

      return matchesSearch && matchesCategory;
    }
  );

  const handleAssign = (phleboId: string, selectedSlot: PhlebotomistSlot) => {
    const slots = groupedPhlebotomists[phleboId];
    const firstSlot = slots[0];

    setAssignedPhlebotomist({
      phlebotomist: firstSlot,
      selectedSlot: selectedSlot,
    });
    toast.success(`Assigned ${firstSlot.phlebo_name}`);
    setOpenTimeDropdown(null);
  };

  const handleRemoveAssignment = () => {
    setAssignedPhlebotomist(null);
  };

  const handleSaveAssignment = async () => {
    if (!assignedPhlebotomist || !booking?.id) {
      toast.error("No phlebotomist assigned or booking not found");
      return;
    }

    setSaving(true);
    try {
      const timeString = assignedPhlebotomist.selectedSlot.start_time;
      const [hours, minutes] = timeString.split(":");
      const bookingTime = parseInt(hours) * 100 + parseInt(minutes);

      const updatePayload = {
        id: booking.id,
        phlebotomist_id: assignedPhlebotomist.phlebotomist.phlebo_id,
        booking_date: assignedPhlebotomist.selectedSlot.slot_date,
        booking_time: bookingTime,
      };

      const response = await updateLabTestBooking(updatePayload, token);

      if (response.success) {
        toast.success("Phlebotomist assigned successfully!");
        onAssignmentSuccess?.();
        onClose();
      } else {
        throw new Error("Failed to assign phlebotomist");
      }
    } catch (error) {
      console.error("Error assigning phlebotomist:", error);
      toast.error("Failed to assign phlebotomist");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
      case "On Duty":
        return "bg-[#50B57F]";
      case "Busy":
        return "bg-gray-400";
      case "Offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const isAssigned = (phleboId: string) => {
    return assignedPhlebotomist?.phlebotomist.phlebo_id === phleboId;
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchSpecializations();

      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchAvailableSlotsData();
    }
  }, [isOpen, searchTerm, selectedDate, selectedCategory]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isOpen && selectedDate) {
        fetchAvailableSlotsData();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".time-dropdown")) {
        setOpenTimeDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#161D1F]">
              Assign Phlebotomist
            </h3>
            <div className="bg-[#0088B1] rounded-lg py-3 px-4 mt-3">
              <p className="text-sm font-semibold text-white">
                Booking ID:{" "}
                {booking?.id
                  ? `${booking.id.substring(0, 8).toUpperCase()}`
                  : "LP0006789"}
              </p>
              <p className="text-xs text-white mt-1">
                {booking?.patient_details?.patients_list?.[0]?.name ||
                  "Patient Name"}{" "}
                •{" "}
                {booking?.booking_date
                  ? new Date(booking.booking_date).toLocaleDateString()
                  : "15 Aug 2025"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg ml-4"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {assignedPhlebotomist && (
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-[#161D1F] mb-3">
              Assigned Phlebotomist
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#E8F4F7] rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-semibold">
                      {assignedPhlebotomist.phlebotomist.phlebo_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-[#161D1F]">
                        {assignedPhlebotomist.phlebotomist.phlebo_name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-600">
                        {assignedPhlebotomist.phlebotomist.specialization_name}
                      </span>
                      <span className="text-xs text-[#0088b1] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(
                          assignedPhlebotomist.selectedSlot.start_time
                        )}{" "}
                        -{" "}
                        {formatTime(assignedPhlebotomist.selectedSlot.end_time)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(
                          assignedPhlebotomist.selectedSlot.slot_date
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-700">
                          {parseFloat(
                            assignedPhlebotomist.phlebotomist.rating
                          ).toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {assignedPhlebotomist.phlebotomist.experience_in_yrs}{" "}
                        yrs exp.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Status:</span>
                  <span
                    className={`px-3 py-1 ${getStatusColor(
                      assignedPhlebotomist.phlebotomist.status
                    )} text-white text-xs font-medium rounded`}
                  >
                    {assignedPhlebotomist.phlebotomist.status}
                  </span>
                </div>

                <button
                  onClick={handleRemoveAssignment}
                  className="px-4 py-2 text-red-600 rounded-lg text-xs font-medium ml-4"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Name, Specialisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-[#0088B1] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#161D1F] mb-4">
                Available Phlebotomists
                {loading && (
                  <span className="text-xs text-gray-500 ml-2">Loading...</span>
                )}
              </h4>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading available phlebotomists...
                  </div>
                ) : filteredPhlebotomistIds.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No phlebotomists available matching your criteria.
                  </div>
                ) : (
                  filteredPhlebotomistIds.map((phleboId) => {
                    const slots = groupedPhlebotomists[phleboId];
                    const firstSlot = slots[0];
                    const availableSlots = slots.filter(
                      (slot) => slot.available_count > 0
                    );

                    return (
                      <div
                        key={phleboId}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#E8F4F7] rounded-full flex items-center justify-center">
                            <span className="text-black text-xs font-semibold">
                              {firstSlot.phlebo_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-semibold text-[#161D1F]">
                                {firstSlot.phlebo_name}
                              </h4>
                            </div>

                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-600">
                                {firstSlot.specialization_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium text-gray-700">
                                  {parseFloat(firstSlot.rating).toFixed(1)}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {firstSlot.experience_in_yrs} yrs experience
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs text-gray-600">
                              Available Slots: {availableSlots.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">
                              Status:
                            </span>
                            <span
                              className={`px-3 py-1 ${getStatusColor(
                                firstSlot.status
                              )} text-white text-xs font-medium rounded`}
                            >
                              {firstSlot.status}
                            </span>
                          </div>

                          <div className="relative time-dropdown">
                            <button
                              onClick={() =>
                                setOpenTimeDropdown(
                                  openTimeDropdown === phleboId
                                    ? null
                                    : phleboId
                                )
                              }
                              disabled={
                                availableSlots.length === 0 ||
                                isAssigned(phleboId) ||
                                assignedPhlebotomist !== null
                              }
                              className={`px-6 py-2 rounded-lg text-xs font-medium ml-4 ${
                                availableSlots.length > 0 &&
                                !isAssigned(phleboId) &&
                                assignedPhlebotomist === null
                                  ? "bg-[#0088B1] text-white hover:bg-[#00729A]"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {isAssigned(phleboId)
                                ? "Assigned"
                                : assignedPhlebotomist
                                ? "Already Assigned Other Staff"
                                : "Select Time"}
                            </button>

                            {openTimeDropdown === phleboId &&
                              availableSlots.length > 0 &&
                              assignedPhlebotomist === null && (
                                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-60 overflow-y-auto">
                                  <div className="p-2">
                                    <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                      Available Time Slots
                                    </h5>
                                    {availableSlots.map((slot, index) => (
                                      <button
                                        key={index}
                                        onClick={() =>
                                          handleAssign(phleboId, slot)
                                        }
                                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 rounded-md mb-1 border border-gray-100"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium">
                                            {formatTime(slot.start_time)} -{" "}
                                            {formatTime(slot.end_time)}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {formatDate(slot.slot_date)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                          <span>
                                            Available: {slot.available_count}/
                                            {slot.capacity}
                                          </span>
                                          <span>{slot.slot_day}</span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAssignment}
            disabled={!assignedPhlebotomist || saving}
            className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors ${
              assignedPhlebotomist && !saving
                ? "bg-[#0088B1] text-white hover:bg-[#00729A]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Assigning..." : "Assign Staff"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignPhlebotomistModal;
