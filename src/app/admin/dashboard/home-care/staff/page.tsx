"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
} from "lucide-react";
import AddStaffModal from "./components/AddStaffModal";
import ViewStaffModal from "./components/ViewStaffModal";
import { ApiStaff, Staff } from "./types";
import { fetchStaff, deleteStaff } from "./service";

const StaffManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounceTimer, setSearchDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [activeTab, setActiveTab] = useState("All Staffs");
  const [openDropdown, setOpenDropdown] = useState<
    null | "status" | "department"
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [staffActionDropdown, setStaffActionDropdown] = useState<number | null>(
    null
  );
  const [viewStaff, setViewStaff] = useState<Staff | null>(null);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAddStaff = async (newStaff: Staff) => {
    setStaffList((prev) => [...prev, newStaff]);
    try {
      const response = await fetchStaff();
      if (response.success) {
        const transformedStaff = response.staffs.map(transformApiStaff);
        setStaffList(transformedStaff);
      }
    } catch (error) {
      console.error("Error refreshing staff list:", error);
    }

    console.log("New staff added:", newStaff);
  };

  const transformApiStaff = (apiStaff: ApiStaff): Staff => {
    const totalExperience = `${apiStaff.experience_in_yrs} Years`;

    return {
      id: apiStaff.id,
      name: apiStaff.name,
      phone: apiStaff.mobile_number,
      experience: totalExperience,
      rating: parseFloat(apiStaff.rating) || 0,
      status: apiStaff.availability_status,
      departments: apiStaff.specializations,
      position: apiStaff.role_name,
      email: apiStaff.email,
      certifications: apiStaff.certifications,
      address: "",
      joinDate: new Date().toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    const loadStaff = async () => {
      try {
        setLoading(true);
        const response = await fetchStaff();
        if (response.success) {
          const transformedStaff = response.staffs.map(transformApiStaff);
          setStaffList(transformedStaff);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load staff");
        console.error("Error loading staff:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, []);

  const handleUpdateStaff = async (updatedStaff: Staff) => {
    setStaffList((prev) =>
      prev.map((staff) => (staff.id === updatedStaff.id ? updatedStaff : staff))
    );

    try {
      const response = await fetchStaff();
      if (response.success) {
        const transformedStaff = response.staffs.map(transformApiStaff);
        setStaffList(transformedStaff);
      }
    } catch (error) {
      console.error("Error refreshing staff list:", error);
    }

    setEditStaff(null);
    console.log("Staff updated:", updatedStaff);
  };

  const [filteredStaff, setFilteredStaff] = useState<Staff[]>(staffList);

  const statusOptions = ["All Statuses", "Available", "Not available"];

  // Filter staff based on search and filters
  useEffect(() => {
    let filtered = staffList;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (staff) =>
          staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.departments.some((dept) =>
            dept.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          staff.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "All Statuses") {
      filtered = filtered.filter((staff) => staff.status === selectedStatus);
    }

    setFilteredStaff(filtered);
  }, [searchTerm, selectedStatus, staffList]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetchStaff(searchTerm || undefined);
        if (response.success) {
          const transformedStaff = response.staffs.map(transformApiStaff);
          setStaffList(transformedStaff);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search staff");
      } finally {
        setLoading(false);
      }
    }, 500);

    setSearchDebounceTimer(timer);
  };
  const handleSelectStaff = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaff([...selectedStaff, staffId]);
    } else {
      setSelectedStaff(selectedStaff.filter((id) => id !== staffId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStaff(filteredStaff.map((staff) => staff.id));
    } else {
      setSelectedStaff([]);
    }
  };
  const handleStaffAction = async (action: string, staff: Staff) => {
    switch (action) {
      case "view":
        setViewStaff(staff);
        break;
      case "edit":
        setEditStaff(staff);
        break;
      case "delete":
        if (window.confirm(`Are you sure you want to delete ${staff.name}?`)) {
          try {
            setLoading(true);
            await deleteStaff(staff.id);

            // Remove from local state
            setStaffList((prev) => prev.filter((s) => s.id !== staff.id));

            // Also remove from selected staff if it was selected
            setSelectedStaff((prev) => prev.filter((id) => id !== staff.id));

            console.log("Staff deleted successfully:", staff.name);
          } catch (error) {
            console.error("Error deleting staff:", error);
            setError(
              error instanceof Error ? error.message : "Failed to delete staff"
            );
          } finally {
            setLoading(false);
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
        `Are you sure you want to delete ${selectedStaff.length} selected staff members?`
      )
    ) {
      try {
        setLoading(true);

        // Delete all selected staff
        await Promise.all(selectedStaff.map((staffId) => deleteStaff(staffId)));

        // Remove from local state
        setStaffList((prev) =>
          prev.filter((staff) => !selectedStaff.includes(staff.id))
        );
        setSelectedStaff([]);

        console.log("Bulk delete completed successfully");
      } catch (error) {
        console.error("Error in bulk delete:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to delete selected staff"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStars = (rating: number) => {
    return (
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
        <span className="text-[10px] text-gray-600 ml-1 ">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      Available: "bg-green-100 text-green-800",
      "Not available": "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full text-[10px] ${
          statusColors[status as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const getDepartmentChip = (department: string) => {
    return (
      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full mr-1 mb-1 bg-gray-100 text-gray-800 text-[10px]">
        {department}
      </span>
    );
  };

  // Add to the existing useEffect with cleanup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
        setOpenDropdown(null);
        setStaffActionDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Add this cleanup for search timer
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]); // Add searchDebounceTimer to dependencies

  // Enhanced pagination component with items per page selector

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Staff Management
          </h1>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-[#F8F8F8] rounded-lg hover:bg-[#00729A]"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-3 h-3" />
              Add Staff
            </button>
            {/* Add this after the "Add Staff" button in your header */}
            {selectedStaff.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 text-[12px] px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={loading}
              >
                <Trash2 className="w-3 h-3" />
                Delete Selected ({selectedStaff.length})
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by name, department, or position"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          {/* <div className="flex gap-3">
           
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "status" ? null : "status")
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedStatus}
                <ChevronDown className="w-4 h-4" />
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
          </div> */}
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-screen max-h-screen flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              {activeTab}
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredStaff.length} Staff Members
              </span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full ">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                      checked={
                        selectedStaff.length === filteredStaff.length &&
                        filteredStaff.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Staff Detail
                  </th>
                  {/* <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Address
                  </th> */}
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                      {/* <div className="text-gray-500 text-sm">
                        Loading staff...
                      </div> */}
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="text-red-500 text-sm">Error: {error}</div>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-blue-500 hover:underline text-sm"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : filteredStaff.length > 0 ? (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedStaff.includes(staff.id)}
                          onChange={(e) =>
                            handleSelectStaff(staff.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="ml-4">
                            <div className="text-xs font-medium text-[#161D1F] mb-1">
                              {staff.name}
                            </div>
                            {/* Department Chips */}
                            {/* <div className="flex flex-wrap">
                              {staff.departments.map((department, index) => (
                                <span key={index}>
                                  {getDepartmentChip(department)}
                                </span>
                              ))}
                            </div> */}
                          </div>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4">
                        <div className="text-[10px] text-[#161D1F] max-w-xs">
                          {staff.address}
                        </div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] text-[#161D1F]">
                          {staff.experience}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px]">
                        {renderStars(staff.rating)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px]">
                        {getStatusBadge(staff.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStaffAction("view", staff)}
                            className="p-1 text-gray-500 hover:text-blue-500"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStaffAction("edit", staff)}
                            className="p-1 text-gray-500 hover:text-green-500"
                            title="Edit Staff"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStaffAction("delete", staff)}
                            className="p-1 text-gray-500 hover:text-red-500"
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
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="text-gray-500 text-sm">
                        {staffList.length === 0
                          ? "No staff members found. Click 'Add Staff' to add your first staff member."
                          : "No staff members match your search criteria."}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
