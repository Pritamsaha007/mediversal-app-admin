"use client";
import React, { useEffect, useState } from "react";
import StatusBadge from "../../home-care/components/StatusBadge";
import StatsCard from "../../home-care/components/StatsCard";
import {
  Search,
  ChevronDown,
  Plus,
  Settings,
  Activity,
  Users,
  Eye,
  Edit,
  Trash2,
  Droplet,
  Droplets,
} from "lucide-react";
import toast from "react-hot-toast";
import { AddTestModal } from "./components/AddTest";
import { ViewTestModal } from "./components/ViewTest";
import { RadiologyTest } from "./types";

interface RadiologyStats {
  totalTests: number;
  activeTests: number;
  totalCategories: number;
}

const RadiologyTests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [tests, setTests] = useState<RadiologyTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<RadiologyTest[]>([]);
  const [openDropdown, setOpenDropdown] = useState<null | "status">(null);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [testActionDropdown, setTestActionDropdown] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [showViewTestModal, setShowViewTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<RadiologyTest | null>(null);
  const [editingTest, setEditingTest] = useState<RadiologyTest | null>(null);

  const dummyRadiologyTests: RadiologyTest[] = [
    {
      id: "60a12942-a71a-405c-af1c-caf474bd954a",
      name: "MRI Lumbo-Sacral Spine (LS)",
      description: "Measures overall health and detects disorders.",
      code: "CBC001",
      category_id: "1652e599-4880-461c-840c-15f3ea00de1d",
      sample_type_ids: ["f240088b-7ece-421d-b874-8c0562432fdc"],
      test_params: ["Hemoglobin", "WBC"],
      report_time_hrs: 24,
      cost_price: 100,
      selling_price: 150,
      preparation_instructions: ["Fast for 8 hours before test"],
      precautions: ["Avoid medication X before test"],
      is_fasting_reqd: true,
      in_person_visit_reqd: false,
      is_featured_lab_test: true,
      is_home_collection_available: true,
      is_active: true,
      image_url: "https://example.com/images/cbc_test.png",
      is_deleted: false,
      created_by: "3fc901f2-45f4-4ee6-a351-e05721be6522",
      updated_by: "3fc901f2-45f4-4ee6-a351-e05721be6522",
      modality_type_id: "81961494-7bcf-4f8d-88ed-9ffb70dcdf44",
      inspection_parts_ids: [
        "c562704c-4d1f-464d-8f2c-13f8dc813eb6",
        "e660835e-921f-45c0-ba88-7e7cb83edd05",
      ],
      related_lab_test_ids: ["b931a31d-6a03-4eff-ae60-8523b07df079"],
    },
  ];

  const statusOptions = ["All Status", "Active", "Inactive"];

  const generateStats = (): RadiologyStats => {
    const totalTests = tests.length;
    const activeTests = tests.filter((t) => t.is_active).length;
    const totalCategories = new Set(tests.map((test) => test.category_id)).size;

    return {
      totalTests,
      activeTests,
      totalCategories,
    };
  };
  const stats = generateStats();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTests(dummyRadiologyTests);
      setFilteredTests(dummyRadiologyTests);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = dummyRadiologyTests;

    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "All Status") {
      filtered = filtered.filter((test) =>
        selectedStatus === "Active" ? test.is_active : !test.is_active
      );
    }

    setFilteredTests(filtered);
  }, [searchTerm, selectedStatus]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const handleBulkDelete = async () => {
    if (selectedTests.length === 0) return;

    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>
              Are you sure you want to delete {selectedTests.length} selected
              tests?
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(true);
                }}
                className="px-3 py-1 bg-red-400 text-white rounded text-sm"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(false);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
        }
      );
    });

    if (confirmed) {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const updatedTests = tests.filter(
          (test) => !selectedTests.includes(test.id)
        );
        setTests(updatedTests);
        setFilteredTests(updatedTests);

        toast.success(`${selectedTests.length} tests deleted successfully!`);
        setSelectedTests([]);
      } catch (error: any) {
        console.error("Error deleting tests:", error);
        toast.error(error.message || "Failed to delete some tests");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectTest = (testId: string, checked: boolean) => {
    if (checked) {
      setSelectedTests([...selectedTests, testId]);
    } else {
      setSelectedTests(selectedTests.filter((id) => id !== testId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTests(filteredTests.map((test) => test.id));
    } else {
      setSelectedTests([]);
    }
  };

  const handleAddTest = (newTestData: Omit<RadiologyTest, "id">) => {
    const newTest: RadiologyTest = {
      ...newTestData,
      id: Date.now().toString(),
    };
    setTests([...tests, newTest]);
    setFilteredTests([...tests, newTest]);
    toast.success("Test added successfully!");
  };

  const handleUpdateTest = (updatedTest: RadiologyTest) => {
    const updatedTests = tests.map((test) =>
      test.id === updatedTest.id ? updatedTest : test
    );
    setTests(updatedTests);
    setFilteredTests(updatedTests);
    toast.success("Test updated successfully!");
  };

  const handleTestAction = async (action: string, test: RadiologyTest) => {
    setTestActionDropdown(null);

    switch (action) {
      case "view":
        setSelectedTest(test);
        setShowViewTestModal(true);
        break;
      case "edit":
        setEditingTest(test);
        setShowAddTestModal(true);
        break;
      case "delete":
        const confirmed = await new Promise<boolean>((resolve) => {
          const toastId = toast(
            (t) => (
              <div className="flex flex-col gap-2 ">
                <span>Are you sure you want to delete "{test.name}"?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      toast.dismiss(toastId);
                      resolve(true);
                    }}
                    className="px-3 py-1 bg-red-400 text-white rounded text-sm"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss(toastId);
                      resolve(false);
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ),
            {
              duration: Infinity,
            }
          );
        });

        if (confirmed) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const updatedTests = tests.filter((t) => t.id !== test.id);
            setTests(updatedTests);
            setFilteredTests(updatedTests);

            toast.success("Test deleted successfully!");
          } catch (error: any) {
            console.error("Error deleting test:", error);
            toast.error(error.message || "Failed to delete test");
          }
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
        setOpenDropdown(null);
        setTestActionDropdown(null);
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
            Radiology Tests Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddTestModal(true)}
              disabled={loading}
              className={`flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0088B1] hover:bg-[#00729A]"
              } text-[#F8F8F8]`}
            >
              <Plus className="w-3 h-3" />
              {loading ? "Loading..." : "New Test"}
            </button>
            {selectedTests.length > 0 && (
              <button
                onClick={() => handleBulkDelete()}
                disabled={loading}
                className={`flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-400 hover:bg-red-500"
                } text-[#F8F8F8]`}
              >
                <Trash2 className="w-3 h-3" />
                {loading ? "Deleting..." : `Delete (${selectedTests.length})`}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <StatsCard
            title="Total Tests"
            stats={stats.totalTests}
            icon={<Settings className="w-5 h-5" />}
            color="text-blue-500"
          />
          <StatsCard
            title="Active Tests"
            stats={stats.activeTests}
            icon={<Activity className="w-5 h-5" />}
            color="text-green-500"
          />
          <StatsCard
            title="Total Categories"
            stats={stats.totalCategories}
            icon={<Users className="w-5 h-5" />}
            color="text-purple-500"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by test name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "status" ? null : "status")
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedStatus}
                <ChevronDown className="w-5 h-5" />
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
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Radiology Tests
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredTests.length} Tests
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
                        selectedTests.length === filteredTests.length &&
                        filteredTests.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Test Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Test Code
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Cost Price
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Report Time
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
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500">Loading tests...</div>
                    </td>
                  </tr>
                ) : filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No tests found.</div>
                    </td>
                  </tr>
                ) : (
                  filteredTests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedTests.includes(test.id)}
                          onChange={(e) =>
                            handleSelectTest(test.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-xs font-medium text-[#161D1F] mb-1">
                            {test.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="text-gray-500 w-4 h-4" />
                            <span className="text-xs text-gray-500">
                              {test.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#161D1F]">
                        {test.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#161D1F]">
                        ₹{test.cost_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#161D1F]">
                        ₹{test.selling_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#161D1F]">
                        {test.report_time_hrs} hrs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={test.is_active ? "Active" : "Inactive"}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleTestAction("view", test)}
                            className="p-1 text-gray-500 hover:text-blue-500"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTestAction("edit", test)}
                            className="p-1 text-gray-500 hover:text-blue-500"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTestAction("delete", test)}
                            className="p-1 text-[#F44336] hover:text-red-500"
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

      <AddTestModal
        isOpen={showAddTestModal}
        onClose={() => {
          setShowAddTestModal(false);
          setEditingTest(null);
        }}
        onAddTest={handleAddTest}
        onUpdateTest={handleUpdateTest}
        editTest={editingTest}
      />

      <ViewTestModal
        isOpen={showViewTestModal}
        onClose={() => {
          setShowViewTestModal(false);
          setSelectedTest(null);
        }}
        test={selectedTest}
      />
    </div>
  );
};

export default RadiologyTests;
