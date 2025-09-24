"use client";
import React from "react";
import { Star, Phone, Mail, MapPin, X, Edit, Calendar } from "lucide-react";
import { Staff } from "../types";

interface ViewStaffModalProps {
  staff: Staff;
  onClose: () => void;
  onEdit: () => void;
}

const ViewStaffModal: React.FC<ViewStaffModalProps> = ({
  staff,
  onClose,
  onEdit,
}) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="bg-[#F3F9FB] rounded-xl shadow-xl w-[700px] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-sky-100 rounded-full text-lg font-semibold text-sky-700">
              {staff.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {staff.name}
              </h2>
              <p className="text-xs text-gray-500">{staff.position}</p>
            </div>
            <span
              className={`ml-2 text-xs px-2 py-1 rounded ${
                staff.status === "Busy"
                  ? "bg-red-100 text-red-600"
                  : staff.status === "Available"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {staff.status}
            </span>
          </div>

          {/* Info Sections */}
          <div className="grid grid-cols-2 gap-4">
            {/* Contact Info */}
            <div className="border border-[#899193] rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-medium text-black mb-2">
                Contact Information
              </h3>
              <p className="text-xs text-gray-800">
                <span className="font-medium">Phone: </span>
                {staff.phone}
              </p>
              {staff.email && (
                <p className="text-xs text-gray-800">
                  <span className="font-medium">Email: </span>
                  {staff.email}
                </p>
              )}
              <p className="text-xs text-gray-800">
                <span className="font-medium">Address: </span>
                {staff.address}
              </p>
            </div>

            {/* Professional Details */}
            <div className="border border-[#899193] rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-medium text-black mb-2">
                Professional Details
              </h3>
              <p className="text-xs text-gray-800">
                Experience: {staff.experience}
              </p>
              <p className="flex items-center gap-1 text-xs text-gray-800">
                Rating:{" "}
                <Star className="w-4 h-4 text-yellow-400 fill-current" />{" "}
                {staff.rating.toFixed(1)}
              </p>
              <p className="text-xs text-gray-800">
                Active Orders: {staff.activeOrders}
              </p>
              <p className="text-xs text-gray-800">
                Completed Orders: {staff.completedOrders}
              </p>
              <p className="text-xs text-gray-800">
                Join Date: {staff.joinDate}
              </p>
            </div>
          </div>

          {/* Specializations */}
          <div className=" border border-[#899193] rounded-lg p-4 space-y-2">
            <h3 className="text-xs font-medium text-gray-700 mb-2">
              Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {staff.departments?.map((dep, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[#0088B1] text-xs rounded-md"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {staff.certifications && staff.certifications.length > 0 && (
            <div className=" border border-[#899193] rounded-lg p-4 space-y-2">
              <h3 className="text-xs font-medium text-gray-700 mb-2">
                Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {staff.certifications?.map((cert, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-[#0088B1] text-xs rounded-md"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 gap-5">
            <button className="flex items-center gap-2 bg-[#0088B1]  text-white text-xs px-4 py-2 rounded-lg">
              <Phone className="w-4 h-4" /> Contact Staff
            </button>

            <button className="flex items-center gap-2 border border-gray-300 bg-[#0088B1]  text-white   text-xs px-4 py-2 rounded-lg">
              <Calendar className="w-4 h-4" /> View Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStaffModal;
