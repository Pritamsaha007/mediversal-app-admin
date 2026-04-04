"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Users,
  Activity,
  Droplet,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  Download,
  UserPlus,
} from "lucide-react";
import StatsCard from "../../../../components/common/StatsCard";
import StatusBadge from "../../../../components/common/StatusBadge";
import toast from "react-hot-toast";
import { AddPhlebotomistModal } from "./components/AddStaff";
import { Phlebotomist, PhlebotomistAvailability } from "./type";
import ViewPhlebotomistModal from "./components/ViewStaff";
import { useAdminStore } from "@/app/store/adminStore";
import {
  fetchDays,
  fetchPhleboSpecializations,
  fetchServiceAreas,
  fetchServiceCities,
  searchPhlebotomists,
  SearchPhlebotomistsPayload,
  updatePhlebotomist,
} from "../services/index";
import { EnumItem } from "@/app/service/enumService";
import Pagination from "@/app/components/common/pagination";
import { usePhlebotomistStore } from "./store/PhlebotomistStore";

interface PhlebotomistStats {
  totalPhlebotomists: number;
  activePhlebotomists: number;
  averageSamples: number;
  averageExperience: string;
}

const PhlebotomistManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Phlebotomist");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const { phlebotomists, setPhlebotomists } = usePhlebotomistStore();
  const [filteredPhlebotomists, setFilteredPhlebotomists] = useState<
    Phlebotomist[]
  >([]);
  const [openDropdown, setOpenDropdown] = useState<
    null | "filter" | "location"
  >(null);
  const [selectedPhlebotomists, setSelectedPhlebotomists] = useState<string[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [expandedSchedules, setExpandedSchedules] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhlebotomist, setEditingPhlebotomist] =
    useState<Phlebotomist | null>(null);
  const [viewingPhlebotomist, setViewingPhlebotomist] =
    useState<Phlebotomist | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [daysData, setDaysData] = useState<EnumItem[]>([]);
  const [daysDataLoaded, setDaysDataLoaded] = useState(false);
  const [specializationsData, setSpecializationsData] = useState<EnumItem[]>(
    [],
  );
  const [fetchingData, setFetchingData] = useState(false);
  const [enumDataLoaded, setEnumDataLoaded] = useState(false);
  const [serviceCitiesData, setServiceCitiesData] = useState<EnumItem[]>([]);
  const [serviceAreasData, setServiceAreasData] = useState<EnumItem[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const { token } = useAdminStore();

  // Fetch enum data on mount
  useEffect(() => {
    const fetchEnumData = async () => {
      if (!token) return;

      setFetchingData(true);
      setEnumDataLoaded(false);
      try {
        const [
          daysResponse,
          specializationsResponse,
          citiesResponse,
          areasResponse,
        ] = await Promise.all([
          fetchDays(token),
          fetchPhleboSpecializations(token),
          fetchServiceCities(token),
          fetchServiceAreas(token),
        ]);

        console.log("Enum data fetched:", {
          days: daysResponse.roles,
          specializations: specializationsResponse.roles,
          cities: citiesResponse.roles,
          areas: areasResponse.roles,
        });

        setDaysData(daysResponse.roles || []);
        setSpecializationsData(specializationsResponse.roles || []);
        setServiceCitiesData(citiesResponse.roles || []);
        setServiceAreasData(areasResponse.roles || []);
        setDaysDataLoaded(true);
        setEnumDataLoaded(true);
      } catch (error: any) {
        console.error("Error fetching enum data:", error);
        toast.error("Failed to load form data");
      } finally {
        setFetchingData(false);
      }
    };

    fetchEnumData();
  }, [token]);

  const convertSearchResultToPhlebotomist = (apiPhlebo: any): Phlebotomist => {
    const getDayIdFromName = (dayName: string): string => {
      const day = daysData.find((item) => item.value === dayName);
      console.log(`Mapping day: ${dayName} to ID: ${day?.id}`);
      return day?.id || dayName;
    };

    return {
      id: apiPhlebo.id,
      name: apiPhlebo.name,
      mobile_number: apiPhlebo.mobile_number,
      email: apiPhlebo.email,
      rating: apiPhlebo.rating,
      experience_in_yrs: apiPhlebo.experience_in_yrs,
      service_city: apiPhlebo.service_city_name,
      service_area: apiPhlebo.service_area_name,
      specialization_id: apiPhlebo.specialization_name,
      license_no: apiPhlebo.license_no,
      joining_date: apiPhlebo.joining_date,
      is_home_collection_certified: apiPhlebo.is_home_collection_certified,
      is_available: apiPhlebo.is_available,
      is_deleted: apiPhlebo.is_deleted || false,
      availability: apiPhlebo.availability.map((avail: any) => ({
        id: avail.id,
        day_id: getDayIdFromName(avail.day),
        start_time: avail.start_time,
        end_time: avail.end_time,
        slot_capacity: avail.slot_capacity || 0,
      })),
      created_by: apiPhlebo.created_by || "",
      updated_by: apiPhlebo.updated_by || "",
    };
  };

  const applyFiltersToData = (data: Phlebotomist[]) => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.license_no?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ),
      );
    }

    // Apply status filter
    if (selectedFilter === "Active") {
      filtered = filtered.filter((p) => p.is_available);
    } else if (selectedFilter === "Inactive") {
      filtered = filtered.filter((p) => !p.is_available);
    }

    // Apply location filter
    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter((p) => p.service_city === selectedLocation);
    }

    return filtered;
  };

  const fetchPhlebotomists = async (forceRefresh = false) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (!daysDataLoaded) {
      console.log("Waiting for days data to load...");
      return;
    }

    // If we have cached phlebotomists and not forcing refresh, use them
    if (!forceRefresh && phlebotomists.length > 0) {
      console.log("Using cached phlebotomists data");
      const filtered = applyFiltersToData(phlebotomists);
      setFilteredPhlebotomists(filtered);
      setCurrentPage(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const searchPayload: SearchPhlebotomistsPayload = {
        start: 0,
        max: 50,
        search_text: searchTerm || null,
        filter_specialization:
          selectedFilter !== "All Phlebotomist" &&
          selectedFilter !== "Active" &&
          selectedFilter !== "Inactive"
            ? selectedFilter
            : null,
        filter_service_city:
          selectedLocation !== "All Locations" ? selectedLocation : null,
        filter_is_available:
          selectedFilter === "Active"
            ? true
            : selectedFilter === "Inactive"
              ? false
              : null,
        filter_is_home_collection_certified: null,
        sort_by: "name",
        sort_order: "ASC",
      };

      const response = await searchPhlebotomists(searchPayload, token);

      if (response.success) {
        const phlebotomistData = response.phlebotomists.map(
          convertSearchResultToPhlebotomist,
        );
        setPhlebotomists(phlebotomistData);
        const filtered = applyFiltersToData(phlebotomistData);
        setFilteredPhlebotomists(filtered);
        console.log("Phlebotomists data loaded:", phlebotomistData);
      }
    } catch (error: any) {
      console.error("Error fetching phlebotomists:", error);
      toast.error(error.message || "Failed to load phlebotomists");
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  };

  // Initial load
  useEffect(() => {
    if (daysDataLoaded && token && !initialLoadDone) {
      fetchPhlebotomists();
    }
  }, [daysDataLoaded, token]);

  // Handle filter changes
  useEffect(() => {
    if (phlebotomists.length > 0) {
      const filtered = applyFiltersToData(phlebotomists);
      setFilteredPhlebotomists(filtered);
      setCurrentPage(0);
    } else if (daysDataLoaded && token) {
      const timeoutId = setTimeout(() => {
        fetchPhlebotomists();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectedFilter, selectedLocation, daysDataLoaded, token]);

  const paginatedPhlebotomists = React.useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPhlebotomists.slice(startIndex, endIndex);
  }, [filteredPhlebotomists, currentPage, itemsPerPage]);

  const hasMore = React.useMemo(() => {
    return (currentPage + 1) * itemsPerPage < filteredPhlebotomists.length;
  }, [filteredPhlebotomists, currentPage, itemsPerPage]);

  const totalItems = filteredPhlebotomists.length;

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const refreshPhlebotomists = () => {
    fetchPhlebotomists(true);
  };

  const handleDeletePhlebotomist = async (phlebotomist: Phlebotomist) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>Are you sure you want to delete {phlebotomist.name}</span>
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
        },
      );
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const getCityId = (cityName: string): string => {
        const city = serviceCitiesData.find((item) => item.value === cityName);
        return city?.id || cityName;
      };

      const getAreaId = (areaName: string): string => {
        const area = serviceAreasData.find((item) => item.value === areaName);
        return area?.id || areaName;
      };

      const getSpecializationId = (specializationName: string): string => {
        const specialization = specializationsData.find(
          (item) => item.value === specializationName,
        );
        return specialization?.id || specializationName;
      };

      const serviceCityId = getCityId(phlebotomist.service_city);
      const serviceAreaId = getAreaId(phlebotomist.service_area);
      const specializationId = getSpecializationId(
        phlebotomist.specialization_id,
      );

      const updatePayload = {
        id: phlebotomist.id,
        name: phlebotomist.name,
        mobile_number: phlebotomist.mobile_number,
        email: phlebotomist.email,
        rating: phlebotomist.rating,
        experience_in_yrs: phlebotomist.experience_in_yrs,
        service_city: serviceCityId,
        service_area: serviceAreaId,
        specialization_id: specializationId,
        license_no: phlebotomist.license_no,
        joining_date: phlebotomist.joining_date,
        is_home_collection_certified: phlebotomist.is_home_collection_certified,
        is_available: false,
        is_deleted: true,
        availability: phlebotomist.availability,
      };

      console.log("Delete Payload:", updatePayload);
      await updatePhlebotomist(updatePayload, token);

      toast.success("Phlebotomist deleted successfully");
      refreshPhlebotomists();
    } catch (error: any) {
      console.error("Error deleting phlebotomist:", error);
      toast.error(error.message || "Failed to delete phlebotomist");
    } finally {
      setLoading(false);
    }
  };

  const generateStats = (): PhlebotomistStats => {
    const totalPhlebotomists = filteredPhlebotomists.length;
    const activePhlebotomists = filteredPhlebotomists.filter(
      (p) => p.is_available,
    ).length;
    const avgExp =
      filteredPhlebotomists.reduce((sum, p) => sum + p.experience_in_yrs, 0) /
      (totalPhlebotomists || 1);

    return {
      totalPhlebotomists,
      activePhlebotomists,
      averageSamples: 0,
      averageExperience: `${Math.round(avgExp)} Yrs.`,
    };
  };

  const stats = generateStats();

  const handleSelectPhlebotomist = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPhlebotomists([...selectedPhlebotomists, id]);
    } else {
      setSelectedPhlebotomists(
        selectedPhlebotomists.filter((pid) => pid !== id),
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPhlebotomists(paginatedPhlebotomists.map((p) => p.id));
    } else {
      setSelectedPhlebotomists([]);
    }
  };

  const toggleScheduleExpand = (id: string) => {
    if (expandedSchedules.includes(id)) {
      setExpandedSchedules(expandedSchedules.filter((eid) => eid !== id));
    } else {
      setExpandedSchedules([...expandedSchedules, id]);
    }
  };

  const renderSchedules = (
    schedules: PhlebotomistAvailability[],
    phlebotomistId: string,
  ) => {
    const isExpanded = expandedSchedules.includes(phlebotomistId);
    const visibleSchedules = isExpanded ? schedules : schedules.slice(0, 2);
    const hasMore = schedules.length > 2;

    return (
      <div className="flex flex-col gap-2">
        {visibleSchedules.map((schedule, index) => (
          <div key={index} className="flex gap-2">
            <span className="px-3 py-1.5 rounded-md text-[10px] bg-[#E8F4F7] text-[#0088B1]">
              {schedule.start_time} - {schedule.end_time}
            </span>
          </div>
        ))}
        {hasMore && !isExpanded && (
          <button
            onClick={() => toggleScheduleExpand(phlebotomistId)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            view more <ChevronDown className="w-3 h-3" />
          </button>
        )}
        {isExpanded && hasMore && (
          <button
            onClick={() => toggleScheduleExpand(phlebotomistId)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            view less
          </button>
        )}
      </div>
    );
  };

  const handleAddPhlebotomist = () => {
    refreshPhlebotomists();
    toast.success("Phlebotomist added successfully");
  };

  const handleUpdatePhlebotomist = () => {
    refreshPhlebotomists();
    toast.success("Phlebotomist updated successfully");
  };

  const handleEdit = (phlebotomist: Phlebotomist) => {
    setEditingPhlebotomist(phlebotomist);
    setIsModalOpen(true);
  };

  const handleView = (phlebotomist: Phlebotomist) => {
    setViewingPhlebotomist(phlebotomist);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPhlebotomist(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingPhlebotomist(null);
  };

  const exportPhlebotomistsToCSV = (phlebotomists: Phlebotomist[]) => {
    const headers = [
      "Name",
      "Mobile Number",
      "Email",
      "Rating",
      "Experience (Years)",
      "Service City",
      "Service Area",
      "Specialization",
      "License No",
      "Joining Date",
      "Home Collection Certified",
      "Status",
      "Is Deleted",
      "Availability Slots",
    ];

    const formatAvailability = (availability: PhlebotomistAvailability[]) => {
      return availability
        .map((slot) => `${slot.start_time}-${slot.end_time}`)
        .join("; ");
    };

    const csvContent = [
      headers.join(","),
      ...phlebotomists.map((p) =>
        [
          `"${p.name}"`,
          `"${p.mobile_number || ""}"`,
          `"${p.email || ""}"`,
          p.rating || "0",
          p.experience_in_yrs,
          `"${p.service_city || ""}"`,
          `"${p.service_area || ""}"`,
          `"${p.specialization_id || ""}"`,
          `"${p.license_no || ""}"`,
          `"${p.joining_date || ""}"`,
          p.is_home_collection_certified ? "Yes" : "No",
          p.is_available ? "Active" : "Inactive",
          p.is_deleted ? "Yes" : "No",
          `"${formatAvailability(p.availability || [])}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `phlebotomists_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (filteredPhlebotomists.length === 0) {
      toast.error("No phlebotomists to export");
      return;
    }

    const phlebotomistsToExport =
      selectedPhlebotomists.length > 0
        ? filteredPhlebotomists.filter((p) =>
            selectedPhlebotomists.includes(p.id),
          )
        : filteredPhlebotomists;

    exportPhlebotomistsToCSV(phlebotomistsToExport);
    toast.success(
      `Exported ${phlebotomistsToExport.length} phlebotomists successfully!`,
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
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
            Phlebotomist Management
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg bg-[#0088B1] hover:bg-[#00729A] cursor-pointer text-[#F8F8F8]`}
            >
              <Plus className="w-3 h-3" />
              Add New Phlebotomist
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <StatsCard
            title="Total Phlebotomists"
            stats={stats.totalPhlebotomists}
            icon={<Users className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
          <StatsCard
            title="Average Samples Collected"
            stats={stats.averageSamples}
            icon={<Droplet className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
          <StatsCard
            title="Average Experience"
            stats={stats.averageExperience}
            icon={<Activity className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Phlebotomist name, License No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={loading || filteredPhlebotomists.length === 0}
              className={`flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50 ${
                loading || filteredPhlebotomists.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <Download className="w-4 h-4" />
              {selectedPhlebotomists.length > 0
                ? `Export Selected (${selectedPhlebotomists.length})`
                : "Export All"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Phlebotomists
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredPhlebotomists.length} Phlebotomists
              </span>
            </h3>
          </div>

          <div
            className="overflow-auto"
            style={{ maxHeight: "calc(100vh - 350px)", minHeight: "400px" }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider whitespace-nowrap bg-gray-50">
                    Phlebotomist Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider whitespace-nowrap bg-gray-50">
                    Today's Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider whitespace-nowrap bg-gray-50">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-[12px] font-medium text-[#161D1F] tracking-wider whitespace-nowrap bg-gray-50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : paginatedPhlebotomists.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-gray-500 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No phlebotomists found
                        </h3>
                        <p className="text-gray-500">
                          No phlebotomists match your current criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPhlebotomists.map((phlebotomist) => (
                    <tr key={phlebotomist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 min-w-[250px]">
                          <div className="text-xs font-medium text-[#161D1F]">
                            {phlebotomist.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {phlebotomist.specialization_id}
                          </div>
                          <div className="text-xs text-gray-400">
                            License No.: {phlebotomist.license_no}
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded text-xs border border-[#0088B1] text-[#0088B1]">
                              {phlebotomist.experience_in_yrs} yrs exp.
                            </span>
                            {phlebotomist.is_home_collection_certified && (
                              <span className="px-2 py-0.5 rounded text-xs border border-[#9B51E0] text-[#9B51E0]">
                                Home Collection Certified
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="min-w-[200px]">
                          {renderSchedules(
                            phlebotomist.availability,
                            phlebotomist.id,
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={
                            phlebotomist.is_available ? "Active" : "Inactive"
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleView(phlebotomist)}
                            className="p-1 text-gray-500 hover:text-[#0088B1] cursor-pointer"
                            title="View Phlebotomist"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(phlebotomist)}
                            className="p-1 text-gray-500 hover:text-[#0088B1] cursor-pointer"
                            title="Edit Phlebotomist"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeletePhlebotomist(phlebotomist)
                            }
                            className="p-1 text-[#F44336] hover:text-red-500 cursor-pointer"
                            disabled={loading}
                            title="Delete Phlebotomist"
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

          {filteredPhlebotomists.length > 0 && (
            <div className="border-t border-gray-200 bg-white">
              <Pagination
                currentPage={currentPage}
                hasMore={hasMore}
                loading={loading}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      <AddPhlebotomistModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddPhlebotomist={handleAddPhlebotomist}
        onUpdatePhlebotomist={handleUpdatePhlebotomist}
        editPhlebotomist={editingPhlebotomist}
      />

      <ViewPhlebotomistModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        phlebotomist={viewingPhlebotomist}
      />
    </div>
  );
};

export default PhlebotomistManagement;
