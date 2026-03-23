"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  ShieldMinus,
  ShieldCheck,
  Trash2,
  ChevronRight,
  Layers,
  Star,
  StarOff,
  Calendar,
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
import ActionMenu from "@/app/components/ui/ActionMenu";
const ITEMS_PER_PAGE = 20;

const SpecialtiesPage: React.FC = () => {
  const { token } = useAdminStore();
  const { navigateToDepartments, serviceRefreshKey } = useServiceStore();

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
  };

  const handleToggleActive = async (service: ServiceAPI) => {
    if (!token) return;
    try {
      await toggleServiceActive(service, token);
      toast.success(
        `Specialty marked as ${!service.is_active ? "Active" : "Inactive"}`,
      );
      loadServices(currentPage, searchTerm);
    } catch (err: any) {
      toast.error(err.message || "Failed to update specialty");
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
      toast.error(err.message || "Failed to delete specialty");
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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-[-30] z-20 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-semibold text-[#161D1F]">
              Specialties
            </h1>
            <p className="text-[11px] text-[#899193]">
              Manage healthcare specialties, sub-departments and procedures
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search specialties..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
                className="pl-8 pr-3 py-1.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] w-52"
              />
            </div>
            <button
              onClick={() => {
                setModalMode("add");
                setEditingService(undefined);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Specialty
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        <p className="text-[11px] text-[#899193] mb-3">
          Showing {services.length} of {totalItems} specialties
        </p>

        {pageLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#0088B1]" />
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-[#E8F4F7] rounded-full flex items-center justify-center mb-3">
              <Layers className="w-6 h-6 text-[#0088B1]" />
            </div>
            <p className="text-[14px] font-medium text-[#161D1F]">
              No specialties found
            </p>
            <p className="text-[12px] text-[#899193] mt-1">
              {searchTerm
                ? "Try a different search term"
                : "Get started by adding your first specialty"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setModalMode("add");
                  setEditingService(undefined);
                  setModalOpen(true);
                }}
                className="mt-4 flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Specialty
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#0088B1] hover:shadow-md transition-all duration-200 group flex flex-col"
              >
                {/* Image */}
                <div
                  className="relative h-28 bg-[#E8F4F7] flex items-center justify-center cursor-pointer flex-shrink-0"
                  onClick={() => navigateToDepartments(service)}
                >
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span className="text-[28px] font-bold text-[#0088B1] opacity-40 select-none">
                      {getInitials(service.name)}
                    </span>
                  )}
                  {service.is_featured && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      Featured
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge
                      status={service.is_active ? "Active" : "Inactive"}
                    />
                  </div>
                </div>

                <div className="p-3 flex flex-col flex-1">
                  <div
                    className="cursor-pointer mb-2"
                    onClick={() => navigateToDepartments(service)}
                  >
                    <h3 className="text-[13px] font-semibold text-[#161D1F] group-hover:text-[#0088B1] transition-colors line-clamp-1">
                      {service.name}
                    </h3>
                    <p className="text-[11px] text-[#899193] mt-0.5 line-clamp-2 leading-relaxed">
                      {service.description || "No description provided."}
                    </p>
                  </div>

                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {service.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-[#899193] rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {service.tags.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-[#899193] rounded">
                          +{service.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-[#C5C9CA]">
                      <Calendar className="w-3 h-3" />
                      {formatDate(service.updated_date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigateToDepartments(service)}
                        className="flex items-center gap-1 text-[11px] text-[#0088B1] hover:bg-[#E8F4F7] px-2 py-1 rounded-lg transition-colors"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(service);
                        }}
                        className="p-1.5 text-[#899193] hover:text-[#0088B1] hover:bg-[#E8F4F7] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <ActionMenu
                        id={service.id}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        items={[
                          {
                            label: service.is_active
                              ? "Make Inactive"
                              : "Make Active",
                            icon: service.is_active ? (
                              <ShieldMinus className="w-4 h-4 text-[#899193]" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                            ),
                            onClick: () => handleToggleActive(service),
                          },
                          {
                            label: "Delete Specialty",
                            icon: <Trash2 className="w-4 h-4" />,
                            onClick: () => setDeleteTarget(service),
                            className: "text-red-500 hover:bg-red-50",
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalItems > ITEMS_PER_PAGE && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              hasMore={hasMore}
              loading={pageLoading}
              onPrevious={() => setCurrentPage((p) => Math.max(0, p - 1))}
              onNext={() => setCurrentPage((p) => p + 1)}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        )}
      </div>

      <ServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialTab="specialty"
        initialService={editingService}
        onSuccess={() => {
          setModalOpen(false);
          loadServices(currentPage, searchTerm);
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Specialty"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all sub-departments and procedures under it.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default SpecialtiesPage;
