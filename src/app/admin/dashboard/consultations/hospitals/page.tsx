"use client";
import React, { useEffect, useState } from "react";
import { convertAPIToLocalHospital } from "./utils";
import { getHospitals, getEnumValues, deleteHospital } from "./services";
import {
  Search,
  ChevronDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
} from "lucide-react";
import AddHospitalModal from "./components/AddHospitalModal";
import HospitalDetailsModal from "./components/HospitalDetailsModal";
import { useAdminStore } from "@/app/store/adminStore";
import ConfirmationModal from "./components/ConfirmationModal";
import toast from "react-hot-toast";
import { Hospital } from "./types";

const Hospitals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedOperatingHours, setSelectedOperatingHours] = useState(
    "All Operating Hours"
  );
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [openDropdown, setOpenDropdown] = useState<
    null | "department" | "hours"
  >(null);
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedDepartments, setExpandedDepartments] = useState<string[]>([]);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(
    null
  );
  const { token } = useAdminStore();
  const operatingHoursOptions = [
    "All Operating Hours",
    "24/7 Emergency",
    "Regular Hours",
  ];

  useEffect(() => {
    const loadDepartmentOptions = async () => {
      if (!token) return;
      try {
        const departments = await getEnumValues("DOC_DEPARTMENT", token);
        setDepartmentOptions(departments.map((dept) => dept.value));
      } catch (error) {
        console.error("Error loading department options:", error);
        setDepartmentOptions([]);
      }
    };

    loadDepartmentOptions();
  }, [token]);

  const loadHospitals = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = {
        search_text: searchTerm || null,
        filter_department:
          selectedDepartment !== "All Departments"
            ? [selectedDepartment]
            : null,
        sort_by: "name",
        sort_order: "DESC",
      };

      const response = await getHospitals(params, token);
      console.log(response, "real");
      let convertedHospitals = response.hospitals.map(
        convertAPIToLocalHospital
      );

      if (selectedOperatingHours !== "All Operating Hours") {
        if (selectedOperatingHours === "24/7 Emergency") {
          convertedHospitals = convertedHospitals.filter(
            (hospital) => hospital.emergencyServices
          );
        } else if (selectedOperatingHours === "Regular Hours") {
          convertedHospitals = convertedHospitals.filter(
            (hospital) => !hospital.emergencyServices
          );
        }
      }

      setHospitals(convertedHospitals);
      setFilteredHospitals(convertedHospitals);
    } catch (error) {
      toast.error("Failed to load hospitals. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };
  console.log(hospitals, "main api");
  console.log(filteredHospitals, "hospitals new");
  useEffect(() => {
    loadHospitals();
  }, [searchTerm, selectedDepartment, selectedOperatingHours, token]);

  useEffect(() => {
    const loadDepartmentOptions = async () => {
      if (!token) return;
      try {
        const departments = await getEnumValues("DOC_DEPARTMENT", token);
        if (Array.isArray(departments)) {
          setDepartmentOptions(departments.map((dept) => dept.value));
        }
      } catch (error) {
        console.error("Error loading department options:", error);
        setDepartmentOptions([]);
      }
    };

    loadDepartmentOptions();
  }, [token]);

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    setOpenDropdown(null);
  };

  const handleOperatingHoursChange = (hours: string) => {
    setSelectedOperatingHours(hours);
    setOpenDropdown(null);
  };

  const handleSelectHospital = (hospitalId: string, checked: boolean) => {
    if (checked) {
      setSelectedHospitals([...selectedHospitals, hospitalId]);
    } else {
      setSelectedHospitals(selectedHospitals.filter((id) => id !== hospitalId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedHospitals(filteredHospitals.map((hospital) => hospital.id));
    } else {
      setSelectedHospitals([]);
    }
  };

  const toggleDepartmentExpansion = (hospitalId: string) => {
    setExpandedDepartments((prev) =>
      prev.includes(hospitalId)
        ? prev.filter((id) => id !== hospitalId)
        : [...prev, hospitalId]
    );
  };

  const handleAddHospital = async (hospitalData: Hospital) => {
    await loadHospitals();
    if (editingHospital) {
      setHospitals((prev) =>
        prev.map((h) =>
          h.id === editingHospital.id
            ? { ...hospitalData, id: editingHospital.id }
            : h
        )
      );
    } else {
      const newHospital = {
        ...hospitalData,
        id: `hospital-${Date.now()}`,
        created_by: "current-user-id",
        updated_by: "current-user-id",
      };
      setHospitals((prev) => [...prev, newHospital]);
    }
    setEditingHospital(null);
  };

  const handleEditHospital = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setShowAddHospitalModal(true);
  };

  const handleViewHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowAddHospitalModal(false);
    setEditingHospital(null);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedHospital(null);
  };

  const renderDepartments = (hospital: Hospital) => {
    const isExpanded = expandedDepartments.includes(hospital.id);
    const maxVisible = 4;
    const hiddenCount = hospital.departments.length - maxVisible;
    const departmentsToShow = isExpanded
      ? hospital.departments
      : hospital.departments.slice(0, maxVisible);

    return (
      <div className="flex flex-wrap gap-1">
        {departmentsToShow.map((dept, index) => (
          <span
            key={index}
            className="px-2 py-1 text-[8px] bg-[#E8F4F7] text-gray-700 rounded"
          >
            {dept}
          </span>
        ))}
        {hiddenCount > 0 && !isExpanded && (
          <button
            onClick={() => toggleDepartmentExpansion(hospital.id)}
            className="px-2 py-1 text-[8px] text-gray-500"
          >
            +{hiddenCount} More
          </button>
        )}
        {isExpanded && hospital.departments.length > maxVisible && (
          <button
            onClick={() => toggleDepartmentExpansion(hospital.id)}
            className="px-2 py-1 text-[8px] text-gray-500 rounded border border-gray-300"
          >
            View Less
          </button>
        )}
      </div>
    );
  };

  const renderOperatingHours = (hospital: Hospital) => {
    const mondayHours = hospital.operatingHours?.Monday;
    const tuesdayHours = hospital.operatingHours?.Tuesday;
    const wednesdayHours = hospital.operatingHours?.Wednesday;

    const formatTime = (time: string) => {
      if (!time) return "N/A";
      return time;
    };

    return (
      <div className="space-y-1">
        {mondayHours && (
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#161D1F]">Mon.</span>
            <span className="text-[#161d1f] bg-[#E8F4F7] p-0.5 rounded">
              {formatTime(mondayHours.startTime)} -{" "}
              {formatTime(mondayHours.endTime)}
            </span>
          </div>
        )}
        {tuesdayHours && (
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#161D1F]">Tue.</span>
            <span className="text-[#161d1f] bg-[#E8F4F7] p-0.5 rounded">
              {formatTime(tuesdayHours.startTime)} -{" "}
              {formatTime(tuesdayHours.endTime)}
            </span>
          </div>
        )}
        {wednesdayHours && (
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#161D1F]">Wed.</span>
            <span className="text-[#161d1f] bg-[#E8F4F7] p-0.5 rounded">
              {formatTime(wednesdayHours.startTime)} -{" "}
              {formatTime(wednesdayHours.endTime)}
            </span>
          </div>
        )}
      </div>
    );
  };

  const confirmDelete = async () => {
    if (!hospitalToDelete) {
      console.log("No hospital to delete");
      return;
    }

    console.log("Deleting hospital:", hospitalToDelete.name);

    try {
      await deleteHospital(hospitalToDelete.id, token);
      toast.success(`${hospitalToDelete.name} has been deleted successfully`);
      await loadHospitals();
      setShowConfirmModal(false);
      setHospitalToDelete(null);
    } catch (error: any) {
      console.error("Delete error:", error);

      if (
        error.message &&
        error.message.includes("active staff members associated")
      ) {
        const staffCount =
          error.message.match(/(\d+) active staff members?/)?.[1] || "some";
        toast.error(
          `Cannot delete ${
            hospitalToDelete.name
          } because it has ${staffCount} active staff member${
            staffCount === "1" ? "" : "s"
          }. Please remove or transfer the staff first.`
        );
      } else {
        toast.error(
          "Sorry, we couldn't delete the hospital. Please try again."
        );
      }
      setShowConfirmModal(false);
      setHospitalToDelete(null);
    }
  };

  const handleDeleteHospital = (hospital: Hospital) => {
    console.log("Setting hospital to delete:", hospital.name);
    setHospitalToDelete(hospital);
    setShowConfirmModal(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Hospital Management
          </h1>
          <button
            className="flex items-center text-[12px] gap-2 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
            onClick={() => setShowAddHospitalModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add New Hospital
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by hospital / Department name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-xs"
            />
          </div>

          {/* <div className="relative">
            <button
              onClick={() =>
                setOpenDropdown(
                  openDropdown === "department" ? null : "department"
                )
              }
              className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
            >
              {selectedDepartment}
              <ChevronDown className="w-4 h-4" />
            </button>
            {openDropdown === "department" && (
              <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <button
                  onClick={() => handleDepartmentChange("All Departments")}
                  className={`block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 ${
                    selectedDepartment === "All Departments"
                      ? "bg-blue-50 text-blue-600"
                      : "text-[#161D1F]"
                  }`}
                >
                  All Departments
                </button>
                {departmentOptions.map((department) => (
                  <button
                    key={department}
                    onClick={() => handleDepartmentChange(department)}
                    className={`block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 ${
                      selectedDepartment === department
                        ? "bg-blue-50 text-blue-600"
                        : "text-[#161D1F]"
                    }`}
                  >
                    {department}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "hours" ? null : "hours")
              }
              className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
            >
              {selectedOperatingHours}
              <ChevronDown className="w-4 h-4" />
            </button>
            {openDropdown === "hours" && (
              <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                {operatingHoursOptions.map((hours) => (
                  <button
                    key={hours}
                    onClick={() => handleOperatingHoursChange(hours)}
                    className={`block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 ${
                      selectedOperatingHours === hours
                        ? "bg-blue-50 text-blue-600"
                        : "text-[#161D1F]"
                    }`}
                  >
                    {hours}
                  </button>
                ))}
              </div>
            )}
          </div> */}
        </div>

        {/* Hospitals Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Hospitals
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredHospitals.length} Hospitals
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
                        selectedHospitals.length === filteredHospitals.length &&
                        filteredHospitals.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Hospitals Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider w-1/4">
                    Departments
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider w-1/6">
                    Operating Hours
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    {/* <div className="text-gray-500">Loading hospitals...</div> */}
                  </td>
                ) : filteredHospitals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No hospitals found.</div>
                    </td>
                  </tr>
                ) : (
                  filteredHospitals.map((hospital) => (
                    <tr key={hospital.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedHospitals.includes(hospital.id)}
                          onChange={(e) =>
                            handleSelectHospital(hospital.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-xs font-medium text-[#161D1F] mb-1">
                            {hospital.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {hospital.address?.line1},{" "}
                              {hospital.address?.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                            <Phone className="w-3 h-3" />
                            <span>{hospital.contact?.phone?.[0] || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {hospital.emergencyServices && (
                              <span className="px-2 py-1 text-[8px] text-red-600 rounded border border-red-200 bg-red-50">
                                24/7 Emergency
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderDepartments(hospital)}
                      </td>
                      <td className="px-6 py-4">
                        {renderOperatingHours(hospital)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-500"
                            onClick={() => handleViewHospital(hospital)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-blue-500"
                            onClick={() => handleEditHospital(hospital)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-red-400 hover:text-red-500"
                            onClick={() => handleDeleteHospital(hospital)}
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

      <AddHospitalModal
        isOpen={showAddHospitalModal}
        onClose={handleCloseModal}
        onAddHospital={handleAddHospital}
        editingHospital={editingHospital}
      />

      <HospitalDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        hospital={selectedHospital}
        onEdit={handleEditHospital}
      />
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          console.log("Modal closed");
          setShowConfirmModal(false);
          setHospitalToDelete(null);
        }}
        onConfirm={() => {
          console.log("Confirm button clicked");
          confirmDelete();
        }}
        title="Delete Hospital"
        message={
          hospitalToDelete
            ? `Are you sure you want to delete "${hospitalToDelete.name}"? This action cannot be undone and will permanently remove all hospital data.`
            : ""
        }
        confirmText="Delete Hospital"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Hospitals;
