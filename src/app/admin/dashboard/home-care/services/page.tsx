"use client";
import React, { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import StatsCard from "../components/StatsCard";
import ManageOfferingsModal from "./ManageOfferingsModal";
import AddServiceModal from "./AddServiceModal";
import {
  getHomecareServices,
  deleteHomecareService,
  type HomecareService,
} from "./service/api/homecareServices";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";

import {
  Search,
  ChevronDown,
  Plus,
  Settings,
  Activity,
  Users,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

const transformHomecareServiceToService = (
  homecareService: HomecareService
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
      features: homecareService.display_sections || [],
      staffRequirements: [],
      equipmentIncluded: [],
      status: "Available" as const,
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
  features: string[];
  staffRequirements: string[];
  equipmentIncluded: string[];
  status: "Excellent" | "Good" | "Available";
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

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [openDropdown, setOpenDropdown] = useState<null | "status">(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceActionDropdown, setServiceActionDropdown] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] =
    useState<Service | null>(null);

  // Get token from store
  const { token, isLoggedIn } = useAdminStore();
  const [editingService, setEditingService] = useState<Service | null>(null);

  const statusOptions = ["All Status", "Active", "Inactive"];

  // Generate stats
  const generateStats = (): ServiceStats => {
    const totalServices = services.length;
    const activeServices = services.filter((s) => s.status === "Active").length;
    const totalOfferings = services.reduce((acc, service) => {
      return acc + service.offerings.length;
    }, 0);

    return {
      totalServices,
      activeServices,
      totalOfferings,
    };
  };
  const stats = generateStats();

  // API fetch function
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
        },
        token
      );

      console.log(response.services, "services");

      if (response.success) {
        const transformedServices = response.services.map(
          transformHomecareServiceToService
        );
        setServices(transformedServices);
        setFilteredServices(transformedServices);
      } else {
        throw new Error("Failed to fetch services");
      }
    } catch (err: any) {
      console.error("Error fetching services:", err);
      const errorMessage = err.message || "Failed to fetch services";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  console.log(services, "new transformed");
  useEffect(() => {
    if (isLoggedIn && token) {
      fetchServices();
    } else {
      setServices([]);
      setFilteredServices([]);
      if (!isLoggedIn) {
        toast.error("Please login to access services");
      }
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (isLoggedIn && token) {
      if (searchTerm.length === 0 || searchTerm.length > 2) {
        const timeoutId = setTimeout(() => {
          fetchServices();
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [searchTerm, selectedStatus]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const handleBulkDelete = async () => {
    if (selectedServices.length === 0) return;

    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>
              Are you sure you want to delete {selectedServices.length} selected
              services?
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
        // Delete all selected services
        await Promise.all(
          selectedServices.map((serviceId) =>
            deleteHomecareService(serviceId, token)
          )
        );

        toast.success(
          `${selectedServices.length} services deleted successfully!`
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

  const handleSelectService = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, serviceId]);
    } else {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    }
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServices(
        filteredServices.map((service) => service.id.toString())
      );
    } else {
      setSelectedServices([]);
    }
  };
  const handleServiceAction = async (action: string, service: Service) => {
    setServiceActionDropdown(null);

    switch (action) {
      case "view":
        console.log("View service:", service);
        break;
      case "edit":
        setEditingService(service);
        setShowAddServiceModal(true);
        break;
      case "delete":
        const confirmed = await new Promise<boolean>((resolve) => {
          const toastId = toast(
            (t) => (
              <div className="flex flex-col gap-2 ">
                <span>Are you sure you want to delete "{service.name}"?</span>
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

  const handleAddService = async (newServiceData: Omit<Service, "id">) => {
    await fetchServices();
    toast.success("Service list updated!");
  };
  const handleUpdateService = async (updatedService: Service) => {
    await fetchServices();
    setEditingService(null);
    toast.success("Service updated successfully!");
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
        setOpenDropdown(null);
        setServiceActionDropdown(null);
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Services Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddServiceModal(true)}
              disabled={loading}
              className={`flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0088B1] hover:bg-[#00729A]"
              } text-[#F8F8F8]`}
            >
              <Plus className="w-3 h-3" />
              {loading ? "Loading..." : "New Service"}
            </button>
            {selectedServices.length > 0 && (
              <button
                onClick={() => handleBulkDelete()}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <StatsCard
            title="Total Services"
            stats={stats.totalServices}
            icon={<Settings className="w-5 h-5" />}
            color="text-blue-500"
          />
          <StatsCard
            title="Active Services"
            stats={stats.activeServices}
            icon={<Activity className="w-5 h-5" />}
            color="text-green-500"
          />
          <StatsCard
            title="Total Offerings"
            stats={stats.totalOfferings}
            icon={<Users className="w-5 h-5" />}
            color="text-purple-500"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by services name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-3">
            {/* Status Dropdown */}
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

        {/* Services Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Services
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredServices.length} Services
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
                        selectedServices.length === filteredServices.length &&
                        filteredServices.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Service Detail
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
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                      {/* <div className="text-gray-500">Loading services...</div> */}
                    </td>
                  </tr>
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No services found.</div>
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => (
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
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-[#161D1F] mb-1">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                        <div className="flex items-center gap-2 justify-end">
                          <span
                            onClick={() => handleManageOfferings(service)}
                            className="text-[#161D1F] hover:text-black cursor-pointer text-sm hover:underline"
                          >
                            Manage Offerings
                          </span>
                          <button
                            className="p-1 text-gray-500 hover:text-blue-500"
                            onClick={() => handleManageOfferings(service)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleServiceAction("edit", service)}
                            className="p-1 text-gray-500 hover:text-blue-500"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleServiceAction("delete", service)
                            }
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
