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
  MoreVertical,
  Check,
  X,
  UserCheck,
  UserX,
  Car,
  Download,
  BikeIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { ViewRiderModal } from "./components/ViewRiderModal";
import { AddRiderModal } from "./components/CreateNewModal";
import { DeliveryRider, RidersStats } from "../types";

import { useAdminStore } from "@/app/store/adminStore";
import StatusBadge from "../../../../components/common/StatusBadge";
import StatsCard from "../../../../components/common/StatsCard";
import {
  deleteRider,
  getRidersStats,
  searchRider,
  updateRiderPOI,
} from "../services";
import { useRiderStore } from "./store/RiderStore";

const DeliveryRiders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const { riders, setRiders } = useRiderStore();
  const [filteredRiders, setFilteredRiders] = useState<DeliveryRider[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedRiders, setSelectedRiders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(false);
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const [showViewRiderModal, setShowViewRiderModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState<DeliveryRider | null>(
    null,
  );
  const [editingRider, setEditingRider] = useState<DeliveryRider | null>(null);
  const { token } = useAdminStore();

  const statusOptions = ["All Status", "Active", "Inactive"];

  const stats = getRidersStats(riders);

  // Apply filters client-side
  const applyFilters = (data: DeliveryRider[]) => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter(
        (rider) =>
          rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rider.mobile_number.includes(searchTerm) ||
          rider.aadhar_number.includes(searchTerm),
      );
    }

    if (selectedStatus === "Active") {
      filtered = filtered.filter(
        (rider) => rider.is_available_status === "active",
      );
    } else if (selectedStatus === "Inactive") {
      filtered = filtered.filter(
        (rider) => rider.is_available_status !== "active",
      );
    }

    return filtered;
  };

  const fetchRiders = async (forceRefresh = false) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (!forceRefresh && riders.length > 0) {
      console.log("Using cached riders data");
      const filtered = applyFilters(riders);
      setFilteredRiders(filtered);
      return;
    }

    try {
      setLoading(true);
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
      const filtered = applyFilters(ridersData);
      setFilteredRiders(filtered);
      setCurrentPage(0);
    } catch (error: any) {
      console.error("Error fetching riders:", error);
      toast.error(error.message || "Failed to load delivery riders");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRiders();
  }, []);

  // Handle filter changes
  useEffect(() => {
    if (riders.length > 0) {
      const filtered = applyFilters(riders);
      setFilteredRiders(filtered);
      setCurrentPage(0);
    } else if (token) {
      const debounceTimer = setTimeout(() => {
        fetchRiders(true);
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, selectedStatus, token]);

  const updateRiderPOIStatus = async (riderId: string, isApproved: boolean) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    // Update UI immediately
    const updatedRiders = riders.map((rider) =>
      rider.id === riderId
        ? {
            ...rider,
            is_poi_verified_status: isApproved ? "approved" : "pending",
          }
        : rider,
    );
    setRiders(updatedRiders);

    const updatedFilteredRiders = filteredRiders.map((rider) =>
      rider.id === riderId
        ? {
            ...rider,
            is_poi_verified_status: isApproved ? "approved" : "pending",
          }
        : rider,
    );
    setFilteredRiders(updatedFilteredRiders);

    toast.success(
      `Rider ${isApproved ? "approved" : "disapproved"} successfully!`,
    );

    // Call API in background
    try {
      await updateRiderPOI(riderId, isApproved, token);
    } catch (error: any) {
      console.error("Error updating rider POI status:", error);

      // Revert on error
      const revertedRiders = riders.map((rider) =>
        rider.id === riderId
          ? {
              ...rider,
              is_poi_verified_status: isApproved ? "pending" : "approved",
            }
          : rider,
      );
      setRiders(revertedRiders);

      const revertedFilteredRiders = filteredRiders.map((rider) =>
        rider.id === riderId
          ? {
              ...rider,
              is_poi_verified_status: isApproved ? "pending" : "approved",
            }
          : rider,
      );
      setFilteredRiders(revertedFilteredRiders);

      toast.error(error.message || "Failed to update rider status");
    }
  };

  const handleAddRider = (newRider: DeliveryRider) => {
    // Add to UI immediately
    const updatedRiders = [newRider, ...riders];
    setRiders(updatedRiders);
    const filtered = applyFilters(updatedRiders);
    setFilteredRiders(filtered);
    toast.success("Rider added successfully!");
  };

  const handleUpdateRider = (updatedRider: DeliveryRider) => {
    // Update UI immediately
    const updatedRiders = riders.map((rider) =>
      rider.id === updatedRider.id ? updatedRider : rider,
    );
    setRiders(updatedRiders);
    const filtered = applyFilters(updatedRiders);
    setFilteredRiders(filtered);
    toast.success("Rider updated successfully!");
  };

  const handleDeleteRider = async (rider: DeliveryRider) => {
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
        { duration: Infinity },
      );
    });

    if (confirmed) {
      // Remove from UI immediately
      const remainingRiders = riders.filter((r) => r.id !== rider.id);
      setRiders(remainingRiders);

      const remainingFilteredRiders = filteredRiders.filter(
        (r) => r.id !== rider.id,
      );
      setFilteredRiders(remainingFilteredRiders);

      toast.success("Rider deleted successfully!");

      // Call API in background
      try {
        await deleteRider(rider.id, token);
      } catch (error: any) {
        console.error("Error deleting rider:", error);
        // Revert on error - add back the rider
        setRiders([rider, ...remainingRiders]);
        const filtered = applyFilters([rider, ...remainingRiders]);
        setFilteredRiders(filtered);
        toast.error(error.message || "Failed to delete rider");
      }
    }
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
        { duration: Infinity },
      );
    });

    if (confirmed) {
      const ridersToDelete = riders.filter((r) =>
        selectedRiders.includes(r.id),
      );

      // Remove from UI immediately
      const remainingRiders = riders.filter(
        (r) => !selectedRiders.includes(r.id),
      );
      setRiders(remainingRiders);

      const remainingFilteredRiders = filteredRiders.filter(
        (r) => !selectedRiders.includes(r.id),
      );
      setFilteredRiders(remainingFilteredRiders);

      toast.success(`${selectedRiders.length} riders deleted successfully!`);
      setSelectedRiders([]);

      // Call API in background
      try {
        for (const rider of ridersToDelete) {
          await deleteRider(rider.id, token);
        }
      } catch (error: any) {
        console.error("Error deleting riders:", error);
        // Refresh on error to restore correct state
        await fetchRiders(true);
        toast.error(error.message || "Failed to delete some riders");
      }
    }
  };

  const handleRiderAction = async (action: string, rider: DeliveryRider) => {
    switch (action) {
      case "view":
        setSelectedRider(rider);
        setShowViewRiderModal(true);
        break;
      case "edit":
        setEditingRider(rider);
        setShowAddRiderModal(true);
        break;
      case "approve":
        await updateRiderPOIStatus(rider.id, true);
        break;
      case "disapprove":
        await updateRiderPOIStatus(rider.id, false);
        break;
      case "delete":
        await handleDeleteRider(rider);
        break;
      default:
        break;
    }
  };

  // Pagination
  const paginatedRiders = React.useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRiders.slice(startIndex, endIndex);
  }, [filteredRiders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRiders.length / itemsPerPage);
  const hasMore = currentPage < totalPages - 1;

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case "motorcycle":
      case "scooter":
      case "bicycle":
        return <Bike className="w-4 h-4" color="#0088B1" />;
      case "car":
        return <Car className="w-4 h-4" color="#0088B1" />;
      default:
        return <Bike className="w-4 h-4" color="#0088B1" />;
    }
  };

  const exportRidersToCSV = (riders: DeliveryRider[]) => {
    const headers = [
      "Name",
      "Email",
      "Mobile Number",
      "Aadhar Number",
      "Vehicle Name",
      "License No",
      "Joining Date",
      "Availability Status",
      "POI Verified Status",
    ];

    const csvContent = [
      headers.join(","),
      ...riders.map((r) =>
        [
          `"${r.name}"`,
          `"${r.email}"`,
          `"${r.mobile_number}"`,
          `"${r.aadhar_number}"`,
          `"${r.vehicle_name}"`,
          `"${r.license_no}"`,
          `"${new Date(r.joining_date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}"`,
          r.is_available_status,
          r.is_poi_verified_status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `delivery_riders_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (riders.length === 0) {
      toast.error("No riders to export");
      return;
    }

    const ridersToExport =
      selectedRiders.length > 0
        ? riders.filter((r) => selectedRiders.includes(r.id))
        : filteredRiders;

    exportRidersToCSV(ridersToExport);
    toast.success(`Exported ${ridersToExport.length} riders successfully!`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".dropdown-toggle") &&
        !target.closest(".dropdown-menu")
      ) {
        setOpenDropdown(null);
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
              className="flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg bg-[#0088B1] hover:bg-[#00729A] cursor-pointer text-[#F8F8F8]"
            >
              <Plus className="w-3 h-3" />
              {"Add New Rider"}
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
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by rider name, email, mobile, aadhar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={loading || riders.length === 0}
              className={`flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50 ${
                loading || riders.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <Download className="w-4 h-4" />
              {selectedRiders.length > 0
                ? `Export Selected (${selectedRiders.length})`
                : "Export All"}
            </button>
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

          <div
            className="overflow-x-auto"
            style={{ maxHeight: "calc(100vh - 350px)", minHeight: "400px" }}
          >
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
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
                {loading && filteredRiders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : paginatedRiders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <BikeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-gray-500 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No delivery riders found
                        </h3>
                        <p className="text-gray-500">
                          No delivery riders match your current criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRiders.map((rider) => (
                    <tr key={rider.id} className="hover:bg-gray-50">
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
                          },
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={rider.is_available_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                        <div className="flex items-center gap-2 justify-end relative">
                          <button
                            onClick={() => handleRiderAction("view", rider)}
                            className="p-1 text-gray-500 hover:text-[#0088B1] cursor-pointer"
                            title="View Rider"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRiderAction("edit", rider)}
                            className="p-1 text-gray-500 hover:text-[#0088B1] cursor-pointer"
                            title="Edit Rider"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === rider.id ? null : rider.id,
                                )
                              }
                              className="p-1 text-gray-500 hover:text-[#0088B1] cursor-pointer dropdown-toggle"
                              title="More options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openDropdown === rider.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 dropdown-menu">
                                <div className="py-1">
                                  {rider.is_poi_verified_status !==
                                    "approved" && (
                                    <button
                                      onClick={() => {
                                        handleRiderAction("approve", rider);
                                        setOpenDropdown(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-xs text-left hover:bg-gray-100 cursor-pointer text-[#0088B1]"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                      Approve Rider
                                    </button>
                                  )}
                                  {rider.is_poi_verified_status ===
                                    "approved" && (
                                    <button
                                      onClick={() => {
                                        handleRiderAction("disapprove", rider);
                                        setOpenDropdown(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-xs text-left hover:bg-gray-100 cursor-pointer text-amber-600"
                                    >
                                      <UserX className="w-4 h-4" />
                                      Disapprove Rider
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      handleRiderAction("delete", rider);
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-xs text-left hover:bg-gray-100 text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Rider
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredRiders.length > itemsPerPage && (
            <div className="border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Showing {currentPage * itemsPerPage + 1} to{" "}
                  {Math.min(
                    (currentPage + 1) * itemsPerPage,
                    filteredRiders.length,
                  )}{" "}
                  of {filteredRiders.length} riders
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                    className="px-3 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!hasMore}
                    className="px-3 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddRiderModal
        isOpen={showAddRiderModal}
        onClose={() => {
          setShowAddRiderModal(false);
          setEditingRider(null);
        }}
        onSuccess={() => {
          fetchRiders(true);
        }}
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
