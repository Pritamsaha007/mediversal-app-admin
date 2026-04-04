"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  Download,
  ClipboardPlus,
} from "lucide-react";
import AddStaffModal from "./components/AddStaffModal";
import ViewStaffModal from "./components/ViewStaffModal";
import { ApiStaff } from "./types";
import { fetchStaff, deleteStaff } from "./service";
import StatusBadge from "@/app/components/common/StatusBadge";
import Pagination from "@/app/components/common/pagination";
import { useStaffStore } from "./store/staffStore";
import toast from "react-hot-toast";

const StaffManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounceTimer, setSearchDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [selectedStatus] = useState("All Statuses");
  const [activeTab] = useState("All Staffs");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [staffActionDropdown, setStaffActionDropdown] = useState<number | null>(
    null,
  );
  const [viewStaff, setViewStaff] = useState<ApiStaff | null>(null);
  const [editStaff, setEditStaff] = useState<ApiStaff | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { staff, setStaff } = useStaffStore();
  const [filteredStaff, setFilteredStaff] = useState<ApiStaff[]>(staff);

  const fetchStaffData = async (forceRefresh = false) => {
    if (!forceRefresh && staff.length > 0) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetchStaff();
      if (response.success) {
        setStaff(response.staffs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffDataSilent = async () => {
    try {
      const response = await fetchStaff();
      if (response.success) {
        setStaff(response.staffs);
      }
    } catch (err) {
      console.error("Background sync failed:", err);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  useEffect(() => {
    let filtered = staff;

    if (searchTerm.trim()) {
      filtered = filtered.filter((staffItem) => {
        const matchesName =
          staffItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          false;
        const matchesSpecializations =
          staffItem.specializations && Array.isArray(staffItem.specializations)
            ? staffItem.specializations.some((dept) =>
                dept?.toLowerCase().includes(searchTerm.toLowerCase()),
              )
            : false;
        const matchesStatus =
          staffItem.availability_status
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) || false;
        return matchesName || matchesSpecializations || matchesStatus;
      });
    }

    if (selectedStatus !== "All Statuses") {
      filtered = filtered.filter(
        (staffItem) => staffItem.availability_status === selectedStatus,
      );
    }

    setFilteredStaff(filtered);
    setCurrentPage(0);
  }, [searchTerm, selectedStatus, staff]);

  const paginatedStaff = React.useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredStaff.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStaff, currentPage, itemsPerPage]);

  const hasMore = React.useMemo(() => {
    return (currentPage + 1) * itemsPerPage < filteredStaff.length;
  }, [filteredStaff, currentPage, itemsPerPage]);

  const totalItems = filteredStaff.length;

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetchStaff(term || undefined);
        if (response.success) setStaff(response.staffs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search staff");
      } finally {
        setLoading(false);
      }
    }, 500);

    setSearchDebounceTimer(timer);
  };

  const handleAddStaff = async (newStaff: ApiStaff) => {
    const optimisticStaff = {
      ...newStaff,
      id: newStaff.id || `staff-${Date.now()}`,
    };
    setStaff([...staff, optimisticStaff]);
    setIsModalOpen(false);
    toast.success("Staff member added successfully");
    fetchStaffDataSilent();
  };

  const handleUpdateStaff = async (updatedStaff: ApiStaff) => {
    const updatedList = staff.map((s) =>
      s.id === updatedStaff.id ? { ...s, ...updatedStaff } : s,
    );
    setStaff(updatedList);
    setEditStaff(null);
    toast.success("Staff member updated successfully");
    fetchStaffDataSilent();
  };

  const handleStaffAction = async (action: string, staffItem: ApiStaff) => {
    switch (action) {
      case "view":
        setViewStaff(staffItem);
        break;

      case "edit":
        setEditStaff(staffItem);
        break;

      case "delete":
        if (
          window.confirm(`Are you sure you want to delete ${staffItem.name}?`)
        ) {
          const previousStaff = [...staff];
          setStaff(staff.filter((s) => s.id !== staffItem.id));
          setSelectedStaff((prev) => prev.filter((id) => id !== staffItem.id));
          try {
            await deleteStaff(staffItem.id);
            fetchStaffDataSilent();
          } catch (error) {
            setStaff(previousStaff);
            setError(
              error instanceof Error ? error.message : "Failed to delete staff",
            );
          }
        }
        break;
    }
    setStaffActionDropdown(null);
  };

  const handleBulkDelete = async () => {
    if (selectedStaff.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedStaff.length} selected staff members?`,
      )
    ) {
      const previousStaff = [...staff];
      setStaff(staff.filter((s) => !selectedStaff.includes(s.id)));
      setSelectedStaff([]);
      try {
        await Promise.all(selectedStaff.map((staffId) => deleteStaff(staffId)));
        fetchStaffDataSilent();
      } catch (error) {
        setStaff(previousStaff);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to delete selected staff",
        );
      }
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-[10px] text-gray-600 ml-1">{rating}</span>
    </div>
  );

  const handleExport = () => {
    if (staff.length === 0) {
      alert("No staff to export");
      return;
    }
    const staffToExport =
      selectedStaff.length > 0
        ? staff.filter((s) => selectedStaff.includes(s.id))
        : filteredStaff;
    exportStaffToCSV(staffToExport);
  };

  const exportStaffToCSV = (staffData: ApiStaff[]) => {
    const headers = [
      "Staff ID",
      "Name",
      "Email",
      "Phone",
      "Position",
      "Experience",
      "Rating",
      "Status",
      "Departments",
      "Join Date",
    ];

    const csvContent = [
      headers.join(","),
      ...staffData.map((s) =>
        [
          s.id,
          `"${s.name || ""}"`,
          s.email || "N/A",
          s.mobile_number || "N/A",
          `"${s.role_name || ""}"`,
          s.experience_in_yrs || "0",
          s.rating || "0",
          s.availability_status || "N/A",
          `"${
            Array.isArray(s.specializations)
              ? s.specializations.join(", ")
              : "N/A"
          }"`,
          s.created_date?.split("T")[0] || "N/A",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `staff_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (hasMore) setCurrentPage((prev) => prev + 1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
        setStaffActionDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    };
  }, [searchDebounceTimer]);

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Staff Management
          </h1>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-[#F8F8F8] rounded-lg hover:bg-[#00729A] cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-3 h-3" />
              Add Staff
            </button>
            {selectedStaff.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 text-[12px] px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={loading}
              >
                <Trash2 className="w-3 h-3" />
                Delete ({selectedStaff.length})
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, department, or position"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              {selectedStaff.length > 0
                ? `Export Selected (${selectedStaff.length})`
                : "Export All"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              {activeTab}
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredStaff.length} Staff Members
              </span>
            </h3>
          </div>

          <div
            className="overflow-auto"
            style={{ maxHeight: "calc(100vh - 350px)", minHeight: "400px" }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider whitespace-nowrap bg-gray-100">
                    Staff Detail
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider whitespace-nowrap bg-gray-100">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider whitespace-nowrap bg-gray-100">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider whitespace-nowrap bg-gray-100">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider whitespace-nowrap bg-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="text-red-500 text-sm">Error: {error}</div>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-blue-500 hover:underline text-sm"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : paginatedStaff.length > 0 ? (
                  paginatedStaff.map((staffItem) => (
                    <tr key={staffItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start min-w-[200px]">
                          <div>
                            <div className="text-xs font-medium text-[#161D1F] mb-1">
                              {staffItem.name}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {staffItem.role_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] text-[#161D1F]">
                          {staffItem.experience_in_yrs} Years
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px]">
                        {renderStars(parseFloat(staffItem.rating))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px]">
                        <StatusBadge status={staffItem.availability_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStaffAction("view", staffItem)}
                            className="p-1 text-gray-500 hover:text-[#0088B1] cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStaffAction("edit", staffItem)}
                            className="p-1 text-gray-500 hover:text-[#0088B1] cursor-pointer"
                            title="Edit Staff"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleStaffAction("delete", staffItem)
                            }
                            className="p-1 text-gray-500 hover:text-red-500 cursor-pointer"
                            title="Delete Staff"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <ClipboardPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-gray-500 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No staff members found
                        </h3>
                        <p className="text-gray-500">
                          No staff members match your current criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredStaff.length > 0 && (
            <div className="border-t border-gray-200 bg-white">
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
          )}
        </div>
      </div>

      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStaff}
      />

      {viewStaff && (
        <ViewStaffModal
          staff={viewStaff}
          onClose={() => setViewStaff(null)}
          onEdit={() => {
            setViewStaff(null);
            setEditStaff(viewStaff);
          }}
        />
      )}

      {editStaff && (
        <AddStaffModal
          isOpen={true}
          onClose={() => setEditStaff(null)}
          onSubmit={handleUpdateStaff}
          initialData={editStaff}
        />
      )}
    </div>
  );
};

export default StaffManagement;
