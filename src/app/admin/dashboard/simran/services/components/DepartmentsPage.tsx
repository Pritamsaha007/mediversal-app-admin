"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  ChevronRight,
  Home,
  Edit2,
  MoreVertical,
  ShieldMinus,
  ShieldCheck,
  Trash2,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import {
  fetchDepartments,
  deleteDepartment,
  toggleDepartmentActive,
} from "../service/serviceApi";
import { DepartmentAPI, ServiceModalMode } from "../types/serviceTypes";
import Pagination from "@/app/components/common/pagination";
import StatusBadge from "@/app/components/common/StatusBadge";
import ServiceModal from "../modal/ServiceModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { useServiceStore } from "../store/serviceStore";

const ITEMS_PER_PAGE = 20;

const DepartmentsPage: React.FC = () => {
  const { token } = useAdminStore();
  const {
    selectedService,
    navigateToServices,
    navigateToProcedures,
    departmentRefreshKey,
  } = useServiceStore();

  const service = selectedService!;

  const [departments, setDepartments] = useState<DepartmentAPI[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ServiceModalMode>("add");
  const [editingDept, setEditingDept] = useState<DepartmentAPI | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<DepartmentAPI | null>(null);
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

  const loadDepartments = useCallback(
    async (page: number) => {
      if (!token) return;
      setPageLoading(true);
      try {
        const { data, total } = await fetchDepartments(
          {
            start: page * ITEMS_PER_PAGE,
            max: ITEMS_PER_PAGE,
            service_id: service.id,
          },
          token,
        );
        setDepartments(data);
        setTotalItems(total);
      } catch (err: any) {
        toast.error(err.message || "Failed to load departments");
      } finally {
        setPageLoading(false);
      }
    },
    [token, service.id],
  );

  useEffect(() => {
    loadDepartments(currentPage);
  }, [currentPage, loadDepartments, departmentRefreshKey]);

  const hasMore = (currentPage + 1) * ITEMS_PER_PAGE < totalItems;

  const handleEdit = (dept: DepartmentAPI) => {
    setModalMode("edit");
    setEditingDept(dept);
    setModalOpen(true);
    setOpenMenuId(null);
  };

  const handleToggleActive = async (dept: DepartmentAPI) => {
    if (!token) return;
    setOpenMenuId(null);
    try {
      await toggleDepartmentActive(dept, token);
      toast.success(
        `Department marked as ${!dept.is_active ? "Active" : "Inactive"}`,
      );
      loadDepartments(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Failed to update department");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteDepartment(deleteTarget, token);
      toast.success(`"${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      loadDepartments(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete department");
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

  const initials = service.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={navigateToServices}
              className="flex items-center gap-1 text-[12px] text-[#899193] hover:text-[#0088B1] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Our Services</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#C5C9CA]" />
            <span className="text-[12px] font-medium text-[#161D1F] bg-[#E8F4F7] px-2.5 py-0.5 rounded-full">
              {service.name}
            </span>
          </div>
          <button
            onClick={() => {
              setModalMode("add");
              setEditingDept(undefined);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add New Sub-Department
          </button>
        </div>

        <div className="flex gap-4">
          <div className="w-[350px] flex-shrink-0 space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
              <div className="flex items-center gap-3 mb-3 ">
                <div className="w-10 h-10 rounded-lg bg-[#E8F4F7] flex items-center justify-center flex-shrink-0">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span className="text-[14px] font-bold text-[#0088B1]">
                      {initials}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[20px] font-semibold text-[#161D1F]">
                    {service.name}
                  </p>
                </div>
                <div className="absolute right-4 top-4">
                  <StatusBadge
                    status={service.is_active ? "Active" : "Inactive"}
                  />
                </div>
              </div>
              <div className="mb-3 border border-gray-200 rounded-md p-2">
                <p className="text-[12px] font-semibold text-[#161D1F] mb-1">
                  Description:
                </p>
                <p className="text-[12px] text-[#899193]">
                  {service.description}
                </p>
              </div>
              {service.tags && service.tags.length > 0 && (
                <div className="border border-gray-200 rounded-md p-2">
                  <p className="text-[12px] font-semibold text-[#161D1F] mb-2">
                    Tags:
                  </p>
                  <div className="space-y-1">
                    {service.tags.map((tag, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-[#34C759] flex-shrink-0" />
                        <span className="text-[12px] text-[#161D1F]">
                          {tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0088B1]" />
                <h3 className="text-[16px] font-medium text-[#161D1F]">
                  Sub-Departments
                </h3>
              </div>
              <p className="text-[12px] text-[#899193] mt-0.5">
                Click a row to view its procedures
              </p>
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
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0088B1]" />
                        </div>
                      </td>
                    </tr>
                  ) : departments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-[12px] text-[#899193]"
                      >
                        No departments found
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept) => (
                      <tr
                        key={dept.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td
                          className="px-4 py-4"
                          onClick={() => navigateToProcedures(dept)}
                        >
                          <span className="text-[12px] font-medium text-[#161D1F] hover:text-[#0088B1]">
                            {dept.name}
                          </span>
                        </td>
                        <td
                          className="px-4 py-4 max-w-xs"
                          onClick={() => navigateToProcedures(dept)}
                        >
                          <p className="text-[12px] text-[#899193] line-clamp-2">
                            {dept.description}
                          </p>
                        </td>
                        <td
                          className="px-4 py-4"
                          onClick={() => navigateToProcedures(dept)}
                        >
                          <span className="text-[12px] text-[#899193]">
                            {formatDate(dept.updated_date)}
                          </span>
                        </td>
                        <td
                          className="px-4 py-4"
                          onClick={() => navigateToProcedures(dept)}
                        >
                          <StatusBadge
                            status={dept.is_active ? "Active" : "Inactive"}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(dept);
                              }}
                              className="p-1.5 text-[#899193] hover:text-[#0088B1] hover:bg-[#E8F4F7] rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <div
                              className="relative"
                              ref={(el) => {
                                menuRefs.current[dept.id] = el;
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(
                                    openMenuId === dept.id ? null : dept.id,
                                  );
                                }}
                                className="p-1.5 text-[#899193] hover:text-[#161D1F] hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                              {openMenuId === dept.id && (
                                <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-[#E5E8E9] rounded-xl shadow-lg py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleActive(dept);
                                    }}
                                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-[#161D1F] hover:bg-[#E8F4F7] transition-colors"
                                  >
                                    {dept.is_active ? (
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
                                      setDeleteTarget(dept);
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
      </div>

      <ServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialTab="sub-department"
        initialDepartment={editingDept}
        contextServiceId={service.id}
        onSuccess={() => {
          toast.success(
            modalMode === "add"
              ? "Sub-department added successfully!"
              : "Sub-department updated successfully!",
          );
          loadDepartments(currentPage);
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Sub-Department"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all procedures under it.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default DepartmentsPage;
