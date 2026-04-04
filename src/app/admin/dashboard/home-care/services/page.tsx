"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import StatusBadge from "../../../../components/common/StatusBadge";
import StatsCard from "../../../../components/common/StatsCard";
import ManageOfferingsModal from "./components/ManageOfferingsModal";
import AddServiceModal from "./components/AddServiceModal";
import { getHomecareServices, deleteHomecareService } from "./service";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import Pagination from "../../../../components/common/pagination";
import {
  Search,
  Plus,
  Settings,
  Activity,
  Users,
  Eye,
  Edit,
  Trash2,
  Download,
  Ambulance,
} from "lucide-react";
import { HomecareService } from "./types";
import { useServiceStore } from "./store/serviceStore";

interface ServiceStats {
  totalServices: number;
  activeServices: number;
  totalOfferings: number;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] =
    useState<HomecareService | null>(null);
  const [editingService, setEditingService] = useState<HomecareService | null>(
    null,
  );
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const { services, setServices, getServices } = useServiceStore();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const { token, isLoggedIn } = useAdminStore();

  const statusOptions = ["All Status", "Active", "Inactive"];
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchServices = async (forceRefresh = false) => {
    if (!isLoggedIn || !token) {
      toast.error("Please login to access services");
      return;
    }

    if (!forceRefresh && services.length > 0) {
      console.log("Using cached services data");
      return;
    }

    setLoading(true);
    try {
      const response = await getHomecareServices(
        {
          status: selectedStatus === "All Status" ? null : selectedStatus,
          search: searchTerm || null,
        },
        token,
      );
      console.log(response, "response");
      if (response.success) {
        setServices(response.services);
        setCurrentPage(0);
      } else {
        throw new Error("Failed to fetch services");
      }
    } catch (err: any) {
      console.error("Error fetching services:", err);
      toast.error(err.message || "Failed to fetch services");
    } finally {
      setLoading(false);
      setShouldRefetch(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchServices();
    }
  }, [isLoggedIn, token, selectedStatus, debouncedSearchTerm]);

  useEffect(() => {
    if (shouldRefetch) {
      fetchServices(true);
    }
  }, [shouldRefetch]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "All Status" || service.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [services, debouncedSearchTerm, selectedStatus]);

  const currentServices = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return filteredServices.slice(start, end);
  }, [filteredServices, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredServices.length / pageSize);
  const hasMore = currentPage < totalPages - 1;

  const stats: ServiceStats = useMemo(() => {
    const totalServices = filteredServices.length;
    const activeServices = filteredServices.filter(
      (s) => s.status === "Active",
    ).length;
    const totalOfferings = filteredServices.reduce((acc, service) => {
      return acc + (service.service_tags?.length || 0);
    }, 0);

    return {
      totalServices,
      activeServices,
      totalOfferings,
    };
  }, [filteredServices]);

  const loadNextPage = () => {
    if (hasMore && !loading) {
      setCurrentPage((prev) => prev + 1);
      setSelectedServices([]);
    }
  };

  const loadPreviousPage = () => {
    if (currentPage > 0 && !loading) {
      setCurrentPage((prev) => prev - 1);
      setSelectedServices([]);
    }
  };

  const handleSelectService = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, serviceId]);
    } else {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServices(currentServices.map((service) => service.id));
    } else {
      setSelectedServices([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedServices.length === 0) return;

    const confirmed = await new Promise<boolean>((resolve) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>
              Are you sure you want to delete {selectedServices.length} selected
              services?
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="px-3 py-1 bg-red-400 text-white rounded text-xs"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs"
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
      setLoading(true);
      try {
        await Promise.all(
          selectedServices.map((serviceId) =>
            deleteHomecareService(serviceId, token),
          ),
        );
        toast.success(
          `${selectedServices.length} services deleted successfully!`,
        );
        setSelectedServices([]);
        // Force refresh after bulk delete
        await fetchServices(true);
      } catch (error: any) {
        console.error("Error deleting services:", error);
        toast.error(error.message || "Failed to delete some services");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleServiceAction = async (
    action: string,
    service: HomecareService,
  ) => {
    switch (action) {
      case "edit":
        setEditingService(service);
        setShowAddServiceModal(true);
        break;
      case "delete":
        const confirmed = await new Promise<boolean>((resolve) => {
          toast(
            (t) => (
              <div className="flex flex-col gap-2">
                <span>Are you sure you want to delete "{service.name}"?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      resolve(true);
                    }}
                    className="px-3 py-1 bg-red-400 text-white rounded text-xs"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      resolve(false);
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs"
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
          try {
            await deleteHomecareService(service.id, token);
            toast.success("Service deleted successfully!");
            // Force refresh after delete
            await fetchServices(true);
          } catch (error: any) {
            console.error("Error deleting service:", error);
            toast.error(error.message || "Failed to delete service");
          }
        }
        break;
      default:
        break;
    }
  };

  const handleManageOfferings = (service: HomecareService) => {
    setSelectedServiceForModal(service);
    setShowManageModal(true);
  };

  const handleAddService = async () => {
    // Trigger refetch after adding service
    setShouldRefetch(true);
    toast.success("Service added successfully!");
  };

  const handleUpdateService = async () => {
    // Trigger refetch after updating service
    setShouldRefetch(true);
    setEditingService(null);
    toast.success("Service updated successfully!");
  };

  const exportServicesToCSV = (services: HomecareService[]) => {
    const headers = [
      "Service Name",
      "Description",
      "Status",
      "Offerings Count",
      "Offerings",
      "Display Sections",
    ];

    const csvContent = [
      headers.join(","),
      ...services.map((s) =>
        [
          `"${s.name}"`,
          `"${s.description}"`,
          s.status,
          s.service_tags?.length || 0,
          `"${(s.service_tags || []).join("; ")}"`,
          `"${(s.display_sections || []).join("; ")}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `services_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (filteredServices.length === 0) {
      toast.error("No services to export");
      return;
    }

    const servicesToExport =
      selectedServices.length > 0
        ? filteredServices.filter((s) => selectedServices.includes(s.id))
        : filteredServices;

    exportServicesToCSV(servicesToExport);
    toast.success(`Exported ${servicesToExport.length} services successfully!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 ">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Services Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddServiceModal(true)}
              disabled={loading}
              className="flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg bg-[#0088B1] hover:bg-[#00729A] cursor-pointer text-white"
            >
              <Plus className="w-3 h-3" />
              New Service
            </button>
            {selectedServices.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className={`flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-400 hover:bg-red-500"
                } text-white`}
              >
                <Trash2 className="w-3 h-3" />
                {loading
                  ? "Deleting..."
                  : `Delete (${selectedServices.length})`}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <StatsCard
            title="Total Services"
            stats={stats.totalServices}
            icon={<Settings className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
          <StatsCard
            title="Active Services"
            stats={stats.activeServices}
            icon={<Activity className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
          <StatsCard
            title="Total Offerings"
            stats={stats.totalOfferings}
            icon={<Users className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by services name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={loading || filteredServices.length === 0}
              className={`flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50 ${
                loading || filteredServices.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <Download className="w-4 h-4" />
              {selectedServices.length > 0
                ? `Export Selected (${selectedServices.length})`
                : "Export All"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Services
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredServices.length} Total Services (Showing{" "}
                {currentServices.length})
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
                    Service Detail
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
                {loading && filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : currentServices.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="text-gray-500 text-center">
                        <Ambulance className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No services found
                        </h3>
                        <p className="text-gray-500">
                          No services match your current criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col min-w-[200px]">
                          <div className="text-xs font-medium text-[#161D1F] mb-1">
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {service.description}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {(service.service_tags || []).map(
                              (offering, index) => {
                                const isActiveOffering = offering
                                  .toLowerCase()
                                  .includes("active");
                                const activeClasses =
                                  "px-2 py-1 text-[8px] text-[#9B51E0] border border-[#9B51E0] rounded hover:bg-[#9B51E0] hover:text-white transition-colors";
                                const offeringClasses =
                                  "px-2 py-1 text-[8px] text-[#2196F3] border border-[#2196F3] rounded hover:bg-[#2196F3] hover:text-white transition-colors";

                                return (
                                  <span
                                    key={index}
                                    className={
                                      isActiveOffering
                                        ? activeClasses
                                        : offeringClasses
                                    }
                                  >
                                    {offering}
                                  </span>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={service.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-[#161D1F]">
                        <div className="flex items-center gap-2 justify-end">
                          <span
                            onClick={() => handleManageOfferings(service)}
                            className="text-[#161D1F] hover:text-black cursor-pointer text-xs hover:underline"
                          >
                            Manage Offerings
                          </span>
                          <button
                            className="p-1 text-gray-500 hover:text-[#0088B1] cursor-pointer"
                            onClick={() => handleManageOfferings(service)}
                            title="View Service"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleServiceAction("edit", service)}
                            className="p-1 text-gray-500 hover:text-[#0088B1] cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleServiceAction("delete", service)
                            }
                            className="p-1 text-[#F44336] hover:text-red-500 cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {loading && filteredServices.length > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredServices.length > pageSize && (
            <Pagination
              currentPage={currentPage}
              hasMore={hasMore}
              loading={loading}
              onPrevious={loadPreviousPage}
              onNext={loadNextPage}
              totalItems={filteredServices.length}
              itemsPerPage={pageSize}
            />
          )}
        </div>
      </div>

      <ManageOfferingsModal
        isOpen={showManageModal}
        onClose={() => {
          setShowManageModal(false);
          setSelectedServiceForModal(null);
        }}
        service={selectedServiceForModal}
      />

      <AddServiceModal
        isOpen={showAddServiceModal}
        onClose={() => {
          setShowAddServiceModal(false);
          setEditingService(null);
        }}
        onAddService={handleAddService}
        onUpdateService={handleUpdateService}
        editService={editingService}
      />
    </div>
  );
};

export default Services;
