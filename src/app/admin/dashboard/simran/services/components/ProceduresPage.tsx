"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  ShieldMinus,
  ShieldCheck,
  Trash2,
  Stethoscope,
  Calendar,
  IndianRupee,
  Clock,
  FileText,
  BedDouble,
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
import Breadcrumb from "@/app/components/ui/Breadcrumb";
import ActionMenu from "@/app/components/ui/ActionMenu";

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
  const [selectedProc, setSelectedProc] = useState<ProcedureAPI | null>(null);

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
        if (data.length > 0 && !selectedProc) setSelectedProc(data[0]);
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
  };

  const handleToggleActive = async (proc: ProcedureAPI) => {
    if (!token) return;
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
      if (selectedProc?.id === deleteTarget.id) setSelectedProc(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-[-30] z-20 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Breadcrumb
            items={[
              { label: "Specialties", onClick: navigateToServices },
              {
                label: service.name,
                onClick: () => navigateToDepartments(service),
              },
              { label: department.name },
            ]}
          />
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search procedures..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
                className="pl-8 pr-3 py-1.5 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1] w-48"
              />
            </div>
            <button
              onClick={() => {
                setModalMode("add");
                setEditingProc(undefined);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Procedure
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-xl border border-[#E8F4F7] p-4 mb-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#E8F4F7] flex items-center justify-center flex-shrink-0">
            <span className="text-[13px] font-bold text-[#0088B1]">
              {department.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[14px] font-semibold text-[#161D1F]">
                {department.name}
              </h2>
              <StatusBadge
                status={department.is_active ? "Active" : "Inactive"}
              />
              <span className="text-[11px] text-[#899193]">under</span>
              <span className="text-[11px] font-medium text-[#0088B1]">
                {service.name}
              </span>
            </div>
            <p className="text-[12px] text-[#899193] mt-0.5 line-clamp-1">
              {department.description || "No description."}
            </p>
          </div>
          <div className="text-[11px] text-[#C5C9CA] flex items-center gap-1 flex-shrink-0">
            <Stethoscope className="w-3.5 h-3.5" />
            {totalItems} Procedures
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#899193]">
                      Procedure
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#899193]">
                      Cost Range
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#899193]">
                      Modified
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#899193]">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[#899193]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0088B1]" />
                        </div>
                      </td>
                    </tr>
                  ) : procedures.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Stethoscope className="w-8 h-8 text-gray-200" />
                          <p className="text-[12px] text-[#899193]">
                            {searchTerm
                              ? "No procedures match your search"
                              : "No procedures yet"}
                          </p>
                          {!searchTerm && (
                            <button
                              onClick={() => {
                                setModalMode("add");
                                setEditingProc(undefined);
                                setModalOpen(true);
                              }}
                              className="text-[11px] text-[#0088B1] hover:underline"
                            >
                              Add first procedure
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    procedures.map((proc) => (
                      <tr
                        key={proc.id}
                        onClick={() => setSelectedProc(proc)}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${
                          selectedProc?.id === proc.id
                            ? "bg-[#E8F4F7]"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {proc.image_url ? (
                              <img
                                src={proc.image_url}
                                alt={proc.name}
                                className="w-7 h-7 rounded object-cover flex-shrink-0"
                                onError={(e) =>
                                  (e.currentTarget.style.display = "none")
                                }
                              />
                            ) : (
                              <div className="w-7 h-7 rounded bg-[#E8F4F7] flex items-center justify-center flex-shrink-0">
                                <Stethoscope className="w-3.5 h-3.5 text-[#0088B1]" />
                              </div>
                            )}
                            <span className="text-[12px] font-medium text-[#161D1F] line-clamp-1">
                              {proc.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-[#161D1F]">
                            {proc.min_cost || proc.max_cost
                              ? `₹${Number(proc.min_cost).toLocaleString("en-IN")} – ₹${Number(proc.max_cost).toLocaleString("en-IN")}`
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-[#899193]">
                            {formatDate(proc.updated_date)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={proc.is_active ? "Active" : "Inactive"}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(proc);
                              }}
                              className="p-1.5 text-[#899193] hover:text-[#0088B1] hover:bg-[#E8F4F7] rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <ActionMenu
                              id={proc.id}
                              openMenuId={openMenuId}
                              setOpenMenuId={setOpenMenuId}
                              items={[
                                {
                                  label: proc.is_active
                                    ? "Make Inactive"
                                    : "Make Active",
                                  icon: proc.is_active ? (
                                    <ShieldMinus className="w-4 h-4 text-[#899193]" />
                                  ) : (
                                    <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                                  ),
                                  onClick: () => handleToggleActive(proc),
                                },
                                {
                                  label: "Delete",
                                  icon: <Trash2 className="w-4 h-4" />,
                                  onClick: () => setDeleteTarget(proc),
                                  className: "text-red-500 hover:bg-red-50",
                                },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalItems > ITEMS_PER_PAGE && (
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

          <div className="w-72 flex-shrink-0">
            {selectedProc ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-[61px]">
                <div className="h-32 bg-[#E8F4F7] flex items-center justify-center relative">
                  {selectedProc.image_url ? (
                    <img
                      src={selectedProc.image_url}
                      alt={selectedProc.name}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <Stethoscope className="w-10 h-10 text-[#0088B1] opacity-30" />
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge
                      status={selectedProc.is_active ? "Active" : "Inactive"}
                    />
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  <div>
                    <h4 className="text-[13px] font-semibold text-[#161D1F]">
                      {selectedProc.name}
                    </h4>
                    <p className="text-[11px] text-[#899193] mt-0.5 leading-relaxed line-clamp-3">
                      {selectedProc.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        icon: (
                          <IndianRupee className="w-3 h-3 text-[#0088B1]" />
                        ),
                        label: "Cost",
                        value:
                          selectedProc.min_cost || selectedProc.max_cost
                            ? `₹${Number(selectedProc.min_cost).toLocaleString("en-IN")}–${Number(selectedProc.max_cost).toLocaleString("en-IN")}`
                            : "N/A",
                      },
                      {
                        icon: <Clock className="w-3 h-3 text-[#0088B1]" />,
                        label: "Duration",
                        value: selectedProc.procedure_duration || "N/A",
                      },
                      {
                        icon: <BedDouble className="w-3 h-3 text-[#0088B1]" />,
                        label: "Hospital Stay",
                        value: selectedProc.stay_in_hospital || "N/A",
                      },
                      {
                        icon: <FileText className="w-3 h-3 text-[#0088B1]" />,
                        label: "Report",
                        value: selectedProc.report_time || "N/A",
                      },
                    ].map((stat, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          {stat.icon}
                          <span className="text-[10px] text-[#899193]">
                            {stat.label}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[#161D1F] truncate">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {selectedProc.included &&
                    selectedProc.included.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#161D1F] mb-1">
                          Included
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {selectedProc.included.slice(0, 4).map((item, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded"
                            >
                              {item}
                            </span>
                          ))}
                          {selectedProc.included.length > 4 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-[#899193] rounded">
                              +{selectedProc.included.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {selectedProc.pre_procedure_instructions &&
                    selectedProc.pre_procedure_instructions.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#161D1F] mb-1">
                          Pre-Procedure Checklist
                        </p>
                        <ul className="space-y-0.5">
                          {selectedProc.pre_procedure_instructions
                            .slice(0, 3)
                            .map((inst, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#0088B1] flex-shrink-0" />
                                <span className="text-[11px] text-[#161D1F] leading-relaxed">
                                  {inst}
                                </span>
                              </li>
                            ))}
                          {selectedProc.pre_procedure_instructions.length >
                            3 && (
                            <li className="text-[10px] text-[#899193] pl-2.5">
                              +
                              {selectedProc.pre_procedure_instructions.length -
                                3}{" "}
                              more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => handleEdit(selectedProc)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-[#0088B1] text-[#0088B1] text-[11px] rounded-lg hover:bg-[#E8F4F7] transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(selectedProc)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-red-200 text-red-500 text-[11px] rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-12 px-4 text-center">
                <Stethoscope className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-[12px] text-[#899193]">
                  Select a procedure to preview details
                </p>
              </div>
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
        contextDepartmentName={department.name}
        onSuccess={() => {
          setModalOpen(false);
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
