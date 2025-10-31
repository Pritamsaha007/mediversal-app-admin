"use client";
import React, { useState, useEffect } from "react";
import { X, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { updateHealthPackage, searchHeathPackages } from "../../services/index";
import { useAdminStore } from "@/app/store/adminStore";
import { HealthPackage, SearchHealthPackagesPayload } from "../types";

interface ManageRelationshipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: HealthPackage | null;
  onUpdateTest?: (test: HealthPackage) => void;
}

export const ManageRelationshipsModal: React.FC<
  ManageRelationshipsModalProps
> = ({ isOpen, onClose, test, onUpdateTest }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [relatedPackages, setRelatedPackages] = useState<HealthPackage[]>([]);
  const [availablePackages, setAvailablePackages] = useState<HealthPackage[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { token } = useAdminStore();

  useEffect(() => {
    const fetchPackages = async () => {
      if (!isOpen || !test || !token) return;

      setLoading(true);
      try {
        const payload: SearchHealthPackagesPayload = {
          start: 0,
          max: 100,
          search: null,
          sort_by: "name",
          sort_order: "ASC",
        };

        const response = await searchHeathPackages(payload, token);
        const allPackages = response.healthpackages || [];

        const filteredAvailablePackages = allPackages.filter(
          (p) => p.id !== test.id
        );
        setAvailablePackages(filteredAvailablePackages);

        if (
          test.related_health_package_ids &&
          test.related_health_package_ids.length > 0
        ) {
          const currentRelatedPackages = allPackages.filter((p) =>
            test.related_health_package_ids!.includes(p.id)
          );
          setRelatedPackages(currentRelatedPackages);
        } else {
          setRelatedPackages([]);
        }
      } catch (error: any) {
        console.error("Error fetching health packages:", error);
        toast.error("Failed to load health packages");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [isOpen, test, token]);

  const filteredPackages = availablePackages.filter(
    (availablePackage) =>
      (availablePackage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        availablePackage.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      !relatedPackages.some((rp) => rp.id === availablePackage.id)
  );

  const handleAddPackage = (packageId: string) => {
    const packageToAdd = availablePackages.find((p) => p.id === packageId);
    if (packageToAdd && !relatedPackages.some((p) => p.id === packageId)) {
      setRelatedPackages((prev) => [...prev, packageToAdd]);
      toast.success(`Added ${packageToAdd.name}`);
    }
  };

  const handleRemovePackage = (packageId: string) => {
    const packageToRemove = relatedPackages.find((p) => p.id === packageId);
    if (packageToRemove) {
      setRelatedPackages((prev) => prev.filter((p) => p.id !== packageId));
      toast.success(`Removed ${packageToRemove.name}`);
    }
  };

  const handleSaveChanges = async () => {
    if (!test || !token) return;

    setSaving(true);
    try {
      const updatedRelatedIds = relatedPackages.map((rp) => rp.id);

      const updatePayload = {
        id: test.id,
        name: test.name,
        description: test.description,
        image_url: test.image_url || "",
        linked_test_ids: test.linked_test_ids || [],
        cost_price: test.cost_price,
        selling_price: test.selling_price,
        prepare_instructions: test.prepare_instructions || [],
        is_active: test.is_active,
        is_popular: test.is_popular,
        is_deleted: test.is_deleted || false,
        related_health_package_ids: updatedRelatedIds,
        is_fasting_reqd: test.is_fasting_reqd || false,
        in_person_visit_reqd: test.in_person_visit_reqd || false,
        is_home_collection_available:
          test.is_home_collection_available !== undefined
            ? test.is_home_collection_available
            : true,
        created_by: test.created_by || "",
        updated_by: test.updated_by || "",
      };

      await updateHealthPackage(updatePayload, token);

      const updatedTest: HealthPackage = {
        ...test,
        related_health_package_ids: updatedRelatedIds,
      };

      if (onUpdateTest) {
        onUpdateTest(updatedTest);
      }

      toast.success("Health package relationships updated successfully!");

      // Close the modal first
      onClose();

      // Then refresh the entire screen after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error("Error updating relationships:", error);
      toast.error(error.message || "Failed to update relationships");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !test) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 text-black">
          <div>
            <h3 className="text-[15px] font-semibold">
              Manage Health Package Relationships: {test.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {test.linked_test_ids?.length || 0} tests included
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full bg-gray-100 border-b border-gray-200 flex justify-center py-4 shadow-sm">
          <button className="px-4 py-2 text-[13px] font-medium text-black">
            Related Health Packages
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading health packages...</div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-[14px] font-semibold text-[#161D1F] mb-4">
                  Current Related Health Packages
                </h4>
                <div className="space-y-3">
                  {relatedPackages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-[13px] bg-gray-50 rounded-lg">
                      No related health packages added yet
                    </div>
                  ) : (
                    relatedPackages.map((relPackage) => (
                      <div
                        key={relPackage.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h5 className="text-[14px] font-medium text-[#161D1F] mb-1">
                            {relPackage.name}
                          </h5>
                          <div className="flex items-center gap-3 text-[12px] text-gray-500">
                            <span>
                              Tests: {relPackage.linked_test_ids?.length || 0}
                            </span>
                            <span>|</span>
                            <span className="flex items-center gap-1">
                              Price: ₹{relPackage.selling_price}
                            </span>
                            <span>|</span>
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-medium ${
                                relPackage.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {relPackage.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePackage(relPackage.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[14px] font-semibold text-[#161D1F] mb-4">
                  Add Related Health Packages
                </h4>

                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search health packages by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 placeholder:text-gray-500 rounded-lg text-[13px] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
                  />
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {filteredPackages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-[13px] bg-gray-50 rounded-lg">
                      {searchTerm
                        ? "No health packages found matching your search"
                        : "All available packages have been added"}
                    </div>
                  ) : (
                    filteredPackages.map((availPackage) => (
                      <div
                        key={availPackage.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h5 className="text-[14px] font-medium text-[#161D1F] mb-1">
                            {availPackage.name}
                          </h5>
                          <div className="flex items-center gap-3 text-[12px] text-gray-500">
                            <span>
                              Tests: {availPackage.linked_test_ids?.length || 0}
                            </span>
                            <span>|</span>
                            <span className="flex items-center gap-1">
                              Price: ₹{availPackage.selling_price}
                            </span>
                            <span>|</span>
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-medium ${
                                availPackage.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {availPackage.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddPackage(availPackage.id)}
                          className="px-5 py-1.5 text-[#0088B1] text-[13px] font-medium hover:bg-blue-50 rounded transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className={`px-8 py-2.5 bg-[#0088B1] text-white rounded-lg text-[13px] font-medium hover:bg-[#00729A] transition-colors ${
              saving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
