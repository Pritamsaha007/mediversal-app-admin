"use client";
import React, { useEffect, useState } from "react";
import { generateTimeSlots } from "./utils";
import {
  Search,
  ChevronDown,
  Plus,
  Users,
  Globe,
  MapPin,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import AddDoctorModal from "./components/AddDoctorModal";
import DoctorDetailsModal from "./components/DoctorDetailsModal";
import {
  getDoctors,
  createOrUpdateDoctor,
  getAllEnumData,
  deleteDoctor,
} from "./services";
import {
  convertAPIDoctor,
  convertAvailabilityToSlots,
  convertSlotsToAvailability,
} from "./utils";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import { Doctor, EnumItem, GetDoctorsParams } from "./types";
import StatsCard from "@/app/components/common/StatsCard";

const StatusBadge: React.FC<{ isOnline: boolean; isInPerson: boolean }> = ({
  isOnline,
  isInPerson,
}) => {
  if (isOnline && isInPerson) {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center text-center justify-center px-2 py-1 rounded-lg text-xs font-medium bg-[#34C759] text-white">
          Online
        </span>
        <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-xs font-medium bg-[#2F80ED] text-white">
          In-Person
        </span>
      </div>
    );
  } else if (isOnline) {
    return (
      <span className="inline-flex items-center text-center justify-center px-2 py-1 rounded-lg text-xs font-medium bg-[#34C759] text-white">
        Online
      </span>
    );
  } else if (isInPerson) {
    return (
      <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-xs font-medium bg-[#2F80ED] text-white">
        In-Person
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Unavailable
      </span>
    );
  }
};

const Doctors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [openDropdown, setOpenDropdown] = useState<null | "status">(null);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSlots, setExpandedSlots] = useState<string[]>([]);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { token } = useAdminStore();

  const statusOptions = [
    "All Status",
    "Online",
    "In-Person",
    "Both",
    "Unavailable",
  ];
  const timeSlots = generateTimeSlots();
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  const loadDoctors = async () => {
    if (!token || enumData.days.length === 0) return;

    setLoading(true);
    try {
      const params: GetDoctorsParams = {
        search: searchTerm,
        status: selectedStatus,
      };

      const response = await getDoctors(params, token);
      const convertedDoctors = response.doctors.map((apiDoctor) => {
        const doctor = convertAPIDoctor(apiDoctor);

        const specialization = enumData.specializations.find(
          (s) => s.value === apiDoctor.specializations
        );
        const department = enumData.departments.find(
          (d) => d.value === apiDoctor.departments
        );

        doctor.specialization_id = specialization?.id || "";
        doctor.department_id = department?.id || "";

        const hospitalNamesMap: Record<string, string> = {};
        const hospitals =
          apiDoctor.hospital && Array.isArray(apiDoctor.hospital)
            ? apiDoctor.hospital
            : [];
        hospitals.forEach((h) => {
          if (h && h.id && h.name) {
            hospitalNamesMap[h.id] = h.name;
          }
        });
        doctor.hospitalNamesMap = hospitalNamesMap;

        doctor.hospitalNames = hospitals.map((h) => h.name).filter(Boolean);

        // Map language names to IDs
        doctor.languages_known = (apiDoctor.languages_known || [])
          .map((langName) => {
            const lang = enumData.languages.find((l) => l.value === langName);
            return lang?.id || "";
          })
          .filter(Boolean);

        // Convert doctor_slots to availability format
        if (
          apiDoctor.doctor_slots &&
          Array.isArray(apiDoctor.doctor_slots) &&
          apiDoctor.doctor_slots.length > 0
        ) {
          const dayNameToName: Record<string, string> = {};
          enumData.days.forEach((day) => {
            dayNameToName[day.value] = day.value;
          });

          doctor.availability = convertSlotsToAvailability(
            apiDoctor.doctor_slots.map((slot) => ({
              ...slot,
              day: slot.day || "", // Use day field from API
              day_id: slot.day_id || "",
            })),
            dayNameToName
          );
        }

        return doctor;
      });
      setDoctors(convertedDoctors);
    } catch (error) {
      console.error("Error loading doctors:", error);
    } finally {
      setLoading(false);
    }
  };
  const generateStats = () => {
    const totalDoctors = doctors.length;
    const availableOnline = doctors.filter((d) => d.is_available_online).length;
    const availableInPerson = doctors.filter(
      (d) => d.is_available_in_person
    ).length;
    const avgRating =
      doctors.length > 0
        ? doctors.reduce((acc, d) => acc + (d.rating ?? 0), 0) / doctors.length
        : 0;

    return {
      totalDoctors,
      availableOnline,
      availableInPerson,
      avgRating: avgRating.toFixed(1),
      onlinePercentage:
        totalDoctors > 0
          ? Math.round((availableOnline / totalDoctors) * 100)
          : 0,
      inPersonPercentage:
        totalDoctors > 0
          ? Math.round((availableInPerson / totalDoctors) * 100)
          : 0,
    };
  };

  const stats = generateStats();
  useEffect(() => {
    let filtered = [...doctors];
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doctor.specializations?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          )
      );
    }
    if (selectedStatus !== "All Status") {
      filtered = filtered.filter((doctor) => {
        switch (selectedStatus) {
          case "Online":
            return doctor.is_available_online && !doctor.is_available_in_person;
          case "In-Person":
            return doctor.is_available_in_person && !doctor.is_available_online;
          case "Both":
            return doctor.is_available_online && doctor.is_available_in_person;
          case "Unavailable":
            return (
              !doctor.is_available_online && !doctor.is_available_in_person
            );
          default:
            return true;
        }
      });
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, selectedStatus, doctors]);

  useEffect(() => {
    const loadEnumData = async () => {
      if (!token) return;

      try {
        const data = await getAllEnumData(token);
        setEnumData(data);
      } catch (error) {
        console.error("Error loading enum data:", error);
      }
    };

    loadEnumData();
  }, [token]);

  const [enumData, setEnumData] = useState<{
    departments: EnumItem[];
    specializations: EnumItem[];
    languages: EnumItem[];
    days: EnumItem[];
  }>({
    departments: [],
    specializations: [],
    languages: [],
    days: [],
  });

  useEffect(() => {
    if (
      enumData.days.length > 0 &&
      enumData.specializations.length > 0 &&
      enumData.languages.length > 0
    ) {
      loadDoctors();
    }
  }, [
    token,
    searchTerm,
    selectedStatus,
    enumData.days,
    enumData.specializations,
    enumData.languages,
  ]);

  const handleDeleteDoctor = async (doctor: Doctor) => {
    if (!token) return;

    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Dr. ${doctor.name}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      await deleteDoctor(doctor.id, token);
      toast.success("Doctor deleted successfully!");

      // Refresh the doctors list
      await loadDoctors();

      // Show success message (optional)
      alert(`Dr. ${doctor.name} has been successfully deleted.`);
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert(
        `Error deleting doctor: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderTimeSlots = (doctor: Doctor) => {
    const slots: string[] = [];

    // Convert availability to display format
    Object.entries(doctor.availability || {}).forEach(([day, timeSlots]) => {
      timeSlots.forEach((slot) => {
        if (slot.startTime && slot.endTime) {
          slots.push(`${slot.startTime}-${slot.endTime}`);
        }
      });
    });

    const isExpanded = expandedSlots.includes(doctor.id);
    const slotsToShow = isExpanded ? slots : slots.slice(0, 6);

    return (
      <div className="flex flex-wrap gap-2">
        {slotsToShow.map((slot, index) => (
          <span
            key={index}
            className="text-[#161d1f] bg-[#E8F4F7] p-0.5 rounded text-[10px]"
          >
            {slot}
          </span>
        ))}
        {slots.length > 6 && (
          <button
            onClick={() => toggleSlotExpansion(doctor.id)}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded border flex items-center gap-1"
          >
            {isExpanded ? "view less" : "view more"}
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const handleSelectDoctor = (doctorId: string, checked: boolean) => {
    if (checked) {
      setSelectedDoctors([...selectedDoctors, doctorId]);
    } else {
      setSelectedDoctors(selectedDoctors.filter((id) => id !== doctorId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDoctors(filteredDoctors.map((doctor) => doctor.id));
    } else {
      setSelectedDoctors([]);
    }
  };
  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDoctor(null);
  };

  const toggleSlotExpansion = (doctorId: string) => {
    setExpandedSlots((prev) =>
      prev.includes(doctorId)
        ? prev.filter((id) => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const handleAddDoctor = async (doctorData: Doctor) => {
    try {
      // Create mapping from day names to IDs
      const dayNameToId: Record<string, string> = {};
      enumData.days.forEach((day) => {
        dayNameToId[day.value] = day.id;
      });

      const hasInvalidDays = Object.keys(doctorData.availability).some(
        (dayName) =>
          doctorData.availability[dayName].length > 0 && !dayNameToId[dayName]
      );

      if (hasInvalidDays) {
        console.error("Invalid day mappings found");
        alert("Error: Invalid day configuration. Please try again.");
        return;
      }

      const doctorSlots = convertAvailabilityToSlots(
        doctorData.availability,
        dayNameToId
      );

      const requestData = {
        id: editingDoctor ? editingDoctor.id : undefined,
        name: doctorData.name,
        mobile_number: doctorData.mobile_number,
        specialization_id: doctorData.specialization_id,
        department_id: doctorData.department_id,
        experience_in_yrs: doctorData.experience_in_yrs,
        consultation_price: doctorData.consultation_price,
        about: doctorData.about,
        qualifications: doctorData.qualifications,
        languages_known: doctorData.languages_known,
        hospitals_id: doctorData.hospitals_id,
        is_available_online: doctorData.is_available_online,
        is_available_in_person: doctorData.is_available_in_person,
        mci: doctorData.mci,
        nmc: doctorData.nmc,
        state_registration: doctorData.state_registration,
        is_available: doctorData.is_available,
        doctor_slots: doctorSlots,
        profile_image_url:
          doctorData.profile_image_url instanceof File
            ? null
            : doctorData.profile_image_url || null,
      };

      console.log("Submitting doctor data:", requestData);

      await createOrUpdateDoctor(requestData, token!);

      await loadDoctors();

      // Close modal
      setShowAddDoctorModal(false);
    } catch (error) {
      console.error("Error saving doctor:", error);
      alert(
        `Error saving doctor: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    setEditingDoctor(null);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setShowAddDoctorModal(true);
  };

  const handleCloseModal = () => {
    setShowAddDoctorModal(false);
    setEditingDoctor(null);
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Our Doctors
          </h1>
          <button
            className="flex items-center text-[12px] gap-2 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 cursor-pointer transition-colors"
            onClick={() => setShowAddDoctorModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add New Doctor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Total Doctors"
            stats={stats.totalDoctors}
            subtitle={`Average rating - ${stats.avgRating}`}
            icon={<Users className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
          <StatsCard
            title="Available Online"
            stats={stats.availableOnline}
            subtitle={`${stats.onlinePercentage}% of total doctors`}
            icon={<Globe className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
          <StatsCard
            title="Available In-Person"
            stats={stats.availableInPerson}
            subtitle={`${stats.inPersonPercentage}% of total doctors`}
            icon={<MapPin className="w-5 h-5" />}
            color="text-[#0088B1]"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          {/* <div className="relative">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "status" ? null : "status")
              }
              className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
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
                    className={`block w-full px-4 py-2 text-xs text-left hover:bg-gray-100 ${
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
          </div> */}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Doctors
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredDoctors.length} People
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
                        selectedDoctors.length === filteredDoctors.length &&
                        filteredDoctors.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Doctor Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Available Slots
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Availability Status
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                      {/* <div className="text-gray-500">Loading doctors...</div> */}
                    </td>
                  </tr>
                ) : filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No doctors found.</div>
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedDoctors.includes(doctor.id)}
                          onChange={(e) =>
                            handleSelectDoctor(doctor.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-xs font-medium text-[#161D1F] mb-1">
                            {doctor.name}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {doctor.specializations}
                          </div>

                          {doctor.hospitalNames &&
                            doctor.hospitalNames.length > 0 && (
                              <div className="text-xs text-gray-500 mb-2">
                                <span className="font-medium">Hospitals: </span>
                                {doctor.hospitalNames.join(", ")}
                              </div>
                            )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="px-2 py-1 text-[8px] text-[#0088B1] rounded border border-[#0088B1] hover:bg-[#0088B1] hover:text-white transition-colors">
                              {doctor.experience_in_yrs} Years Exp.
                            </span>
                            <span className="px-2 py-1 text-[8px] text-[#9B51E0] rounded border border-[#9B51E0] hover:bg-[#9B51E0] hover:text-white transition-colors">
                              {doctor.rating} rating
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{renderTimeSlots(doctor)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          isOnline={doctor.is_available_online}
                          isInPerson={doctor.is_available_in_person}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            className="p-2 text-gray-400 hover:text-[#0088B1] cursor-pointer"
                            onClick={() => handleViewDoctor(doctor)}
                            title="View Doctor"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-[#0088B1] cursor-pointer"
                            onClick={() => handleEditDoctor(doctor)}
                            title="Edit Doctor"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-red-400 hover:text-red-500 cursor-pointer"
                            onClick={() => handleDeleteDoctor(doctor)}
                            disabled={loading}
                            title="Delete Doctor"
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
      <AddDoctorModal
        isOpen={showAddDoctorModal}
        onClose={handleCloseModal}
        onAddDoctor={handleAddDoctor}
        editingDoctor={editingDoctor}
        enumData={enumData}
      />
      <DoctorDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        doctor={selectedDoctor}
        onEdit={handleEditDoctor}
        enumData={{
          departments: [],
          specializations: [],
          languages: [],
          days: [],
        }}
      />
    </div>
  );
};

export default Doctors;
