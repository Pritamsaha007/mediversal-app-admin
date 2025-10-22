"use client";
import React, { useState } from "react";
import { X, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { HealthPackagesType } from "../types";

interface ManageRelationshipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: HealthPackagesType | null;
}

export const ManageRelationshipsModal: React.FC<
  ManageRelationshipsModalProps
> = ({ isOpen, onClose, test }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [relatedTests, setRelatedTests] = useState<HealthPackagesType[]>([
    {
      id: "1",
      name: "Thyroid Function Test",
      description: "Measures thyroid hormone levels",
      code: "CBC0004456",
      category_id: "thyroid-category",
      sample_type_ids: ["blood", "urine"],
      test_includes: ["TSH", "T3", "T4"],
      report_time_hrs: 24,
      cost_price: 120,
      selling_price: 180,
      preparation_instructions: ["Fasting required"],
      precautions: ["Avoid thyroid medications"],
      is_fasting_reqd: true,
      in_person_visit_reqd: false,
      is_featured_lab_test: false,
      is_home_collection_available: true,
      is_active: true,
      image_url: "",
      is_deleted: false,
      created_by: "user-id",
      updated_by: "user-id",
      modality_type_id: "modality-1",
      inspection_parts_ids: [],
      related_lab_test_ids: [],
    },
  ]);

  const availableTests: HealthPackagesType[] = [
    {
      id: "2",
      name: "Liver Function Test",
      description: "Evaluates liver health and function",
      code: "LFT0007890",
      category_id: "liver-category",
      sample_type_ids: ["serum", "plasma"],
      test_includes: ["ALT", "AST", "Bilirubin"],
      report_time_hrs: 24,
      cost_price: 150,
      selling_price: 200,
      preparation_instructions: ["Fasting required"],
      precautions: [],
      is_fasting_reqd: true,
      in_person_visit_reqd: false,
      is_featured_lab_test: false,
      is_home_collection_available: true,
      is_active: true,
      image_url: "",
      is_deleted: false,
      created_by: "user-id",
      updated_by: "user-id",
      modality_type_id: "modality-1",
      inspection_parts_ids: [],
      related_lab_test_ids: [],
    },
    {
      id: "3",
      name: "Complete Blood Count",
      description: "Measures blood cell counts",
      code: "CBC0004567",
      category_id: "hematology-category",
      sample_type_ids: ["blood"],
      test_includes: ["Hemoglobin", "WBC", "RBC"],
      report_time_hrs: 12,
      cost_price: 80,
      selling_price: 120,
      preparation_instructions: [],
      precautions: [],
      is_fasting_reqd: false,
      in_person_visit_reqd: false,
      is_featured_lab_test: true,
      is_home_collection_available: true,
      is_active: true,
      image_url: "",
      is_deleted: false,
      created_by: "user-id",
      updated_by: "user-id",
      modality_type_id: "modality-1",
      inspection_parts_ids: [],
      related_lab_test_ids: [],
    },
    {
      id: "4",
      name: "Lipid Panel",
      description: "Measures cholesterol and triglycerides",
      code: "LIP0001234",
      category_id: "cardiology-category",
      sample_type_ids: ["serum"],
      test_includes: ["Cholesterol", "Triglycerides", "HDL", "LDL"],
      report_time_hrs: 24,
      cost_price: 100,
      selling_price: 150,
      preparation_instructions: ["Fasting for 12 hours required"],
      precautions: [],
      is_fasting_reqd: true,
      in_person_visit_reqd: false,
      is_featured_lab_test: false,
      is_home_collection_available: true,
      is_active: true,
      image_url: "",
      is_deleted: false,
      created_by: "user-id",
      updated_by: "user-id",
      modality_type_id: "modality-1",
      inspection_parts_ids: [],
      related_lab_test_ids: [],
    },
    {
      id: "5",
      name: "Basic Metabolic Panel",
      description: "Evaluates glucose, electrolyte and kidney function",
      code: "BMP0009876",
      category_id: "metabolic-category",
      sample_type_ids: ["serum"],
      test_includes: ["Glucose", "Sodium", "Potassium", "Creatinine"],
      report_time_hrs: 18,
      cost_price: 90,
      selling_price: 140,
      preparation_instructions: ["Fasting required"],
      precautions: [],
      is_fasting_reqd: true,
      in_person_visit_reqd: false,
      is_featured_lab_test: false,
      is_home_collection_available: true,
      is_active: true,
      image_url: "",
      is_deleted: false,
      created_by: "user-id",
      updated_by: "user-id",
      modality_type_id: "modality-1",
      inspection_parts_ids: [],
      related_lab_test_ids: [],
    },
  ];

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

  const handleSaveChanges = () => {
    // Update the main test's related_lab_test_ids with the IDs of related tests
    if (test) {
      const updatedRelatedIds = relatedTests.map((rt) => rt.id);
      // Here you would typically make an API call to update the test
      console.log(
        `Updating test ${test.id} with related tests:`,
        updatedRelatedIds
      );
    }

    toast.success("Health package relationships updated successfully!");
    onClose();
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
              Package Code: {test.code}
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
          <div className="space-y-6">
            <div>
              <h4 className="text-[14px] font-semibold text-[#161D1F] mb-4">
                Current Related Health Packages
              </h4>
              <div className="space-y-3">
                {relatedTests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-[13px] bg-gray-50 rounded-lg">
                    No related health packages added yet
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
                          <span>Package Code: {relTest.code}</span>
                          <span>|</span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                              />
                            </svg>
                            Sample Types:{" "}
                            {relTest.sample_type_ids?.join(", ") || "N/A"}
                          </span>
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
                Add Related Health Packages
              </h4>

              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search health packages by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300  placeholder:text-gray-500 rounded-lg text-[13px] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
                />
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredTests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-[13px] bg-gray-50 rounded-lg">
                    {searchTerm
                      ? "No health packages found matching your search"
                      : "All available packages have been added"}
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
                          <span>Package Code: {availTest.code}</span>
                          <span>|</span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                              />
                            </svg>
                            Sample Types:{" "}
                            {availTest.sample_type_ids?.join(", ") || "N/A"}
                          </span>
                          <span>|</span>
                          <span>Price: €{availTest.selling_price}</span>
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
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleSaveChanges}
            className="px-8 py-2.5 bg-[#0088B1] text-white rounded-lg text-[13px] font-medium hover:bg-[#00729A] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
