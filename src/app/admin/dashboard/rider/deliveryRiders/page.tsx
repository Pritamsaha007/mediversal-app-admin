"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  Bike,
  Box,
  BadgePercent,
} from "lucide-react";
import toast from "react-hot-toast";
import { ViewRiderModal } from "./components/ViewRiderModal";
import { AddRiderModal } from "./components/CreateNewModal";
import { DeliveryRider, RidersStats } from "../types";

import { useAdminStore } from "@/app/store/adminStore";
import StatusBadge from "../../home-care/components/StatusBadge";
import StatsCard from "../../home-care/components/StatsCard";
import { deleteRider, getRidersStats, searchRider } from "../services";

const DeliveryRiders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [riders, setRiders] = useState<DeliveryRider[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<DeliveryRider[]>([]);
  const [openDropdown, setOpenDropdown] = useState<null | "status">(null);
  const [selectedRiders, setSelectedRiders] = useState<string[]>([]);
  const [riderActionDropdown, setRiderActionDropdown] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const [showViewRiderModal, setShowViewRiderModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState<DeliveryRider | null>(
    null
  );
  const [editingRider, setEditingRider] = useState<DeliveryRider | null>(null);
  const { token } = useAdminStore();

  const statusOptions = ["All Status", "Active", "Inactive"];

  const stats = getRidersStats(riders);

  const fetchRiders = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        start: 0,
        max: 100,
        search: searchTerm || null,
        filter_active:
          selectedStatus === "Active"
            ? true
            : selectedStatus === "Inactive"
            ? false
            : null,
        sort_by: "name",
        sort_order: "ASC" as const,
      };

      const ridersData = await searchRider(payload, token);
      setRiders(ridersData);
      console.log(riders, "riders");
      setFilteredRiders(ridersData);
      console.log(riders, "riders");
    } catch (error: any) {
      console.error("Error fetching riders:", error);
      toast.error(error.message || "Failed to load delivery riders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);
  console.log(riders, "riders");
  useEffect(() => {
    if (searchTerm || selectedStatus !== "All Status") {
      const debounceTimer = setTimeout(() => {
        fetchRiders();
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      setFilteredRiders(riders);
    }
  }, [searchTerm, selectedStatus]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const handleBulkDelete = async () => {
    if (!token || selectedRiders.length === 0) return;

    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>
              Are you sure you want to delete {selectedRiders.length} selected
              riders?
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(true);
                }}
                className="px-3 py-1 bg-red-400 text-white rounded text-sm"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(false);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
        }
      );
    });

    if (confirmed) {
      setLoading(true);
      try {
        // Delete each rider sequentially
        for (const riderId of selectedRiders) {
          await deleteRider(riderId, token);
        }

        // Refresh the list
        await fetchRiders();

        toast.success(`${selectedRiders.length} riders deleted successfully!`);
        setSelectedRiders([]);
      } catch (error: any) {
        console.error("Error deleting riders:", error);
        toast.error(error.message || "Failed to delete some riders");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectRider = (riderId: string, checked: boolean) => {
    if (checked) {
      setSelectedRiders([...selectedRiders, riderId]);
    } else {
      setSelectedRiders(selectedRiders.filter((id) => id !== riderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRiders(filteredRiders.map((rider) => rider.id));
    } else {
      setSelectedRiders([]);
    }
  };

  const handleAddRider = async () => {
    await fetchRiders(); // Refresh the list
    toast.success("Rider added successfully!");
  };

  const handleUpdateRider = async () => {
    await fetchRiders(); // Refresh the list
    toast.success("Rider updated successfully!");
  };

  const handleRiderAction = async (action: string, rider: DeliveryRider) => {
    setRiderActionDropdown(null);

    switch (action) {
      case "view":
        setSelectedRider(rider);
        setShowViewRiderModal(true);
        break;
      case "edit":
        setEditingRider(rider);
        setShowAddRiderModal(true);
        break;
      case "delete":
        if (!token) {
          toast.error("Authentication required");
          return;
        }

        const confirmed = await new Promise<boolean>((resolve) => {
          const toastId = toast(
            (t) => (
              <div className="flex flex-col gap-2">
                <span>Are you sure you want to delete "{rider.name}"?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      toast.dismiss(toastId);
                      resolve(true);
                    }}
                    className="px-3 py-1 bg-red-400 text-white rounded text-sm"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss(toastId);
                      resolve(false);
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ),
            {
              duration: Infinity,
            }
          );
        });

        if (confirmed) {
          try {
            setLoading(true);
            await deleteRider(rider.id, token);

            // Refresh the list
            await fetchRiders();

            toast.success("Rider deleted successfully!");
          } catch (error: any) {
            console.error("Error deleting rider:", error);
            toast.error(error.message || "Failed to delete rider");
            setLoading(false);
          }
        }
        break;
      default:
        break;
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case "motorcycle":
      case "scooter":
      case "bicycle":
        return <Bike className="w-4 h-4" />;
      case "car":
        return <Bike className="w-4 h-4" />; // You might want a Car icon
      default:
        return <Bike className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
        setOpenDropdown(null);
        setRiderActionDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Delivery Riders Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddRiderModal(true)}
              disabled={loading}
              className={`flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0088B1] hover:bg-[#00729A]"
              } text-[#F8F8F8]`}
            >
              <Plus className="w-3 h-3" />
              {loading ? "Loading..." : "Add New Rider"}
            </button>
            {selectedRiders.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className={`flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-400 hover:bg-red-500"
                } text-[#F8F8F8]`}
              >
                <Trash2 className="w-3 h-3" />
                {loading ? "Deleting..." : `Delete (${selectedRiders.length})`}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <StatsCard
            title="Total Delivery Riders"
            stats={stats.totalRiders}
            icon={<Bike className="w-5 h-5" />}
            color="text-[#0088b1]"
          />
          <StatsCard
            title="Total Deliveries"
            stats="54"
            icon={<Box className="w-5 h-5" />}
            color="text-[#0088b1]"
          />
          <StatsCard
            title="Verified Riders"
            stats={stats.verifiedRiders}
            icon={<BadgePercent className="w-5 h-5" />}
            color="text-[#0088b1]"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by rider name, email, mobile, aadhar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "status" ? null : "status")
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedStatus}
                <ChevronDown className="w-5 h-5" />
              </button>
              {openDropdown === "status" && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                        selectedStatus === status
                          ? "bg-blue-50 text-blue-600"
                          : "text-[#161D1F]"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Delivery Riders
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredRiders.length} Riders
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                      checked={
                        selectedRiders.length === filteredRiders.length &&
                        filteredRiders.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Rider Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Vehicle & License
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Joining Date
                  </th>

                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredRiders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No riders found.</div>
                    </td>
                  </tr>
                ) : (
                  filteredRiders.map((rider) => (
                    <tr key={rider.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedRiders.includes(rider.id)}
                          onChange={(e) =>
                            handleSelectRider(rider.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-xs font-medium text-[#161D1F] mb-1">
                            {rider.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Aadhar: {rider.aadhar_number}
                            </span>
                            {rider.is_poi_verified_status === "approved" ? (
                              <span className="items-center px-2 py-0.5 rounded text-[10px] font-medium border border-[#0088B1] text-[#0088B1]">
                                Approved
                              </span>
                            ) : (
                              <span className="items-center px-2 py-0.5 rounded text-[10px] font-medium border border-[#F44336] text-[#F44336]">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-900">
                            {rider.email}
                          </span>
                          <span className="text-xs text-gray-500">
                            {rider.mobile_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getVehicleIcon(rider.vehicle_name)}
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-[#161D1F]">
                              {rider.vehicle_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {rider.license_no}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#161D1F]">
                        {new Date(rider.joining_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={rider.is_available_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleRiderAction("view", rider)}
                            className="p-1 text-gray-500 hover:text-blue-500"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRiderAction("edit", rider)}
                            className="p-1 text-gray-500 hover:text-blue-500"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRiderAction("delete", rider)}
                            className="p-1 text-[#F44336] hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddRiderModal
        isOpen={showAddRiderModal}
        onClose={() => {
          setShowAddRiderModal(false);
          setEditingRider(null);
        }}
        onSuccess={editingRider ? handleUpdateRider : handleAddRider}
        editRider={editingRider}
      />

      <ViewRiderModal
        isOpen={showViewRiderModal}
        onClose={() => {
          setShowViewRiderModal(false);
          setSelectedRider(null);
        }}
        rider={selectedRider}
        onEdit={() => {
          if (selectedRider) {
            setEditingRider(selectedRider);
            setShowViewRiderModal(false);
            setShowAddRiderModal(true);
          }
        }}
      />
    </div>
  );
};

export default DeliveryRiders;
