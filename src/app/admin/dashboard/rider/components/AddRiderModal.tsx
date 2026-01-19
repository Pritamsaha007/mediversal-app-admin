"use client";
import React, { useState, useEffect, useMemo } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import DeliveryOrder, { DeliveryRider } from "../types";
import {
  fetchRiderStatus,
  searchRider,
  updateOrderRiderInfo,
} from "../services";
import { useAdminStore } from "@/app/store/adminStore";
import { useRiderAssignmentStore } from "../store/assignRiderStore";

interface AssignRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: DeliveryOrder;
  onAssignmentSuccess?: () => void;
}

export const AssignRiderModal: React.FC<AssignRiderModalProps> = ({
  isOpen,
  onClose,
  order,
  onAssignmentSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Riders");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [riders, setRiders] = useState<DeliveryRider[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const categories = ["All Riders", "Motorcycle", "Scooter", "Bicycle"];
  const cityOptions = ["All Cities", "Patna", "Begusarai"];
  const { token } = useAdminStore();

  const {
    assignments,
    addAssignment,
    removeAssignment,
    getAssignment,
    hasAssignment,
  } = useRiderAssignmentStore();

  const storedAssignment = getAssignment(order.id);
  const [assignedRider, setAssignedRider] = useState<{
    rider: DeliveryRider;
  } | null>(storedAssignment ? { rider: storedAssignment.rider } : null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getVehicleType = (vehicleTypeId: string, vehicleName: string) => {
    switch (vehicleTypeId) {
      case "1":
        return "Motorcycle";
      case "2":
        return "Bicycle";
      default:
        return vehicleName || "Vehicle";
    }
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "Available" : "Unavailable";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#50B57F]";
      case "inactive":
        return "bg-gray-400";
      default:
        return "bg-gray-500";
    }
  };

  const fetchRiders = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        start: 0,
        max: 50,
        is_deleted: false,
        is_available_status: "active",
      };

      const ridersData = await searchRider(payload, token);
      setRiders(ridersData);
    } catch (error: any) {
      console.error("Error fetching riders:", error);
      toast.error("Failed to load riders");
      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = useMemo(() => {
    return riders.filter((rider) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.license_no?.toLowerCase().includes(searchTerm.toLowerCase());

      const vehicleType = getVehicleType(
        rider.vehicle_type_id,
        rider.vehicle_name
      );
      const matchesCategory =
        selectedCategory === "All Riders" || vehicleType === selectedCategory;

      const matchesCity =
        selectedCity === "All Cities" ||
        (rider.service_city_name &&
          rider.service_city_name.toLowerCase() === selectedCity.toLowerCase());

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [riders, searchTerm, selectedCategory, selectedCity]);

  useEffect(() => {
    const ids = filteredRiders.map((r) => r.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

    if (duplicates.length) {
      console.log("Duplicate rider keys found:", duplicates);
    }
  }, [filteredRiders]);

  const handleAssign = (rider: DeliveryRider) => {
    const assignment = { rider };
    setAssignedRider(assignment);

    addAssignment(order.id, rider);

    toast.success(`Assigned ${rider.name}`);
  };

  const handleRemoveAssignment = () => {
    setAssignedRider(null);

    removeAssignment(order.id);
  };

  const handleSaveAssignment = async () => {
    if (!assignedRider || !order?.id) {
      toast.error("No rider assigned or order not found");
      return;
    }

    const RiderStatus = await fetchRiderStatus(token);

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: order.id,
        rider_staff_id: assignedRider.rider.id,
        rider_delivery_status_id: RiderStatus.roles[0].id,
      };

      const response = await updateOrderRiderInfo(payload, token);

      if (response.success) {
        toast.success("Rider assigned successfully!");

        onAssignmentSuccess?.();
        onClose();
      } else {
        throw new Error(response.message || "Failed to assign rider");
      }
    } catch (error: any) {
      console.error("Error assigning rider:", error);
      toast.error(error.message || "Failed to assign rider");
    } finally {
      setSaving(false);
    }
  };

  const isAssigned = (riderId: string) => {
    return assignedRider?.rider.id === riderId;
  };

  useEffect(() => {
    if (isOpen) {
      const storedAssignment = getAssignment(order.id);
      if (storedAssignment) {
        setAssignedRider({ rider: storedAssignment.rider });
      } else {
        setAssignedRider(null);
      }

      setSearchTerm("");
      setSelectedCategory("All Riders");
      setSelectedCity("All Cities");
      fetchRiders();
    }
  }, [isOpen, order.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const modalContainer = document.querySelector(".modal-container");
      if (modalContainer && !modalContainer.contains(target) && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutsideDropdown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".category-dropdown") &&
        !target.closest(".city-dropdown")
      ) {
        setShowCategoryDropdown(false);
        setShowCityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col modal-container">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex justify-between">
              <h3 className="text-sm font-semibold text-[#161D1F]">
                Assign Delivery Rider
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg ml-4"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="bg-[#0088B1] rounded-lg py-3 px-4 mt-3">
              <p className="text-sm font-semibold text-white">
                Order ID: {order?.id || "ORD000004864"}
                {storedAssignment && (
                  <span className="text-xs ml-2 opacity-75">
                    (Previously assigned:{" "}
                    {storedAssignment.assignedAt
                      ? new Date(storedAssignment.assignedAt).toLocaleString()
                      : "Draft"}
                    )
                  </span>
                )}
              </p>

              <p className="text-xs text-white mt-1">
                City: {order?.billing_city || "Unknown"}
              </p>
            </div>
          </div>
        </div>

        {assignedRider && (
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-[#161D1F] mb-3">
              Assigned Rider
              {storedAssignment && (
                <span className="text-xs text-gray-500 ml-2">
                  (Saved draft)
                </span>
              )}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#E8F4F7] rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-semibold">
                      {getInitials(assignedRider.rider.name)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-[#161D1F]">
                        {assignedRider.rider.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-[#0088b1] flex items-center gap-1">
                        {assignedRider.rider.license_no}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600">
                  Vehicle:{" "}
                  {getVehicleType(
                    assignedRider.rider.vehicle_type_id,
                    assignedRider.rider.vehicle_name
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Status:</span>
                  <span
                    className={`px-3 py-1 ${getStatusColor(
                      assignedRider.rider.is_available_status
                    )} text-white text-xs font-medium rounded`}
                  >
                    {getStatusText(assignedRider.rider.is_available_status)}
                  </span>
                </div>

                <button
                  onClick={handleRemoveAssignment}
                  className="px-4 py-2 text-red-600 rounded-lg text-xs font-medium ml-4 hover:bg-red-50"
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
                placeholder="Search by Name, License No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0088B1]"></div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <div className="relative category-dropdown">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center justify-between w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span>{selectedCategory}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showCategoryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full md:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs  first:rounded-t-lg last:rounded-b-lg ${
                          selectedCategory === category
                            ? "bg-[#0088B1] text-white hover:bg-[#00729A]"
                            : "text-gray-700"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative city-dropdown">
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center justify-between w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span>{selectedCity}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showCityDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCityDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full md:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {cityOptions.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setShowCityDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs  first:rounded-t-lg last:rounded-b-lg ${
                          selectedCity === city
                            ? "bg-[#50B57F] text-white hover:bg-[#409469]"
                            : "text-gray-700"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#161D1F] mb-4">
                Available Riders
                <span className="text-xs text-gray-500 ml-2">
                  ({filteredRiders.length} found)
                </span>
              </h4>

              <div className="border border-gray-200 rounded-lg max-h-[500px] overflow-y-auto">
                {loading && filteredRiders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088B1] mx-auto mb-2"></div>
                    Loading available riders...
                  </div>
                ) : filteredRiders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No riders available matching your criteria.
                  </div>
                ) : (
                  filteredRiders.map((rider) => {
                    const assigned = isAssigned(rider.id);
                    const alreadyAssigned = assignedRider && !assigned;

                    return (
                      <>
                        {!assigned && (
                          <div
                            key={rider.id}
                            className="flex items-center justify-between p-4 border border-gray-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-[#E8F4F7] rounded-full flex items-center justify-center">
                                <span className="text-black text-xs font-semibold">
                                  {getInitials(rider.name)}
                                </span>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-semibold text-[#161D1F]">
                                    {rider.name}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-4 mt-1">
                                  <div className="text-right">
                                    <span className="text-xs text-gray-600">
                                      License: {rider.license_no}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <span className="text-xs text-gray-600">
                              Vehicle:{" "}
                              {getVehicleType(
                                rider.vehicle_type_id,
                                rider.vehicle_name
                              )}
                            </span>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">
                                Status:
                              </span>
                              <span
                                className={`px-3 py-1 ${getStatusColor(
                                  rider.is_available_status
                                )} text-white text-xs font-medium rounded`}
                              >
                                {getStatusText(rider.is_available_status)}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleAssign(rider)}
                                disabled={
                                  rider.is_available_status !== "active" ||
                                  alreadyAssigned ||
                                  assigned
                                }
                                className={`px-6 py-2 rounded-lg text-xs font-medium ml-4 transition-colors ${
                                  rider.is_available_status === "active" &&
                                  !alreadyAssigned &&
                                  !assigned
                                    ? "text-[#0088B1]"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                {assigned
                                  ? "Assigned"
                                  : alreadyAssigned
                                  ? "Assign"
                                  : "Assign"}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
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
            disabled={!assignedRider || saving}
            className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors ${
              assignedRider && !saving
                ? "bg-[#0088B1] text-white hover:bg-[#00729A]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                Assigning...
              </>
            ) : (
              "Assign Rider"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignRiderModal;
