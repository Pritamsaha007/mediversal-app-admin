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
  Stethoscope,
  Search,
} from "lucide-react";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import {
  fetchProcedures,
  deleteProcedure,
  toggleProcedureActive,
} from "../service/serviceApi";
import { ProcedureAPI, ServiceModalMode } from "../types/serviceTypes";
import Pagination from "@/app/components/common/pagination";
import StatusBadge from "@/app/components/common/StatusBadge";
import ServiceModal from "../modal/ServiceModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { useServiceStore } from "../store/serviceStore";

const ITEMS_PER_PAGE = 10;

const ProceduresPage: React.FC = () => {
  const { token } = useAdminStore();
  const {
    selectedService,
    selectedDepartment,
    navigateToServices,
    navigateToDepartments,
    procedureRefreshKey,
  } = useServiceStore();

  const service = selectedService!;
  const department = selectedDepartment!;

  const [procedures, setProcedures] = useState<ProcedureAPI[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ServiceModalMode>("add");
  const [editingProc, setEditingProc] = useState<ProcedureAPI | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<ProcedureAPI | null>(null);
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

  const loadProcedures = useCallback(
    async (page: number, search: string) => {
      if (!token) return;
      setPageLoading(true);
      try {
        const { data, total } = await fetchProcedures(
          {
            start: page * ITEMS_PER_PAGE,
            max: ITEMS_PER_PAGE,
            search: search || null,
            service_id: service.id,
            department_id: department.id,
          },
          token,
        );
        setProcedures(data);
        setTotalItems(total);
      } catch (err: any) {
        toast.error(err.message || "Failed to load procedures");
      } finally {
        setPageLoading(false);
      }
    },
    [token, service.id, department.id],
  );

  useEffect(() => {
    loadProcedures(currentPage, searchTerm);
  }, [currentPage, searchTerm, loadProcedures, procedureRefreshKey]);

  const hasMore = (currentPage + 1) * ITEMS_PER_PAGE < totalItems;

  const handleEdit = (proc: ProcedureAPI) => {
    setModalMode("edit");
    setEditingProc(proc);
    setModalOpen(true);
    setOpenMenuId(null);
  };

  const handleToggleActive = async (proc: ProcedureAPI) => {
    if (!token) return;
    setOpenMenuId(null);
    try {
      await toggleProcedureActive(proc, token);
      toast.success(
        `Procedure marked as ${!proc.is_active ? "Active" : "Inactive"}`,
      );
      loadProcedures(currentPage, searchTerm);
    } catch (err: any) {
      toast.error(err.message || "Failed to update procedure");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteProcedure(deleteTarget, token);
      toast.success(`"${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      loadProcedures(currentPage, searchTerm);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete procedure");
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

  const deptInitials = department.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
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
            <button
              onClick={() => navigateToDepartments(service)}
              className="text-[12px] text-[#899193] hover:text-[#0088B1] transition-colors"
            >
              {service.name}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#C5C9CA]" />
            <span className="text-[12px] font-medium bg-[#E8F4F7] text-[#0088B1] px-2.5 py-0.5 rounded-full">
              {department.name}
            </span>
          </div>
          <button
            onClick={() => {
              setModalMode("add");
              setEditingProc(undefined);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add New Procedure
          </button>
        </div>

        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#E8F4F7] flex items-center justify-center flex-shrink-0">
                  <span className="text-[13px] font-bold text-[#0088B1]">
                    {deptInitials}
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#161D1F]">
                    {department.name}
                  </p>
                  <StatusBadge
                    status={department.is_active ? "Active" : "Inactive"}
                  />
                </div>
              </div>
              <div className="mb-3 border border-gray-200 rounded-md p-2">
                <p className="text-[10px] font-semibold text-[#161D1F] mb-1">
                  Description:
                </p>
                <p className="text-[11px] text-[#899193]">
                  {department.description}
                </p>
              </div>
              {department.symptoms && department.symptoms.length > 0 && (
                <div className="border border-gray-200 rounded-md p-2">
                  <p className="text-[10px] font-semibold text-[#161D1F] mb-2">
                    Warning Signs:
                  </p>
                  <ul className="space-y-1">
                    {department.symptoms.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="mt-1 w-1 h-1 rounded-full bg-[#899193] flex-shrink-0" />
                        <span className="text-[11px] text-[#161D1F]">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#0088B1]" />
                  <h3 className="text-[15px] font-medium text-[#161D1F]">
                    Procedures
                  </h3>
                </div>
                <div className="relative w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search procedures..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 border border-[#E5E8E9] rounded-lg text-[11px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
                  />
                </div>
              </div>
              <p className="text-[10px] text-[#899193] mt-0.5">
                Choose a procedure to view or edit details
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-[#899193]">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-[#899193]">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-[#899193]">
                      Date modified
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-[#899193]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-medium text-[#899193]">
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
                  ) : procedures.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-[12px] text-[#899193]"
                      >
                        No procedures found
                      </td>
                    </tr>
                  ) : (
                    procedures.map((proc) => (
                      <tr
                        key={proc.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {proc.image_url ? (
                              <img
                                src={proc.image_url}
                                alt={proc.name}
                                className="w-7 h-7 rounded-md object-cover flex-shrink-0 bg-gray-100"
                                onError={(e) =>
                                  (e.currentTarget.style.display = "none")
                                }
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-md bg-[#E8F4F7] flex items-center justify-center flex-shrink-0">
                                <Stethoscope className="w-3.5 h-3.5 text-[#0088B1]" />
                              </div>
                            )}
                            <span className="text-[12px] font-medium text-[#161D1F]">
                              {proc.name}
                            </span>
                          </div>
                          {(proc.min_cost || proc.max_cost) && (
                            <p className="text-[10px] text-[#0088B1] mt-0.5 ml-9">
                              ₹{proc.min_cost?.toLocaleString()} – ₹
                              {proc.max_cost?.toLocaleString()}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <p className="text-[11px] text-[#899193] line-clamp-2">
                            {proc.description}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-[11px] text-[#899193]">
                            {formatDate(proc.updated_date)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge
                            status={proc.is_active ? "Active" : "Inactive"}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(proc);
                              }}
                              className="p-1.5 text-[#899193] hover:text-[#0088B1] hover:bg-[#E8F4F7] rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <div
                              className="relative"
                              ref={(el) => {
                                menuRefs.current[proc.id] = el;
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(
                                    openMenuId === proc.id ? null : proc.id,
                                  );
                                }}
                                className="p-1.5 text-[#899193] hover:text-[#161D1F] hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                              {openMenuId === proc.id && (
                                <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-[#E5E8E9] rounded-xl shadow-lg py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleActive(proc);
                                    }}
                                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-[#161D1F] hover:bg-[#E8F4F7] transition-colors"
                                  >
                                    {proc.is_active ? (
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
                                      setDeleteTarget(proc);
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
        initialTab="procedure"
        initialProcedure={editingProc}
        contextServiceId={service.id}
        contextDepartmentId={department.id}
        onSuccess={() => {
          toast.success(
            modalMode === "add"
              ? "Procedure added successfully!"
              : "Procedure updated successfully!",
          );
          loadProcedures(currentPage, searchTerm);
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Procedure"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ProceduresPage;
