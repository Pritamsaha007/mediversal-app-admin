import React, { useState, useEffect } from "react";
import { X, Search, Star, Loader2 } from "lucide-react";
import { mockStaffs, staffCategories, Staff, AssignedStaff } from "./staffData";
import {
  getHomecareStaff,
  StaffResponse,
  assignStaffToOrder,
  AssignStaffPayload,
} from "./services/api/orderServices";
import { useAdminStore } from "../../../../store/adminStore";
import toast from "react-hot-toast";

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  currentAssignedStaff?: AssignedStaff[];
  onUpdateStaff: (bookingId: string, staffs: AssignedStaff[]) => void;
}

const AssignStaffModal: React.FC<AssignStaffModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  currentAssignedStaff = [],
  onUpdateStaff,
}) => {
  const { token } = useAdminStore();
  const [selectedCategory, setSelectedCategory] = useState("All Staffs");
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedStaffs, setAssignedStaffs] =
    useState<AssignedStaff[]>(currentAssignedStaff);
  const [apiStaffs, setApiStaffs] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStaffData();
    }
  }, [isOpen, token]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getHomecareStaff({}, token);
      if (response.success) {
        setApiStaffs(response.staffs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };
  const mapApiStatusToLocalStatus = (
    apiStatus: string
  ): "Available" | "On Duty" | "Busy" => {
    switch (apiStatus.toLowerCase()) {
      case "available":
        return "Available";
      case "on duty":
      case "onduty":
        return "On Duty";
      case "busy":
      case "occupied":
        return "Busy";
      default:
        return "Available"; // Default fallback
    }
  };

  const convertApiStaffToStaff = (apiStaff: StaffResponse) => ({
    id: apiStaff.id,
    name: apiStaff.name,
    role: apiStaff.role_name,
    initials: apiStaff.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase(),
    experience: apiStaff.experience_in_yrs,
    rating: parseFloat(apiStaff.rating),
    status: mapApiStatusToLocalStatus(apiStaff.availability_status),
    category: apiStaff.role_name, // You might want to map this differently
  });

  if (!isOpen) return null;

  const filteredStaffs = apiStaffs
    .filter((apiStaff) => {
      const staff = convertApiStaffToStaff(apiStaff);
      const matchesCategory =
        selectedCategory === "All Staffs" ||
        staff.category === selectedCategory;
      const matchesSearch = staff.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .map(convertApiStaffToStaff);
  const staffCategories = [
    "All Staffs",
    ...Array.from(new Set(apiStaffs.map((staff) => staff.role_name))),
  ];

  const handleAssignStaff = (staff: Staff) => {
    if (staff.status === "Busy") return;

    const newAssignedStaff: AssignedStaff = {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      initials: staff.initials,
      experience: staff.experience,
      rating: staff.rating,
      status: staff.status as "Available" | "On Duty",
    };

    const isAlreadyAssigned = assignedStaffs.some((s) => s.id === staff.id);
    if (!isAlreadyAssigned) {
      setAssignedStaffs([...assignedStaffs, newAssignedStaff]);
    }
  };

  const handleRemoveStaff = (staffId: string) => {
    setAssignedStaffs(assignedStaffs.filter((staff) => staff.id !== staffId));
  };

  const handleUpdateAssignedStaff = async () => {
    if (assignedStaffs.length === 0) {
      toast.error("Please select at least one staff member");
      return;
    }

    setIsAssigning(true);

    try {
      // For now, assign only the first selected staff
      // You can modify this to handle multiple staff assignments
      const firstStaff = assignedStaffs[0];

      const payload: AssignStaffPayload = {
        orderId: "769b3c0c-8e57-4a24-9008-138b76b261f0", // This should be the actual order ID
        staffId: firstStaff.id,
        userId: null,
      };

      await assignStaffToOrder(payload, token);

      // Show success message
      toast.success(
        `Staff ${firstStaff.name} has been successfully assigned to the order!`
      );

      // Update parent component
      onUpdateStaff(bookingId, assignedStaffs);

      // Close modal
      onClose();
    } catch (error) {
      console.error("Error assigning staff:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to assign staff. Please try again."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "On Duty":
        return "bg-yellow-100 text-yellow-800";
      case "Busy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-[16px] font-medium text-[#161D1F]">
            Assign Staff
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-[#899193]" />
          </button>
        </div>

        {/* Order Info */}
        <div className="p-4 m-4 rounded-2xl bg-cyan-600 text-[#F8F8F8]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[16px]">{bookingId}</h3>
              <p className="text-[10px] opacity-90">John Doe • 15 Aug 2025</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#F8F8F8]">Rating & Review:</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px]">4.6 (420)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Staffs Section */}
        <div className="p-4 border-b">
          <h3 className="font-medium text-[12px] text-[#161D1F] mb-3">
            Assigned Staffs
          </h3>
          {assignedStaffs.length > 0 ? (
            <div className="space-y-2">
              {assignedStaffs.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#E8F4F7] text-[#161D1F] rounded-full text-[12px] flex items-center justify-center font-semibold">
                      {staff.initials}
                    </div>
                    <div>
                      <p className="font-medium text-[#161D1F] text-[12px]">
                        {staff.name}
                      </p>
                      <p className="text-xs text-[#161D1F]">{staff.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center margin- gap-4">
                    <div className="text-right">
                      <p className="text-xs text-[#161D1F]">
                        Experience: {staff.experience} Years
                      </p>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-[#161D1F]">Rating:</p>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-[#161D1F]">
                          {staff.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[12px] font-medium ${getStatusColor(
                          staff.status
                        )}`}
                      >
                        {staff.status}
                      </span>
                      <button
                        onClick={() => handleRemoveStaff(staff.id)}
                        className="text-red-500 hover:text-red-700 text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-[#161D1F]">No staff assigned</p>
          )}
        </div>

        {/* All Staffs Section */}
        <div className="p-4">
          <h3 className="font-semibold text-[#161D1F] text-[12px] mb-3">
            All Staffs
          </h3>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
               focus:outline-none focus:ring-2 focus:ring-cyan-500 
               placeholder-[#B0B6B8] text-[#161D1F]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {staffCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Staff List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                <span className="ml-2 text-sm text-gray-600">
                  Loading staff...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchStaffData}
                  className="mt-2 text-sm text-cyan-600 hover:text-cyan-700"
                >
                  Try again
                </button>
              </div>
            ) : filteredStaffs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">No staff found</p>
              </div>
            ) : (
              filteredStaffs.map((staff) => {
                const isAssigned = assignedStaffs.some(
                  (s) => s.id === staff.id
                );
                return (
                  <div
                    key={staff.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      staff.status === "Busy"
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#E8F4F7] text-[12px] text-[#161D1F] rounded-full flex items-center justify-center font-semibold">
                        {staff.initials}
                      </div>
                      <div>
                        <p className="font-medium text-[#161D1F] text-[10px]">
                          {staff.name}
                        </p>
                        <p className="text-xs text-[#899193]">{staff.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-16">
                      <div className="text-right">
                        <p className="text-xs text-[#161D1F]">
                          Experience: {staff.experience} Years
                        </p>
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-[#161D1F]">Rating:</p>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-[#161D1F]">
                            {staff.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-16">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            staff.status
                          )}`}
                        >
                          {staff.status}
                        </span>
                        <button
                          onClick={() => handleAssignStaff(staff)}
                          disabled={staff.status === "Busy" || isAssigned}
                          className={`px-3 py-1 text-xs rounded ${
                            isAssigned
                              ? "bg-gray-300 text-[#161D1F] cursor-not-allowed"
                              : staff.status === "Busy"
                              ? "bg-gray-300 text-[#161D1F] cursor-not-allowed"
                              : "bg-cyan-600 text-white hover:bg-cyan-700"
                          }`}
                        >
                          {isAssigned ? "Assigned" : "Assign"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={handleUpdateAssignedStaff}
            disabled={isAssigning || assignedStaffs.length === 0}
            className={`justify-end text-[#F8F8F8] flex text-[10px] py-3 px-4 rounded-lg transition-colors font-medium ${
              isAssigning || assignedStaffs.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700"
            }`}
          >
            {isAssigning ? "Assigning..." : "Update Assigned Staff"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignStaffModal;
