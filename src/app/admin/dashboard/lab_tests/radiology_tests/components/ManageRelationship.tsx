"use client";
import React, { useState, useEffect } from "react";
import { X, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { RadiologyTest } from "../types";
import {
  searchPathologyTests,
  updatePathologyTest,
  SearchLabTestsPayload,
  fetchCategories,
} from "../../services/index";
import { useAdminStore } from "@/app/store/adminStore";

interface ManageRelationshipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: RadiologyTest | null;
  onUpdateTest?: (test: RadiologyTest) => void;
}

export const ManageRelationshipsModal: React.FC<
  ManageRelationshipsModalProps
> = ({ isOpen, onClose, test, onUpdateTest }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [relatedTests, setRelatedTests] = useState<RadiologyTest[]>([]);
  const [availableTests, setAvailableTests] = useState<RadiologyTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { token } = useAdminStore();
  const [category_id, setCategory_id] = useState<string>("");
  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const categoryData = await fetchCategories(token);
      const defaultCategoryId = categoryData.roles[11]?.id || "";
      console.log(defaultCategoryId);
      setCategory_id(defaultCategoryId);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to load dropdown options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      if (!isOpen || !test || !token) return;

      setLoading(true);
      try {
        const payload: SearchLabTestsPayload = {
          start: 0,
          max: 100,
          search_category: category_id || null,
          search: null,
          filter_sample_type_ids: null,
          filter_active: true,
          filter_featured: null,
          sort_by: "name",
          sort_order: "ASC",
        };

        const response = await searchPathologyTests(payload, token);
        const allTests = response.labTests;

        const filteredAvailableTests = allTests.filter((t) => t.id !== test.id);
        setAvailableTests(filteredAvailableTests);

        if (test.related_lab_test_ids && test.related_lab_test_ids.length > 0) {
          const currentRelatedTests = allTests.filter((t) =>
            test.related_lab_test_ids!.includes(t.id)
          );
          setRelatedTests(currentRelatedTests);
        } else {
          setRelatedTests([]);
        }
      } catch (error: any) {
        console.error("Error fetching radiology tests:", error);
        toast.error("Failed to load tests");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [isOpen, test, token]);

  console.log(relatedTests, "related tests");

  const filteredTests = availableTests.filter(
    (availableTest) =>
      (availableTest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        availableTest.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      !relatedTests.some((rt) => rt.id === availableTest.id)
  );

  const handleAddTest = (testId: string) => {
    const testToAdd = availableTests.find((t) => t.id === testId);
    if (testToAdd && !relatedTests.some((t) => t.id === testId)) {
      setRelatedTests((prev) => [...prev, testToAdd]);
      toast.success(`Added ${testToAdd.name}`);
    }
  };

  const handleRemoveTest = (testId: string) => {
    const testToRemove = relatedTests.find((t) => t.id === testId);
    if (testToRemove) {
      setRelatedTests((prev) => prev.filter((t) => t.id !== testId));
      toast.success(`Removed ${testToRemove.name}`);
    }
  };

  const handleSaveChanges = async () => {
    if (!test || !token) return;

    setSaving(true);
    try {
      const updatedRelatedIds = relatedTests.map((rt) => rt.id);

      const updatePayload = {
        id: test.id,
        name: test.name,
        description: test.description,
        code: test.code,
        category_id: test.category_id,
        sample_type_ids: test.sample_type_ids || [],
        test_params: test.test_params || [],
        report_time_hrs: test.report_time_hrs,
        cost_price: test.cost_price,
        selling_price: test.selling_price,
        preparation_instructions: test.preparation_instructions,
        precautions: test.precautions || [],
        is_fasting_reqd: test.is_fasting_reqd,
        in_person_visit_reqd: test.in_person_visit_reqd,
        is_featured_lab_test: test.is_featured_lab_test,
        is_home_collection_available: test.is_home_collection_available,
        is_active: test.is_active,
        image_url: test.image_url || "",
        modality_type_id: test.modality_type_id || "",
        inspection_parts_ids: test.inspection_parts_ids || [],
        related_lab_test_ids: updatedRelatedIds, // This is the important field
      };

      const response = await updatePathologyTest(updatePayload, token);

      if (onUpdateTest) {
        const updatedTest: RadiologyTest = {
          ...test,
          related_lab_test_ids: updatedRelatedIds,
        };
        onUpdateTest(updatedTest);
      }

      toast.success("Radiology test relationships updated successfully!");

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
              Manage Radiology Test Relationships: {test.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Test Code: {test.code}</p>
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
            Related Radiology Tests
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading tests...</div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-[14px] font-semibold text-[#161D1F] mb-4">
                  Current Related Radiology Tests
                </h4>
                <div className="space-y-3">
                  {relatedTests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-[13px] bg-gray-50 rounded-lg">
                      No related radiology tests added yet
                    </div>
                  ) : (
                    relatedTests.map((relTest) => (
                      <div
                        key={relTest.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h5 className="text-[14px] font-medium text-[#161D1F] mb-1">
                            {relTest.name}
                          </h5>
                          <div className="flex items-center gap-3 text-[12px] text-gray-500">
                            <span>Test Code: {relTest.code}</span>

                            <span>|</span>
                            <span>
                              Report Time: {relTest.report_time_hrs} hrs
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveTest(relTest.id)}
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
                  Add Related Radiology Tests
                </h4>

                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search radiology tests by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 placeholder:text-gray-500 rounded-lg text-[13px] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
                  />
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {filteredTests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-[13px] bg-gray-50 rounded-lg">
                      {searchTerm
                        ? "No radiology tests found matching your search"
                        : "All available tests have been added"}
                    </div>
                  ) : (
                    filteredTests.map((availTest) => (
                      <div
                        key={availTest.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h5 className="text-[14px] font-medium text-[#161D1F] mb-1">
                            {availTest.name}
                          </h5>
                          <div className="flex items-center gap-3 text-[12px] text-gray-500">
                            <span>Test Code: {availTest.code}</span>

                            <span>|</span>
                            <span>Price: ₹{availTest.selling_price}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddTest(availTest.id)}
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
