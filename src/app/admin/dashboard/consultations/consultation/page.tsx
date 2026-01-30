"use client";
import React, { useEffect, useState } from "react";
import {
  getConsultations,
  getConsultationEnumData,
  updateConsultationStatus,
} from "./service";

import {
  Search,
  ChevronDown,
  Plus,
  Users,
  Globe,
  MapPin,
  Eye,
  Edit,
  Video,
  X,
  HeartPlus,
  Download,
} from "lucide-react";
import AddConsultationModal from "./components/AddConsultationModal";
import ViewConsultationModal from "./components/ViewConsultationModal";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import VideoCallModal from "./components/VideoCallModal";
import { ConsultationAPI } from "./types";
import Pagination from "../../../../components/common/pagination";
import StatsCard from "@/app/components/common/StatsCard";
import { EnumCodes, fetchEnums } from "@/app/service/enumService";
import { formatDate, formatTime } from "../../push-notification/utils/utils";

// const ConsultationTypeBadge: React.FC<{ type: string }> = ({ type }) => {
//   return (
//     <div className="flex items-center gap-1 text-[10px] text-[#0088B1]">
//       {type === "ONLINE" ? (
//         <Globe className="w-3 h-3" />
//       ) : (
//         <MapPin className="w-3 h-3" />
//       )}
//       {type === "ONLINE" ? "Online Consultation" : "In-Person Consultation"}
//     </div>
//   );
// };

interface ConsultationStatusEnum {
  id: string;
  slno: number;
  code: string;
  value: string;
  description: string | null;
  metadata: any | null;
}

const Consultations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAdminStore();
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedConsultationType, setSelectedConsultationType] =
    useState("Consultation Type");
  const [consultations, setConsultations] = useState<ConsultationAPI[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<
    ConsultationAPI[]
  >([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<null | "status" | "type">(
    null,
  );
  const [selectedConsultations, setSelectedConsultations] = useState<string[]>(
    [],
  );
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [selectedConsultationForCall, setSelectedConsultationForCall] =
    useState<ConsultationAPI | null>(null);

  const [loading, setLoading] = useState(false);
  const [editingConsultation, setEditingConsultation] =
    useState<ConsultationAPI | null>(null);
  const [selectedConsultation, setSelectedConsultation] =
    useState<ConsultationAPI | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddConsultationModal, setShowAddConsultationModal] =
    useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const statusOptions = [
    "All Status",
    "Scheduled",
    "Completed",
    "In-Progress",
    "Cancelled",
  ];
  const typeOptions = ["Consultation Type", "Online", "In-Person"];
  const [activeConsultationType, setActiveConsultationType] = useState<
    "online" | "hospital"
  >("online");

  const [consultationStatuses, setConsultationStatuses] = useState<
    ConsultationStatusEnum[]
  >([]);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(
    null,
  );
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const generateStats = () => {
    const totalConsultations = consultations.length;
    const onlineConsultations = consultations.filter(
      (c) => c.consultation_type === "online",
    ).length;
    const inPersonConsultations = consultations.filter(
      (c) => c.consultation_type === "in-person",
    ).length;
    const avgRating = 4.3;

    return {
      totalConsultations,
      onlineConsultations,
      inPersonConsultations,
      avgRating: avgRating.toFixed(1),
      onlinePercentage:
        totalConsultations > 0
          ? Math.round((onlineConsultations / totalConsultations) * 100)
          : 0,
      inPersonPercentage:
        totalConsultations > 0
          ? Math.round((inPersonConsultations / totalConsultations) * 100)
          : 0,
    };
  };

  const handleVideoCall = (consultation: ConsultationAPI) => {
    console.log("Video call clicked for consultation:", consultation);
    console.log("Consultation ID:", consultation.id);
    console.log("First 6 digits:", consultation.id.substring(0, 6));
    console.log("Patient Name:", consultation.patient_name);
    console.log("Doctor Name:", consultation.doc_name);
    console.log("Consultation Type:", consultation.consultation_type);
    console.log("Status:", consultation.status);
    try {
      if (consultation.consultation_type !== "ONLINE") {
        toast.error("Video calls are only available for online consultations");
        return;
      }

      if (
        consultation.status?.toLowerCase() !== "scheduled" &&
        consultation.status?.toLowerCase() !== "in-progress"
      ) {
        toast.error(
          "Video calls are only available for scheduled or in-progress consultations",
        );
        return;
      }

      setSelectedConsultationForCall(consultation);
      setShowVideoCallModal(true);
      toast("Initializing video call...");
    } catch (error) {
      toast.error("Failed to start video call");
    }
  };

  const handleCloseVideoCall = () => {
    setShowVideoCallModal(false);
    setSelectedConsultationForCall(null);
  };

  const stats = generateStats();

  const fetchConsultationStatuses = async () => {
    try {
      const response = await fetchEnums(EnumCodes.ORDER_STATUS, token);
      if (response) {
        const relevantStatuses = response.roles.filter(
          (status: ConsultationStatusEnum) =>
            ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
              status.value,
            ),
        );
        setConsultationStatuses(relevantStatuses);
      }
    } catch (err) {
      console.error("Failed to fetch consultation statuses:", err);
      toast.error("Failed to load consultation statuses");
    }
  };

  const loadConsultations = async (page: number = currentPage) => {
    if (!token) return;

    setLoading(true);
    try {
      const start = page * itemsPerPage;

      const params = {
        start,
        max: itemsPerPage,
        search_text: searchTerm.trim() || null,
        filter_status:
          selectedStatus !== "All Status" ? selectedStatus.toLowerCase() : null,
        is_online_consultation:
          selectedConsultationType === "Online"
            ? true
            : selectedConsultationType === "In-Person"
              ? false
              : null,
      };

      const response = await getConsultations(params, token);
      console.log(response, "consultations response");

      setConsultations(response.consultations);
      setFilteredConsultations(response.consultations);

      setHasMore(response.consultations.length === itemsPerPage);
      setTotalItems(response.consultations.length);

      if (searchTerm && response.consultations.length === 0) {
        toast("No consultations found matching your search");
      }
    } catch (error) {
      console.error("Error loading consultations:", error);
      toast.error("Failed to load consultations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultationStatuses();

    setCurrentPage(0);
  }, [token, searchTerm, selectedStatus, selectedConsultationType]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadConsultations(currentPage);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    token,
    searchTerm,
    selectedStatus,
    selectedConsultationType,
    refreshTrigger,
    currentPage,
  ]);

  const handleNextPage = () => {
    if (hasMore && !loading) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  console.log(filteredConsultations, "filtred");
  const handlePreviousPage = () => {
    if (currentPage > 0 && !loading) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleStatusChange = async (
    consultationId: string,
    customer_id: string | null,
    statusId: string,
    statusValue: string,
  ) => {
    try {
      setUpdatingStatus(consultationId);

      const currentConsultation = consultations.find(
        (c) => c.id === consultationId,
      );
      const currentStatus = currentConsultation?.status;

      setConsultations((prev) =>
        prev.map((consultation) =>
          consultation.id === consultationId
            ? {
                ...consultation,
                status: formatStatusDisplay(statusValue),
              }
            : consultation,
        ),
      );

      setFilteredConsultations((prev) =>
        prev.map((consultation) =>
          consultation.id === consultationId
            ? {
                ...consultation,
                status: formatStatusDisplay(statusValue),
              }
            : consultation,
        ),
      );

      console.log(consultationId, customer_id, statusId, "jnds");

      const response = await updateConsultationStatus(
        consultationId,
        customer_id,
        statusId,
        token,
      );

      if (response.success) {
        setOpenStatusDropdown(null);

        toast.success(
          `Consultation status updated to ${formatStatusDisplay(statusValue)}`,
        );
      } else {
        setConsultations((prev) =>
          prev.map((consultation) =>
            consultation.id === consultationId
              ? {
                  ...consultation,
                  status: currentStatus || "Scheduled",
                }
              : consultation,
          ),
        );

        setFilteredConsultations((prev) =>
          prev.map((consultation) =>
            consultation.id === consultationId
              ? {
                  ...consultation,
                  status: currentStatus || "Scheduled",
                }
              : consultation,
          ),
        );

        throw new Error("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update consultation status",
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatStatusDisplay = (statusValue: string): string => {
    switch (statusValue.toUpperCase()) {
      case "SCHEDULED":
        return "Scheduled";
      case "IN_PROGRESS":
      case "IN-PROGRESS":
        return "In-Progress";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return statusValue;
    }
  };

  const getStatusColor = (status?: string) => {
    const normalized = status?.toLowerCase() ?? "";

    switch (normalized) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 ";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const handleTypeChange = (type: string) => {
    setSelectedConsultationType(type);
    setOpenDropdown(null);
  };

  const handleSelectConsultation = (
    consultationId: string,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedConsultations([...selectedConsultations, consultationId]);
    } else {
      setSelectedConsultations(
        selectedConsultations.filter((id) => id !== consultationId),
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedConsultations(
        filteredConsultations.map((consultation) => consultation.id),
      );
    } else {
      setSelectedConsultations([]);
    }
  };

  const handleViewConsultation = (consultation: ConsultationAPI) => {
    try {
      setSelectedConsultation(consultation);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error("Failed to load consultation details");
    }
  };

  const handleEditConsultation = (consultation: ConsultationAPI) => {
    try {
      setEditingConsultation(consultation);
      setActiveConsultationType(
        consultation.consultation_type === "online" ? "online" : "hospital",
      );
      setShowAddConsultationModal(true);
      toast("Editing consultation details");
    } catch (error) {
      toast.error("Failed to load consultation for editing");
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedConsultation(null);
  };

  const handleAddConsultation = (consultationData: any) => {
    console.log("Consultation Data:", consultationData);

    setRefreshTrigger((prev) => prev + 1);

    const actionText = editingConsultation ? "updated" : "scheduled";
    toast.success(`Consultation ${actionText} successfully!`);

    setEditingConsultation(null);
  };

  const handleCloseModal = () => {
    setShowAddConsultationModal(false);
    setEditingConsultation(null);
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

  const handleBulkAction = (action: "cancel" | "reschedule" | "complete") => {
    if (selectedConsultations.length === 0) {
      toast.error("Please select consultations first");
      return;
    }

    const count = selectedConsultations.length;

    switch (action) {
      case "cancel":
        toast.success(`${count} consultation(s) cancelled successfully`);
        break;
      case "reschedule":
        toast(`Rescheduling ${count} consultation(s)...`);
        break;
      case "complete":
        toast.success(`${count} consultation(s) marked as completed`);
        break;
    }

    setSelectedConsultations([]);
  };

  const handleExport = () => {
    if (consultations.length === 0) {
      alert("No consultations to export");
      return;
    }

    const consultationsToExport =
      selectedConsultations.length > 0
        ? consultations.filter((c) => selectedConsultations.includes(c.id))
        : filteredConsultations;

    exportConsultationsToCSV(consultationsToExport);
  };

  const exportConsultationsToCSV = (consultations: ConsultationAPI[]) => {
    const headers = [
      "Consultation ID",
      "Patient Name",
      "Phone",
      "Doctor Name",
      "Hospital",
      "Consultation Type",
      "Consultation Date",
      "Consultation Time",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...consultations.map((c) =>
        [
          c.id.slice(0, 8).toUpperCase(),
          `"${c.patient_name}"`,
          c.phone || "N/A",
          `"${c.doc_name}"`,
          `"${c.hospital_name || "N/A"}"`,
          c.consultation_type === "ONLINE" ? "Online" : "In-Person",
          c.consultation_date,
          c.consultation_time,
          c.status || "N/A",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `consultations_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Consultation & Scheduling
          </h1>
          <div className="flex gap-3">
            <button
              className="flex items-center text-[12px] gap-2 text-black border border-[#D3D7D8] px-6 py-2 rounded-lg transition-colors"
              onClick={() => {
                setEditingConsultation(null);
                setActiveConsultationType("hospital");
                setShowAddConsultationModal(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Schedule In-Person / Hospital Visit
            </button>
            <button
              className="flex items-center text-[12px] gap-2 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              onClick={() => {
                setEditingConsultation(null);
                setActiveConsultationType("online");
                setShowAddConsultationModal(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Schedule Online Consultation
            </button>
          </div>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Total Doctor Consultations"
            stats={stats.totalConsultations}
            subtitle={`Average rating - ${stats.avgRating}`}
            icon={<Users className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
          <StatsCard
            title="Booked Online"
            stats={stats.onlineConsultations}
            subtitle={`${stats.onlinePercentage}% of total doctors`}
            icon={<Globe className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
          <StatsCard
            title="Booked In-Person"
            stats={stats.inPersonConsultations}
            subtitle={`${stats.inPersonPercentage}% of total doctors`}
            icon={<MapPin className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient/doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              {selectedConsultations.length > 0
                ? `Export Selected (${selectedConsultations.length})`
                : "Export All"}
            </button>
          </div>
          {/* <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "type" ? null : "type")
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedConsultationType}
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === "type" && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {typeOptions.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 ${
                        selectedConsultationType === type
                          ? "bg-blue-50 text-blue-600"
                          : "text-[#161D1F]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "status" ? null : "status")
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedStatus}
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === "status" && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusFilterChange(status)}
                      className={`block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 ${
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
          </div> */}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Consultations
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredConsultations.length} People
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full relative">
              <thead className="bg-gray-50 sticky top-0 z-20">
                <tr>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                      checked={
                        selectedConsultations.length ===
                          filteredConsultations.length &&
                        filteredConsultations.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Patient Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Hospital & Doctor Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Consultation Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                      {/* <div className="text-gray-500">
                        Loading consultations...
                      </div> */}
                    </td>
                  </tr>
                ) : filteredConsultations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        No consultations found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredConsultations.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedConsultations.includes(
                            consultation.id,
                          )}
                          onChange={(e) =>
                            handleSelectConsultation(
                              consultation.id,
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-xs font-medium text-[#161D1F] mb-1">
                            {consultation.patient_name}
                          </div>
                          <div className="text-[10px] text-gray-500 mb-2">
                            Booking ID:
                            <span
                              className="ml-1 cursor-help"
                              title={consultation.ordernumber}
                            >
                              {consultation.ordernumber}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 mb-2">
                            {consultation.phone}
                          </div>
                          <div className="flex items-center gap-4 text-[10px]">
                            <span className="px-2 py-1 text-[8px] text-[#0088B1] rounded border border-[#0088B1] hover:bg-[#0088B1] hover:text-white transition-colors">
                              {consultation.consultation_type === "ONLINE"
                                ? "Online"
                                : "In-Person"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {consultation.consultation_type === "OFFLINE" ? (
                            <div className="flex items-center gap-1 text-[10px] text-[#0088B1]">
                              <MapPin className="w-3 h-3" />
                              {consultation.hospital_name}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] text-[#0088B1]">
                              <Globe className="w-3 h-3" />
                              Online Consultation
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-2">
                            <HeartPlus className="w-3 h-3" />
                            {consultation.doc_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex bg-[#E8F4F7] rounded p-2 justify-center">
                          <div className="text-[10px] flex font-medium text-[#161D1F]">
                            {formatDate(consultation.consultation_date)} |
                            <p className="text-[#0073A0] ml-1">
                              {formatTime(consultation.consultation_time)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenStatusDropdown(
                                openStatusDropdown === consultation.id
                                  ? null
                                  : consultation.id,
                              )
                            }
                            disabled={updatingStatus === consultation.id}
                            className={`px-3 py-1 rounded-full text-[10px] font-medium ${getStatusColor(
                              consultation.status,
                            )} flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-50`}
                          >
                            {updatingStatus === consultation.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                {consultation?.status
                                  ? consultation.status
                                      .charAt(0)
                                      .toUpperCase() +
                                    consultation.status.slice(1).toLowerCase()
                                  : ""}

                                <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>
                          {openStatusDropdown === consultation.id && (
                            <div className="absolute left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <div className="py-1">
                                {consultationStatuses.map((status) => (
                                  <button
                                    key={status.id}
                                    onClick={() =>
                                      handleStatusChange(
                                        consultation.id,
                                        consultation.customer_id,
                                        status.id,
                                        status.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 text-left text-[10px] text-[#161D1F] hover:bg-gray-50 transition-colors"
                                  >
                                    {formatStatusDisplay(status.value)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {consultation.consultation_type === "ONLINE" && (
                            <button
                              className="p-2 text-gray-400 hover:text-[#0088B1] cursor-pointer"
                              onClick={() => handleVideoCall(consultation)}
                              title="Start Video Call"
                            >
                              <Video className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            className="p-2 text-gray-400 hover:text-[#0088B1] cursor-pointer "
                            onClick={() => handleViewConsultation(consultation)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* <button
                            className="p-2 text-gray-400 hover:text-[#0088B1] cursor-pointer"
                            onClick={() => handleEditConsultation(consultation)}
                            title="Edit Consultation"
                          >
                            <Edit className="w-4 h-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
      </div>

      <AddConsultationModal
        isOpen={showAddConsultationModal}
        onClose={handleCloseModal}
        onAddConsultation={handleAddConsultation}
        editingConsultation={editingConsultation}
        initialConsultationType={activeConsultationType}
      />

      <ViewConsultationModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        consultation={selectedConsultation}
        onEdit={handleEditConsultation}
      />
      <VideoCallModal
        isOpen={showVideoCallModal}
        onClose={handleCloseVideoCall}
        consultationId={selectedConsultationForCall?.id || ""}
        patientName={selectedConsultationForCall?.patient_name || ""}
        doctorName={selectedConsultationForCall?.doc_name || ""}
        doctorId={selectedConsultationForCall?.doc_id || ""}
        paitentId={selectedConsultationForCall?.customer_id || ""}
      />
    </div>
  );
};

export default Consultations;
