"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  MoreVertical,
  ShieldMinus,
  Trash2,
  ShieldCheck,
  Layers,
  Edit,
} from "lucide-react";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import {
  fetchServices,
  deleteService,
  toggleServiceActive,
} from "../service/serviceApi";
import { ServiceAPI, ServiceModalMode } from "../types/serviceTypes";
import Pagination from "@/app/components/common/pagination";
import StatusBadge from "@/app/components/common/StatusBadge";
import ServiceModal from "../modal/ServiceModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { useServiceStore } from "../store/serviceStore";

const ITEMS_PER_PAGE = 20;

const ServicesListPage: React.FC = () => {
  const { token } = useAdminStore();
  const { navigateToDepartments, serviceRefreshKey, triggerServiceRefresh } =
    useServiceStore();

  const [services, setServices] = useState<ServiceAPI[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ServiceModalMode>("add");
  const [editingService, setEditingService] = useState<ServiceAPI | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<ServiceAPI | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (openMenuId) {
        const ref = menuRefs.current[openMenuId];
        if (ref && !ref.contains(e.target as Node)) setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const loadServices = useCallback(
    async (page: number, search: string) => {
      if (!token) return;
      setPageLoading(true);
      try {
        const { data, total } = await fetchServices(
          {
            start: page * ITEMS_PER_PAGE,
            max: ITEMS_PER_PAGE,
            search: search || null,
          },
          token,
        );
        setServices(data);
        setTotalItems(total);
      } catch (err: any) {
        toast.error(err.message || "Failed to load services");
      } finally {
        setPageLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadServices(currentPage, searchTerm);
  }, [currentPage, searchTerm, loadServices, serviceRefreshKey]);

  const hasMore = (currentPage + 1) * ITEMS_PER_PAGE < totalItems;

  const handleEdit = (service: ServiceAPI) => {
    setModalMode("edit");
    setEditingService(service);
    setModalOpen(true);
    setOpenMenuId(null);
  };

  const handleToggleActive = async (service: ServiceAPI) => {
    if (!token) return;
    setOpenMenuId(null);
    try {
      await toggleServiceActive(service, token);
      toast.success(
        `Service marked as ${!service.is_active ? "Active" : "Inactive"}`,
      );
      loadServices(currentPage, searchTerm);
    } catch (err: any) {
      toast.error(err.message || "Failed to update service");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteService(deleteTarget, token);
      toast.success(`"${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      loadServices(currentPage, searchTerm);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete service");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[20px] font-semibold text-[#161D1F]">
              Our Services
            </h1>
            {/* <p className="text-[12px] text-[#899193] mt-0.5">
              Manage all healthcare services, sub-departments and procedures
            </p> */}
          </div>
          <button
            onClick={() => {
              setModalMode("add");
              setEditingService(undefined);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add New Service
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Services
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                Showing {services.length} of {totalItems} services
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#899193]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#899193]">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#899193]">
                    Date modified
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#899193]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-[#899193]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0088B1]" />
                      </div>
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-[12px] text-[#899193]"
                    >
                      No services found
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr
                      key={service.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                    >
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => navigateToDepartments(service)}
                      >
                        <div className="flex items-center gap-3">
                          {service.image_url ? (
                            <img
                              src={service.image_url}
                              alt={service.name}
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#E8F4F7] flex items-center justify-center flex-shrink-0">
                              <Layers className="w-4 h-4 text-[#0088B1]" />
                            </div>
                          )}
                          <span className="text-[12px] font-medium text-[#161D1F] hover:text-[#0088B1] transition-colors">
                            {service.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-4 max-w-xs cursor-pointer"
                        onClick={() => navigateToDepartments(service)}
                      >
                        <p className="text-[12px] text-[#899193] line-clamp-2">
                          {service.description}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[12px] text-[#899193]">
                          {formatDate(service.updated_date)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          status={service.is_active ? "Active" : "Inactive"}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(service);
                            }}
                            className="p-1.5 text-[#899193] hover:text-[#0088B1] hover:bg-[#E8F4F7] rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <div
                            className="relative"
                            ref={(el) => {
                              menuRefs.current[service.id] = el;
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(
                                  openMenuId === service.id ? null : service.id,
                                );
                              }}
                              className="p-1.5 text-[#899193] hover:text-[#161D1F] hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {openMenuId === service.id && (
                              <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-[#E5E8E9] rounded-xl shadow-lg py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleActive(service);
                                  }}
                                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-[#161D1F] hover:bg-[#E8F4F7] transition-colors"
                                >
                                  {service.is_active ? (
                                    <>
                                      <ShieldMinus className="w-4 h-4 text-[#899193]" />
                                      Make Inactive
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                                      Make Active
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget(service);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
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

          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              hasMore={hasMore}
              loading={pageLoading}
              onPrevious={() => setCurrentPage((p) => Math.max(0, p - 1))}
              onNext={() => setCurrentPage((p) => p + 1)}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </div>
      </div>

      <ServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialTab="specialty"
        initialService={editingService}
        onSuccess={() => {
          toast.success(
            modalMode === "add"
              ? "Service added successfully!"
              : "Service updated successfully!",
          );
          loadServices(currentPage, searchTerm);
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone and will remove all associated sub-departments and procedures.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ServicesListPage;
