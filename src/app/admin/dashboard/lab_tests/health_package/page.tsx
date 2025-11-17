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

import { useAdminStore } from "@/app/store/adminStore";
import {
  searchHeathPackages,
  searchPathologyTests,
  deleteHealthPackage,
} from "../services/index";
import { HealthPackage, statics } from "./types";
import { PathologyTest } from "../pathology_tests/types";

interface HealthPackagesStats {
  totalTests: number;
  activeTests: number;
  totalCategories: number;
}

const HealthPackages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [tests, setTests] = useState<HealthPackage[]>([]);
  const [filteredTests, setFilteredTests] = useState<HealthPackage[]>([]);
  const [openDropdown, setOpenDropdown] = useState<null | "status">(null);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [testActionDropdown, setTestActionDropdown] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [showViewTestModal, setShowViewTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<HealthPackage | null>(null);
  const [editingTest, setEditingTest] = useState<HealthPackage | null>(null);
  const [testNamesMap, setTestNamesMap] = useState<Map<string, string>>(
    new Map()
  );
  const [statics, setStatics] = useState<statics | null>(null);

  const { token } = useAdminStore();

  const renderTestsIncluded = (testIds: string[], maxVisible: number = 3) => {
    const visibleTests = testIds.slice(0, maxVisible);
    const remainingCount = testIds.length - maxVisible;

    // Check if we're still loading test names
    const isLoadingNames = testIds.some((testId) => !testNamesMap.has(testId));

    if (isLoadingNames) {
      return (
        <div className="flex flex-wrap gap-1">
          {visibleTests.map((testId, index) => (
            <span
              key={testId}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-400 animate-pulse"
            >
              Loading...
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {visibleTests.map((testId, index) => (
          <span
            key={testId}
            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#E8F4F7] text-black"
          >
            {testNamesMap.get(testId) || `Test ${index + 1}`}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#E8F4F7] text-black">
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  };

  const statusOptions = ["All Status", "Active", "Inactive"];

  const generateStats = (): HealthPackagesStats => {
    const activePackages = tests.filter((p) => !p.is_deleted);
    const totalTests = activePackages.length;
    const activeTests = activePackages.filter((t) => t.is_active).length;
    const totalCategories = new Set(
      activePackages.map((test) => test.linked_test_ids?.length || 0)
    ).size;

    return {
      totalTests,
      activeTests,
      totalCategories,
    };
  };

  const stats = generateStats();

  const fetchTestNames = async (testIds: string[]) => {
    if (!token || testIds.length === 0) return;

    try {
      const payload = {
        start: null,
        max: 100,
        search_category: null,
        search: null,
        filter_sample_type_ids: null,
        filter_active: true,
        filter_featured: null,
        sort_by: "name",
        sort_order: "ASC" as const,
      };

      const response = await searchPathologyTests(payload, token);
      const newMap = new Map(testNamesMap);

      response.labTests.forEach((test: PathologyTest) => {
        if (testIds.includes(test.id)) {
          newMap.set(test.id, test.name);
        }
      });

      setTestNamesMap(newMap);
    } catch (error) {
      console.error("Error fetching test names:", error);
    }
  };

  const fetchHealthPackages = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const payload = {
        start: null,
        max: 200,
        filter_linked_test_ids: null,
        search: searchTerm || null,
        filter_featured: null,
        sort_by: "name",
        sort_order: "ASC" as const,
      };

      const response = await searchHeathPackages(payload, token);
      const healthPackages = response.healthpackages || [];
      const statics = response.statics;
      setStatics(statics);
      const activeHealthPackages = healthPackages.filter(
        (pkg: HealthPackage) => !pkg.is_deleted
      );

      console.log(activeHealthPackages, "active health packages");
      setTests(healthPackages);
      setFilteredTests(activeHealthPackages);

      const allTestIds = new Set<string>();
      activeHealthPackages.forEach((pkg: HealthPackage) => {
        if (pkg.linked_test_ids) {
          pkg.linked_test_ids.forEach((id) => allTestIds.add(id));
        }
      });

      if (allTestIds.size > 0) {
        fetchTestNames(Array.from(allTestIds));
      }
    } catch (error) {
      console.error("Error fetching health packages:", error);
      toast.error("Failed to load health packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHealthPackages();
    }
  }, [token]);

  useEffect(() => {
    let filtered = tests.filter((test) => !test.is_deleted);

    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "All Status") {
      filtered = filtered.filter((test) =>
        selectedStatus === "Active" ? test.is_active : !test.is_active
      );
    }

    setFilteredTests(filtered);
  }, [searchTerm, selectedStatus, tests]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const handleBulkDelete = async () => {
    if (selectedTests.length === 0 || !token) return;

    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>
              Are you sure you want to delete {selectedTests.length} selected
              health packages?
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
        const deletePromises = selectedTests.map((packageId) =>
          deleteHealthPackage(packageId, token)
        );

        await Promise.all(deletePromises);

        fetchHealthPackages();

        toast.success(
          `${selectedTests.length} health packages deleted successfully!`
        );
        setSelectedTests([]);
      } catch (error: any) {
        console.error("Error deleting health packages:", error);
        toast.error(error.message || "Failed to delete some health packages");
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

  const handleAddTest = (newTest: HealthPackage) => {
    setTests([...tests, newTest]);
    setFilteredTests([...tests.filter((test) => !test.is_deleted), newTest]);

    if (newTest.linked_test_ids && newTest.linked_test_ids.length > 0) {
      fetchTestNames(newTest.linked_test_ids);
    }

    toast.success("Health package added successfully!");
  };

  const handleUpdateTest = (updatedTest: HealthPackage) => {
    const updatedTests = tests.map((test) =>
      test.id === updatedTest.id ? updatedTest : test
    );
    setTests(updatedTests);
    setFilteredTests(updatedTests.filter((test) => !test.is_deleted));

    if (updatedTest.linked_test_ids && updatedTest.linked_test_ids.length > 0) {
      const newTestIds = updatedTest.linked_test_ids.filter(
        (id) => !testNamesMap.has(id)
      );
      if (newTestIds.length > 0) {
        fetchTestNames(newTestIds);
      }
    }

    toast.success("Health package updated successfully!");
  };
  const handleTestAction = async (action: string, test: HealthPackage) => {
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
              <div className="flex flex-col gap-2">
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
            await deleteHealthPackage(test.id, token);

            fetchHealthPackages();

            toast.success("Health package deleted successfully!");
          } catch (error: any) {
            console.error("Error deleting health package:", error);
            toast.error(error.message || "Failed to delete health package");
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
            Health Packages Management
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
              {loading ? "Loading..." : "New Package"}
            </button>
            {selectedTests.length > 0 && (
              <button
                onClick={handleBulkDelete}
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
            title="Total Packages"
            stats={statics?.total_health_packages}
            icon={<Settings className="w-5 h-5" />}
            color="text-blue-500"
          />
          <StatsCard
            title="Active Packages"
            stats={statics?.total_active_health_packages}
            icon={<Activity className="w-5 h-5" />}
            color="text-green-500"
          />
          <StatsCard
            title="Average Discount"
            stats={statics?.average_discount_percentage}
            icon={<Users className="w-5 h-5" />}
            color="text-purple-500"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by package name, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          {/* <div className="flex gap-3">
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
          </div> */}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Health Packages
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredTests.length} Packages
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
                    Package Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Tests Included
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Cost Price
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Discount Percentage
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
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                      {/* <div className="text-gray-500">Loading packages...</div> */}
                    </td>
                  </tr>
                ) : filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No packages found.</div>
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
                            <Droplets className="text-gray-500 w-4 h-4" />
                            <span className="text-xs text-gray-500">
                              ID: {test.id.slice(0, 6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {test.linked_test_ids &&
                        test.linked_test_ids.length > 0 ? (
                          renderTestsIncluded(test.linked_test_ids, 3)
                        ) : (
                          <span className="text-xs text-gray-500">
                            No tests included
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#161D1F]">
                        ₹{test.cost_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#161D1F]">
                        ₹{test.selling_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#161D1F]">
                        {test.discount_percentage}%
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
        onEdit={handleUpdateTest}
      />
    </div>
  );
};

export default HealthPackages;
