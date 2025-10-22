"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Users,
  Activity,
  Droplet,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  Phone,
  X,
} from "lucide-react";
import StatsCard from "../../home-care/components/StatsCard";
import StatusBadge from "../../home-care/components/StatusBadge";
import toast from "react-hot-toast";
import { AddPhlebotomistModal } from "./components/AddStaff";
import { PhlebotomistType, Schedule } from "./type/index";
import ViewPhlebotomistModal from "./components/ViewStaff";
interface PhlebotomistStats {
  totalPhlebotomists: number;
  activePhlebotomists: number;
  averageSamples: number;
  averageExperience: string;
}

const PhlebotomistManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Phlebotomist");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [phlebotomists, setPhlebotomists] = useState<PhlebotomistType[]>([]);
  const [filteredPhlebotomists, setFilteredPhlebotomists] = useState<
    PhlebotomistType[]
  >([]);
  const [openDropdown, setOpenDropdown] = useState<
    null | "filter" | "location"
  >(null);
  const [selectedPhlebotomists, setSelectedPhlebotomists] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [expandedSchedules, setExpandedSchedules] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhlebotomist, setEditingPhlebotomist] =
    useState<PhlebotomistType | null>(null);
  const [viewingPhlebotomist, setViewingPhlebotomist] =
    useState<PhlebotomistType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const dummyPhlebotomists: PhlebotomistType[] = [
    {
      id: "1",
      name: "Rajesh Sharma",
      email: "rajesh.sharma@example.com",
      phone: "+91 9876543210",
      specialization: "General Collection",
      targetGroup: "Senior Citizens",
      licenseNo: "LP0006789",
      experience: "4 yrs. exp.",
      serviceArea: "North Zone",
      serviceCityTown: "Delhi",
      joiningDate: "15/03/2021",
      rating: "4.5",
      certifications: ["Home Collection Certified"],
      schedules: [
        { startTime: "9:00 AM", endTime: "10:00 AM" },
        { startTime: "10:00 AM", endTime: "11:00 AM" },
        { startTime: "11:00 AM", endTime: "12:00 AM" },
      ],
      samplesCollected: 76,
      activeOrders: 5,
      completedOrders: 120,
      status: "Active",
      location: "North Zone",
      isActivePhlebo: true,
      isHomeCertified: true,
    },
  ];

  const filterOptions = ["All Phlebotomist", "Active", "Inactive"];
  const locationOptions = [
    "All Locations",
    "North Zone",
    "South Zone",
    "East Zone",
    "West Zone",
    "Central Zone",
  ];

  const generateStats = (): PhlebotomistStats => {
    const totalPhlebotomists = phlebotomists.length;
    const activePhlebotomists = phlebotomists.filter(
      (p) => p.status === "Active"
    ).length;
    const averageSamples = Math.round(
      phlebotomists.reduce((sum, p) => sum + p.samplesCollected, 0) /
        (totalPhlebotomists || 1)
    );
    const avgExp =
      phlebotomists.reduce((sum, p) => {
        const years = parseInt(p.experience);
        return sum + (isNaN(years) ? 0 : years);
      }, 0) / (totalPhlebotomists || 1);

    return {
      totalPhlebotomists,
      activePhlebotomists,
      averageSamples,
      averageExperience: `${Math.round(avgExp)} Yrs.`,
    };
  };

  const stats = generateStats();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPhlebotomists(dummyPhlebotomists);
      setFilteredPhlebotomists(dummyPhlebotomists);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = phlebotomists;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.licenseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilter !== "All Phlebotomist") {
      filtered = filtered.filter((p) => p.status === selectedFilter);
    }

    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter((p) => p.location === selectedLocation);
    }

    setFilteredPhlebotomists(filtered);
  }, [searchTerm, selectedFilter, selectedLocation, phlebotomists]);

  const handleSelectPhlebotomist = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPhlebotomists([...selectedPhlebotomists, id]);
    } else {
      setSelectedPhlebotomists(
        selectedPhlebotomists.filter((pid) => pid !== id)
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPhlebotomists(filteredPhlebotomists.map((p) => p.id));
    } else {
      setSelectedPhlebotomists([]);
    }
  };

  const toggleScheduleExpand = (id: string) => {
    if (expandedSchedules.includes(id)) {
      setExpandedSchedules(expandedSchedules.filter((eid) => eid !== id));
    } else {
      setExpandedSchedules([...expandedSchedules, id]);
    }
  };

  const renderSchedules = (schedules: Schedule[], phlebotomistId: string) => {
    const isExpanded = expandedSchedules.includes(phlebotomistId);
    const visibleSchedules = isExpanded ? schedules : schedules.slice(0, 2);
    const hasMore = schedules.length > 2;

    return (
      <div className="flex flex-col gap-2">
        {visibleSchedules.map((schedule, index) => (
          <div key={index} className="flex gap-2">
            <span className="px-3 py-1.5 rounded-md text-[10px] bg-[#E8F4F7] text-[#0088B1]">
              {schedule.startTime} - {schedule.endTime}
            </span>
          </div>
        ))}
        {hasMore && !isExpanded && (
          <button
            onClick={() => toggleScheduleExpand(phlebotomistId)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            view more <ChevronDown className="w-3 h-3" />
          </button>
        )}
        {isExpanded && hasMore && (
          <button
            onClick={() => toggleScheduleExpand(phlebotomistId)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            view less
          </button>
        )}
      </div>
    );
  };

  const handleAddPhlebotomist = (
    newPhlebotomist: Omit<PhlebotomistType, "id">
  ) => {
    const phlebotomistWithId: PhlebotomistType = {
      ...newPhlebotomist,
      id: (phlebotomists.length + 1).toString(),
    };
    setPhlebotomists([...phlebotomists, phlebotomistWithId]);
    toast.success("Phlebotomist added successfully");
  };

  const handleUpdatePhlebotomist = (updatedPhlebotomist: PhlebotomistType) => {
    setPhlebotomists(
      phlebotomists.map((p) =>
        p.id === updatedPhlebotomist.id ? updatedPhlebotomist : p
      )
    );
    toast.success("Phlebotomist updated successfully");
  };

  const handleEdit = (phlebotomist: PhlebotomistType) => {
    setEditingPhlebotomist(phlebotomist);
    setIsModalOpen(true);
  };

  const handleView = (phlebotomist: PhlebotomistType) => {
    setViewingPhlebotomist(phlebotomist);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPhlebotomist(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingPhlebotomist(null);
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
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Phlebotomist Management
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg bg-[#0088B1] hover:bg-[#00729A] text-[#F8F8F8]`}
          >
            <Plus className="w-3 h-3" />
            Add New Phlebotomist
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <StatsCard
            title="Total Phlebotomists"
            stats={stats.totalPhlebotomists}
            icon={<Users className="w-5 h-5" />}
            color="text-blue-500"
          />
          <StatsCard
            title="Average Samples Collected"
            stats={stats.averageSamples}
            icon={<Droplet className="w-5 h-5" />}
            color="text-cyan-500"
          />
          <StatsCard
            title="Average Experience"
            stats={stats.averageExperience}
            icon={<Activity className="w-5 h-5" />}
            color="text-blue-400"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by Phlebotomist name, License No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50">
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </button>
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "filter" ? null : "filter")
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedFilter}
                <ChevronDown className="w-5 h-5" />
              </button>
              {openDropdown === "filter" && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setSelectedFilter(filter);
                        setOpenDropdown(null);
                      }}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                        selectedFilter === filter
                          ? "bg-blue-50 text-blue-600"
                          : "text-[#161D1F]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "location" ? null : "location"
                  )
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedLocation}
                <ChevronDown className="w-5 h-5" />
              </button>
              {openDropdown === "location" && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {locationOptions.map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSelectedLocation(location);
                        setOpenDropdown(null);
                      }}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                        selectedLocation === location
                          ? "bg-blue-50 text-blue-600"
                          : "text-[#161D1F]"
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Phlebotomists
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredPhlebotomists.length} Phlebotomists
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
                        selectedPhlebotomists.length ===
                          filteredPhlebotomists.length &&
                        filteredPhlebotomists.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Phlebotomist Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Today's Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Samples Collected
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        Loading phlebotomists...
                      </div>
                    </td>
                  </tr>
                ) : filteredPhlebotomists.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        No phlebotomists found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPhlebotomists.map((phlebotomist) => (
                    <tr key={phlebotomist.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedPhlebotomists.includes(
                            phlebotomist.id
                          )}
                          onChange={(e) =>
                            handleSelectPhlebotomist(
                              phlebotomist.id,
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs font-medium text-[#161D1F]">
                            {phlebotomist.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {phlebotomist.specialization}
                            {phlebotomist.targetGroup &&
                              ` | ${phlebotomist.targetGroup}`}
                          </div>
                          <div className="text-xs text-gray-400">
                            License No.: {phlebotomist.licenseNo}
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded text-xs border border-[#0088B1] text-[#0088B1]">
                              {phlebotomist.experience}
                            </span>
                            {phlebotomist.certifications.map((cert, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-xs border border-[#9B51E0] text-[#9B51E0]"
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderSchedules(
                          phlebotomist.schedules,
                          phlebotomist.id
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#161D1F]">
                        {phlebotomist.samplesCollected}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={phlebotomist.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleView(phlebotomist)}
                            className="p-1 text-gray-500 hover:text-blue-500"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(phlebotomist)}
                            className="p-1 text-gray-500 hover:text-blue-500"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-[#F44336] hover:text-red-500">
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

      {/* Add/Edit Modal */}
      <AddPhlebotomistModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddPhlebotomist={handleAddPhlebotomist}
        onUpdatePhlebotomist={handleUpdatePhlebotomist}
        editPhlebotomist={editingPhlebotomist}
      />

      {/* View Modal */}
      <ViewPhlebotomistModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        phlebotomist={viewingPhlebotomist}
      />
    </div>
  );
};

export default PhlebotomistManagement;
