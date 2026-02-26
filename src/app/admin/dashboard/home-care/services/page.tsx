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
} from "lucide-react";
import { HomecareService } from "./types";

const transformHomecareServiceToService = (
  homecareService: HomecareService,
): Service => {
  return {
    id: homecareService.id,
    name: homecareService.name,
    description: homecareService.description,
    category: homecareService.display_sections?.[0] || "General",
    status: homecareService.status,
    display_sections: homecareService.display_sections,
    custom_medical_info: homecareService.custom_medical_info,
    offerings: homecareService.service_tags.map((tag, index) => ({
      id: `${homecareService.id}-offering-${index}`,
      name: tag,
      description: `${tag} service`,
      price: 0,
      duration: "1 hour",
      duration_in_hrs: 1,
      duration_type_value: "hour",
      duration_type: "hour",
      features: homecareService.display_sections || [],
      staffRequirements: [],
      equipmentIncluded: [],
      status: "Available" as const,
      is_device: false,
      device_stock_count: 0,
    })),
    rating: 4.5,
    reviewCount: 10,
    consents: homecareService.consents || [],
  };
};

interface Offering {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  duration_in_hrs: number;
  duration_type_value: string;
  duration_type: string;
  features: string[];
  staffRequirements: string[];
  equipmentIncluded: string[];
  status: "Excellent" | "Good" | "Available";
  is_device: boolean;
  device_stock_count: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "Active" | "Inactive";
  offerings: Offering[];
  rating?: number;
  reviewCount?: number;
  consents?: Array<{
    id: string;
    consent: string;
    is_active: boolean;
    consent_category_id: string;
  }>;
  display_sections: string[];
  custom_medical_info: any;
}

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
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] =
    useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Frontend Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const { token, isLoggedIn } = useAdminStore();

  const statusOptions = ["All Status", "Active", "Inactive"];
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch all services (no pagination from API)
  const fetchServices = async () => {
    if (!isLoggedIn || !token) {
      toast.error("Please login to access services");
      return;
    }

    setLoading(true);

    try {
      const response = await getHomecareServices(
        {
          status: selectedStatus === "All Status" ? null : selectedStatus,
          search: searchTerm || null,
          // No pagination params sent to API
        },
        token,
      );

      if (response.success) {
        const transformedServices = response.services.map(
          transformHomecareServiceToService,
        );
        setAllServices(transformedServices);
        // Reset to first page when new data comes in
        setCurrentPage(0);
      } else {
        throw new Error("Failed to fetch services");
      }
    } catch (err: any) {
      console.error("Error fetching services:", err);
      toast.error(err.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchServices();
    }
  }, [isLoggedIn, token, selectedStatus, debouncedSearchTerm]);

  // Filter services based on search and status
  const filteredServices = useMemo(() => {
    return allServices.filter((service) => {
      const matchesSearch = service.name
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "All Status" || service.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [allServices, debouncedSearchTerm, selectedStatus]);

  // Get current page data
  const currentServices = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return filteredServices.slice(start, end);
  }, [filteredServices, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredServices.length / pageSize);
  const hasMore = currentPage < totalPages - 1;

  // Generate stats from all filtered services
  const stats: ServiceStats = useMemo(() => {
    const totalServices = filteredServices.length;
    const activeServices = filteredServices.filter(
      (s) => s.status === "Active",
    ).length;
    const totalOfferings = filteredServices.reduce((acc, service) => {
      return acc + service.offerings.length;
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
      setSelectedServices([]); // Clear selections when changing page
    }
  };

  const loadPreviousPage = () => {
    if (currentPage > 0 && !loading) {
      setCurrentPage((prev) => prev - 1);
      setSelectedServices([]); // Clear selections when changing page
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
        await fetchServices();
      } catch (error: any) {
        console.error("Error deleting services:", error);
        toast.error(error.message || "Failed to delete some services");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleServiceAction = async (action: string, service: Service) => {
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
            await fetchServices();
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

  const handleManageOfferings = (service: Service) => {
    setSelectedServiceForModal(service);
    setShowManageModal(true);
  };

  const handleAddService = async () => {
    await fetchServices();
    toast.success("Service list updated!");
  };

  const handleUpdateService = async () => {
    await fetchServices();
    setEditingService(null);
    toast.success("Service updated successfully!");
  };

  const exportServicesToCSV = (services: Service[]) => {
    const headers = [
      "Service Name",
      "Description",
      "Category",
      "Status",
      "Offerings Count",
      "Offerings",
      "Display Sections",
      "Custom Medical Info",
    ];

    const csvContent = [
      headers.join(","),
      ...services.map((s) =>
        [
          `"${s.name}"`,
          `"${s.description}"`,
          `"${s.category}"`,
          s.status,
          s.offerings.length,
          `"${s.offerings.map((o) => o.name).join("; ")}"`,
          `"${(s.display_sections || []).join("; ")}"`,
          `"${JSON.stringify(s.custom_medical_info || {}).replace(/"/g, '""')}"`,
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
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Services Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddServiceModal(true)}
              disabled={loading}
              className={`flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg 
                  bg-[#0088B1] hover:bg-[#00729A] cursor-pointer
             `}
            >
              <Plus className="w-3 h-3" />
              {"New Service"}
            </button>
            {selectedServices.length > 0 && (
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
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider whitespace-nowrap bg-gray-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                      checked={
                        selectedServices.length === currentServices.length &&
                        currentServices.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
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
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : currentServices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No services found.</div>
                    </td>
                  </tr>
                ) : (
                  currentServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedServices.includes(service.id)}
                          onChange={(e) =>
                            handleSelectService(service.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col min-w-[200px]">
                          <div className="text-xs font-medium text-[#161D1F] mb-1">
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {service.description}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {service.offerings.map((offering, index) => {
                              const isActiveOffering = offering.name
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
                                  {offering.name}
                                </span>
                              );
                            })}
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
                    <td colSpan={4} className="px-6 py-4 text-center">
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
