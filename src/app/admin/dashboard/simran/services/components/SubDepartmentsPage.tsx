"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  ShieldMinus,
  ShieldCheck,
  Trash2,
  ChevronRight,
  Building2,
  Activity,
  Calendar,
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
import Breadcrumb from "@/app/components/ui/Breadcrumb";
import ActionMenu from "@/app/components/ui/ActionMenu";

const ITEMS_PER_PAGE = 20;

const SubDepartmentsPage: React.FC = () => {
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
        toast.error(err.message || "Failed to load sub-departments");
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
  };

  const handleToggleActive = async (dept: DepartmentAPI) => {
    if (!token) return;
    try {
      await toggleDepartmentActive(dept, token);
      toast.success(
        `Sub-department marked as ${!dept.is_active ? "Active" : "Inactive"}`,
      );
      loadDepartments(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Failed to update sub-department");
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
      toast.error(err.message || "Failed to delete sub-department");
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
          <Breadcrumb
            items={[
              { label: "Specialties", onClick: navigateToServices },
              { label: service.name },
            ]}
          />
          <button
            onClick={() => {
              setModalMode("add");
              setEditingDept(undefined);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Sub-Department
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-xl border border-[#E8F4F7] p-4 mb-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F4F7] flex items-center justify-center flex-shrink-0">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={service.name}
                className="w-12 h-12 rounded-xl object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <span className="text-[16px] font-bold text-[#0088B1]">
                {getInitials(service.name)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[14px] font-semibold text-[#161D1F]">
                {service.name}
              </h2>
              <StatusBadge status={service.is_active ? "Active" : "Inactive"} />
            </div>
            <p className="text-[12px] text-[#899193] mt-0.5 line-clamp-2">
              {service.description || "No description provided."}
            </p>
            {service.tags && service.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {service.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-[#899193] rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-[11px] text-[#C5C9CA] flex items-center gap-1 flex-shrink-0">
            <Building2 className="w-3.5 h-3.5" />
            {totalItems} Sub-Depts
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-[13px] font-semibold text-[#161D1F]">
            Sub-Departments
          </h3>
          <p className="text-[11px] text-[#899193]">
            Click a card to view its procedures
          </p>
        </div>

        {pageLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#0088B1]" />
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-[#E8F4F7] rounded-full flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 text-[#0088B1]" />
            </div>
            <p className="text-[14px] font-medium text-[#161D1F]">
              No sub-departments yet
            </p>
            <p className="text-[12px] text-[#899193] mt-1">
              Add sub-departments under{" "}
              <span className="font-medium text-[#0088B1]">{service.name}</span>
            </p>
            <button
              onClick={() => {
                setModalMode("add");
                setEditingDept(undefined);
                setModalOpen(true);
              }}
              className="mt-4 flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Sub-Department
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#0088B1] hover:shadow-md transition-all duration-200 group flex flex-col"
              >
                <div
                  className="h-1.5 cursor-pointer"
                  onClick={() => navigateToProcedures(dept)}
                />

                <div className="p-3 flex flex-col flex-1">
                  <div
                    className="flex items-start gap-2.5 mb-2 cursor-pointer"
                    onClick={() => navigateToProcedures(dept)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E8F4F7] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[11px] font-bold text-[#0088B1]">
                        {getInitials(dept.name)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[13px] font-semibold text-[#161D1F] group-hover:text-[#0088B1] transition-colors line-clamp-1">
                        {dept.name}
                      </h4>
                      <p className="text-[11px] text-[#899193] mt-0.5 line-clamp-2 leading-relaxed">
                        {dept.description || "No description provided."}
                      </p>
                    </div>
                    <StatusBadge
                      status={dept.is_active ? "Active" : "Inactive"}
                    />
                  </div>

                  {dept.symptoms && dept.symptoms.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] font-medium text-[#899193] mb-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Warning Signs
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {dept.symptoms.slice(0, 3).map((s, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded"
                          >
                            {s}
                          </span>
                        ))}
                        {dept.symptoms.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-[#899193] rounded">
                            +{dept.symptoms.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#C5C9CA] flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(dept.updated_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigateToProcedures(dept)}
                        className="flex items-center gap-1 text-[11px] text-[#0088B1] hover:bg-[#E8F4F7] px-2 py-1 rounded-lg transition-colors"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(dept);
                        }}
                        className="p-1.5 text-[#899193] hover:text-[#0088B1] hover:bg-[#E8F4F7] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <ActionMenu
                        id={dept.id}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        items={[
                          {
                            label: dept.is_active
                              ? "Make Inactive"
                              : "Make Active",
                            icon: dept.is_active ? (
                              <ShieldMinus className="w-4 h-4 text-[#899193]" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                            ),
                            onClick: () => handleToggleActive(dept),
                          },
                          {
                            label: "Delete",
                            icon: <Trash2 className="w-4 h-4" />,
                            onClick: () => setDeleteTarget(dept),
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
        initialTab="sub-department"
        initialDepartment={editingDept}
        contextServiceId={service.id}
        contextServiceName={service.name}
        onSuccess={() => {
          setModalOpen(false);
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

export default SubDepartmentsPage;
