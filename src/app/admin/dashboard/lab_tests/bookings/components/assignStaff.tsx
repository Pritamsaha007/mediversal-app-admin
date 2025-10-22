"use client";
import React, { useState } from "react";
import { X, Search, Star } from "lucide-react";

interface PhlebotomistType {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: number;
  status: "Available" | "Busy" | "Offline";
}

interface AssignPhlebotomistModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

export const AssignPhlebotomistModal: React.FC<
  AssignPhlebotomistModalProps
> = ({ isOpen, onClose, booking }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Phlebotomists");
  const [assignedPhlebotomists, setAssignedPhlebotomists] = useState<
    PhlebotomistType[]
  >([]);

  const phlebotomists: PhlebotomistType[] = [
    {
      id: "1",
      name: "Sarah Wilson",
      specialization: "General Collection",
      rating: 4.9,
      experience: 8,
      status: "Available",
    },
    {
      id: "2",
      name: "Michael Johnson",
      specialization: "Senior Citizens",
      rating: 4.7,
      experience: 12,
      status: "Available",
    },
    {
      id: "3",
      name: "Emily Chen",
      specialization: "General Collection",
      rating: 5.0,
      experience: 10,
      status: "Available",
    },
    {
      id: "4",
      name: "Robert Davis",
      specialization: "Paediatric Collection",
      rating: 4.8,
      experience: 6,
      status: "Busy",
    },
    {
      id: "5",
      name: "Sarah Miller",
      specialization: "Home Collection",
      rating: 4.9,
      experience: 9,
      status: "Available",
    },
    {
      id: "6",
      name: "James Wilson",
      specialization: "Critical Care",
      rating: 4.6,
      experience: 11,
      status: "Available",
    },
  ];

  const categories = [
    "All Phlebotomists",
    "General Collection",
    "Paediatric Collection",
    "Senior Citizens",
    "Home Collection",
    "Critical Care",
  ];

  const filteredPhlebotomists = phlebotomists.filter(
    (phleb) =>
      (selectedCategory === "All Phlebotomists" ||
        phleb.specialization === selectedCategory) &&
      (phleb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phleb.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAssign = (phlebotomist: PhlebotomistType) => {
    if (!assignedPhlebotomists.find((p) => p.id === phlebotomist.id)) {
      setAssignedPhlebotomists([...assignedPhlebotomists, phlebotomist]);
    }
  };

  const handleRemoveAssignment = (phlebotomistId: string) => {
    setAssignedPhlebotomists(
      assignedPhlebotomists.filter((p) => p.id !== phlebotomistId)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-[#50B57F]";
      case "Busy":
        return "bg-gray-400";
      case "Offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const isAssigned = (phlebotomistId: string) => {
    return assignedPhlebotomists.some((p) => p.id === phlebotomistId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#161D1F]">
              Assign Phlebotomist
            </h3>
            <div className="bg-[#0088B1] rounded-lg py-3 px-4 mt-3">
              <p className="text-sm font-semibold text-white">
                Booking ID: {booking?.bookingId || "LP0006789"}
              </p>
              <p className="text-xs text-white mt-1">
                {booking?.patientName || "Hanshika Sharma"} • 15 Aug 2025
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

        {/* Assigned Phlebotomists Section */}
        {assignedPhlebotomists.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-[#161D1F] mb-3">
              Assigned Phlebotomists ({assignedPhlebotomists.length})
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {assignedPhlebotomists.map((assignedPhleb) => (
                <div
                  key={assignedPhleb.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* Staff Avatar/Initials */}
                    <div className="w-12 h-12 bg-[#E8F4F7] rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-semibold">
                        {assignedPhleb.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>

                    {/* Staff Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-[#161D1F]">
                          {assignedPhleb.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-600">
                          {assignedPhleb.specialization}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium text-gray-700">
                            {assignedPhleb.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      Experience:{" "}
                      <span className="font-medium">
                        {assignedPhleb.experience} Yrs.
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Status:</span>
                    <span
                      className={`px-3 py-1 ${getStatusColor(
                        assignedPhleb.status
                      )} text-white text-xs font-medium rounded`}
                    >
                      {assignedPhleb.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveAssignment(assignedPhleb.id)}
                    className="px-4 py-2 text-red-600 rounded-lg text-xs font-medium ml-4"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Search Bar */}
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

            {/* Categories */}
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

            {/* All Phlebotomists Section */}
            <div>
              <h4 className="text-sm font-semibold text-[#161D1F] mb-4">
                All Phlebotomists
              </h4>

              {/* Phlebotomists List */}
              <div className="space-y-4">
                {filteredPhlebotomists.map((phleb) => (
                  <div
                    key={phleb.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {/* Staff Avatar/Initials */}
                      <div className="w-12 h-12 bg-[#E8F4F7] rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-semibold">
                          {phleb.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>

                      {/* Staff Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-[#161D1F]">
                            {phleb.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-600">
                            {phleb.specialization}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium text-gray-700">
                              {phleb.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">
                        Experience:{" "}
                        <span className="font-medium">
                          {phleb.experience} Yrs.
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Status:</span>
                      <span
                        className={`px-3 py-1 ${getStatusColor(
                          phleb.status
                        )} text-white text-xs font-medium rounded`}
                      >
                        {phleb.status}
                      </span>
                    </div>

                    {/* Assign Button */}
                    <button
                      onClick={() => handleAssign(phleb)}
                      disabled={
                        phleb.status !== "Available" || isAssigned(phleb.id)
                      }
                      className={`px-6 py-2 rounded-lg text-xs font-medium ml-4 ${
                        phleb.status === "Available" && !isAssigned(phleb.id)
                          ? "text-[#0088B1] hover:text-[#00729A]"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {isAssigned(phleb.id) ? "Assigned" : "Assign"}
                    </button>
                  </div>
                ))}
              </div>

              {filteredPhlebotomists.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No phlebotomists found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            disabled={assignedPhlebotomists.length === 0}
            className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors ${
              assignedPhlebotomists.length > 0
                ? "bg-[#0088B1] text-white hover:bg-[#00729A]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Assign Staff{assignedPhlebotomists.length > 1 ? "s" : ""} (
            {assignedPhlebotomists.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignPhlebotomistModal;
