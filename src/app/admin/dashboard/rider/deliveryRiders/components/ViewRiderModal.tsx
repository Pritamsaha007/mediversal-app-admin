"use client";
import React from "react";
import {
  X,
  Edit,
  Link2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  IndianRupee,
  Truck,
  User,
  CreditCard,
} from "lucide-react";
import { DeliveryRider } from "../../types";

interface ViewRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  rider: DeliveryRider | null;
  onEdit: (rider: DeliveryRider) => void;
}

export const ViewRiderModal: React.FC<ViewRiderModalProps> = ({
  isOpen,
  onClose,
  rider,
  onEdit,
}) => {
  if (!isOpen || !rider) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const riderStats = {
    totalEarnings: "₹6,432.00",
    totalDeliveries: 28,
    rating: "4.5",
    completedOrders: 24,
    cancelledOrders: 4,
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6  ">
            <h3 className="text-[16px] font-semibold text-[#161D1F]">
              Rider Details
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-[#899193]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-[#0088b1]">
                  <span className="text-[#0088B1] font-bold text-md">
                    {getInitials(rider.name)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-md font-semibold text-[#161D1F]">
                      {rider.name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#161D1F]">
                    <CreditCard className="w-4 h-4" />
                    <span>License No: {rider.license_no}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-black text-sm">Tags:</span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${
                    rider.is_available_status === "active"
                      ? " text-[#50B57F] border-[#50B57F]"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {rider.is_available_status === "active"
                    ? "Active"
                    : "Inactive"}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${
                    rider.is_poi_verified_status === "approved"
                      ? " text-[#0088B1] border-[#0088B1]"
                      : rider.is_poi_verified_status === "pending"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {rider.is_poi_verified_status.charAt(0).toUpperCase() +
                    rider.is_poi_verified_status.slice(1)}
                </span>
              </div>

              <div className="flex flex-row items-center mb-3">
                <h3 className="text-[14px] font-semibold text-[#161D1F]">
                  Assigned Vehicle:
                </h3>
                <h3 className="text-[14px] font-semibold text-[#161D1F] ml-1">
                  {rider.vehicle_name}
                </h3>
              </div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#161D1F] mb-3">
                  Personal Details:
                </h3>
                <div className="rounded-lg border border-[#D3D7D8] bg-[#E8F4F7] p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex  items-center gap-3">
                      <div className="flex flex-row items-center gap-3">
                        <div className="text-xs font-medium text-[#161D1F]">
                          Contact No:
                        </div>
                        <div className="text-xs  text-[#161D1F]">
                          {rider.mobile_number}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-row items-center gap-3">
                        <div className="text-xs font-medium text-[#161D1F]">
                          Email ID:
                        </div>
                        <div className="text-xs text-[#161D1F]">
                          {rider.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2">
                      <div className="flex flex-row items-center gap-3">
                        <div className="text-xs font-medium text-[#161D1F]">
                          Aadhaar No:
                        </div>
                        <div className="text-xs  text-[#161D1F]">
                          {rider.aadhar_number}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#161D1F] mb-3">
                  Professional Details:
                </h3>
                <div className="rounded-lg border border-[#D3D7D8] p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-row items-center gap-3">
                        <div className="text-xs font-medium text-[#161D1F]">
                          Joining Date:
                        </div>
                        <div className="text-xs  text-[#161D1F]">
                          {formatDate(rider.joining_date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-row items-center gap-3">
                        <div className="text-xs font-medium text-[#161D1F]">
                          Total Earnings:
                        </div>
                        <div className="text-xs  text-[#161D1F]">
                          {riderStats.totalEarnings}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-row items-center gap-3">
                        <div className="text-xs  font-medium text-[#161D1F]">
                          Total Deliveries:
                        </div>
                        <div className="text-xs  text-[#161D1F]">
                          {riderStats.totalDeliveries}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-row items-center gap-3">
                        <div className="text-xs font-medium text-[#161D1F]">
                          Service City/Town:
                        </div>
                        <div className="text-xs  text-[#161D1F]">
                          {rider.service_city_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-row items-center gap-3">
                        <div className="text-xs font-medium text-[#161D1F] ">
                          Service PIN:
                        </div>
                        <div className="text-xs  text-[#161D1F]">
                          {rider.pin_codes}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-[#161D1F] bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
