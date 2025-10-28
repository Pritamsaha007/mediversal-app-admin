"use client";
import React, { useState, useEffect } from "react";
import { X, Edit, Link2 } from "lucide-react";
import toast from "react-hot-toast";

import { useAdminStore } from "@/app/store/adminStore";
import { searchPathologyTests, searchHeathPackages } from "../../services";
import { PathologyTest } from "../../pathology_tests/types";
import { ManageRelationshipsModal } from "./ManageRelationship";
import { HealthPackage } from "../types";

interface ViewTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: HealthPackage | null;
  onEdit?: (test: HealthPackage) => void;
}

export const ViewTestModal: React.FC<ViewTestModalProps> = ({
  isOpen,
  onClose,
  test,
  onEdit,
}) => {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [includedTests, setIncludedTests] = useState<PathologyTest[]>([]);
  const [relatedPackages, setRelatedPackages] = useState<HealthPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAdminStore();
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<HealthPackage | null>(
    null
  );

  const fetchDetails = async () => {
    if (!test) return;

    setLoading(true);
    try {
      if (test.linked_test_ids && test.linked_test_ids.length > 0) {
        const testsPayload = {
          start: 0,
          max: 100,
          search_category: null,
          search: null,
          filter_sample_type_ids: null,
          filter_active: true,
          filter_featured: null,
          sort_by: "name",
          sort_order: "ASC" as const,
        };

        const testsResponse = await searchPathologyTests(testsPayload, token);
        const filteredTests = testsResponse.labTests.filter(
          (labTest: PathologyTest) => test.linked_test_ids?.includes(labTest.id)
        );
        setIncludedTests(filteredTests);
      }

      if (
        test.related_health_package_ids &&
        test.related_health_package_ids.length > 0
      ) {
        const packagesPayload = {
          start: 0,
          max: 100,
          search: null,
          sort_by: "name",
          sort_order: "ASC" as const,
        };

        const packagesResponse = await searchHeathPackages(
          packagesPayload,
          token
        );
        const filteredPackages = packagesResponse.healthpackages.filter(
          (pkg: HealthPackage) =>
            test.related_health_package_ids?.includes(pkg.id)
        );
        setRelatedPackages(filteredPackages);
      } else {
        setRelatedPackages([]);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      toast.error("Failed to load package details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && test) {
      fetchDetails();
    }
  }, [isOpen, test]);

  const handleEdit = () => {
    if (onEdit && test) {
      onEdit(test);
    }
  };

  const handleManageRelationships = () => {
    setIsManageModalOpen(true);
  };
  const handleUpdatePackage = (updatedPackage: HealthPackage) => {
    setHealthPackages((prev) =>
      prev.map((pkg) => (pkg.id === updatedPackage.id ? updatedPackage : pkg))
    );

    if (selectedPackage && selectedPackage.id === updatedPackage.id) {
      setSelectedPackage(updatedPackage);
    }
  };

  if (!isOpen || !test) return null;

  const renderIncludedTests = (
    tests: PathologyTest[],
    maxVisible: number = 6
  ) => {
    const visibleTests = tests.slice(0, maxVisible);
    const remainingCount = tests.length - maxVisible;

    return (
      <div className="flex flex-wrap gap-2">
        {visibleTests.map((test) => (
          <span
            key={test.id}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white text-black border border-blue-200"
          >
            {test.name}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
            +{remainingCount} more tests
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-[16px] font-semibold text-[#161D1F]">
              Health Package Details
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-[#899193]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              <div>
                <h1 className="text-sm font-semibold text-[#161D1F] mb-3">
                  {test.name}
                </h1>

                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Tags:</p>
                  <div className="flex flex-row gap-2">
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-[12px] rounded border border-green-200">
                      {test.is_active ? "Active" : "Inactive"}
                    </span>
                    {test.is_popular && (
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 text-[12px] rounded border border-orange-200">
                        Popular
                      </span>
                    )}
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[12px] rounded border border-purple-200">
                      {test.related_health_package_ids?.length || 0} Related
                      Health Packages
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#161D1F] mb-2">
                  Package Description:
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {test.description || "No description provided"}
                </p>
              </div>

              <div className="border-t border-gray-200"></div>

              {includedTests.length > 0 && (
                <div>
                  <h3 className="text-[14px] font-semibold text-[#161D1F] mb-3">
                    Tests Included:
                  </h3>
                  <div className="rounded-lg border bg-[#E8F4F7] border-[#D3D7D8] p-4">
                    {renderIncludedTests(includedTests)}
                  </div>
                </div>
              )}

              {test.prepare_instructions &&
                test.prepare_instructions.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#161D1F] mb-3">
                      All Preparation Instructions:
                    </h3>
                    <div className="rounded-lg border border-[#D3D7D8] p-4">
                      <ul className="space-y-2">
                        {test.prepare_instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-xs text-gray-600 mt-0.5">
                              •
                            </span>
                            <span className="text-xs text-gray-600 flex-1">
                              {instruction}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              <div className="border-t border-gray-200"></div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#161D1F] mb-3">
                  Pricing Details:
                </h3>
                <div className="grid grid-cols-2 gap-6 bg-[#E8F4F7] p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Cost Price:</p>
                    <p className="text-[15px] font-semibold text-[#161D1F]">
                      $ {test.cost_price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Selling Price:</p>
                    <p className="text-[15px] font-semibold text-[#161D1F]">
                      $ {test.selling_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleManageRelationships}
              className="px-8 py-2.5 bg-[#0088B1] text-white rounded-lg text-xs font-medium hover:bg-[#00729A] transition-colors"
            >
              Manage Relationships (
              {test.related_health_package_ids?.length || 0})
            </button>
          </div>
        </div>
      </div>

      <ManageRelationshipsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        test={test}
        onUpdateTest={handleUpdatePackage}
      />
    </>
  );
};
