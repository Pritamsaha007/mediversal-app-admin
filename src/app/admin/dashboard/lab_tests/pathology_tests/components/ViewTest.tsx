"use client";
import React, { useState } from "react";
import { X, Edit } from "lucide-react";
import { ManageRelationshipsModal } from "./ManageRelationship";
import { PathologyTest } from "../types";

interface ViewTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: PathologyTest | null;
  onEdit?: (test: PathologyTest) => void;
  onUpdateTest?: (test: PathologyTest) => void;
}

export const ViewTestModal: React.FC<ViewTestModalProps> = ({
  isOpen,
  onClose,
  test,
  onEdit,
  onUpdateTest,
}) => {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const handleEdit = () => {
    if (onEdit && test) {
      onEdit(test);
    }
  };

  const handleManageRelationships = () => {
    setIsManageModalOpen(true);
  };

  const handleTestUpdate = (updatedTest: PathologyTest) => {
    if (onUpdateTest) {
      onUpdateTest(updatedTest);
    }
  };

  if (!isOpen || !test) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-semibold text-[#161D1F]">
                Lab Test Details
              </h3>
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                  title="Edit Test"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
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
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>Test Code: {test.code}</span>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 text-[12px] rounded border ${
                        test.is_active
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {test.is_active ? "Active" : "Inactive"}
                    </span>
                    {test.is_featured_lab_test && (
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 text-[12px] rounded border border-orange-200">
                        Featured
                      </span>
                    )}
                    {test.is_home_collection_available && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[12px] rounded border border-blue-200">
                        Home Collection
                      </span>
                    )}
                    {test.is_fasting_reqd && (
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[12px] rounded border border-purple-200">
                        Fasting Required
                      </span>
                    )}
                    {test.in_person_visit_reqd && (
                      <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-[12px] rounded border border-yellow-200">
                        Visit Required
                      </span>
                    )}
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[12px] rounded border border-purple-200">
                      {test.related_lab_test_ids?.length || 0} Related Tests
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      Report Preparation Time:
                    </p>
                    <p className="text-xs text-[#161D1F] font-medium">
                      {test.report_time_hrs} hours
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      Test Parameters:
                    </p>
                    <p className="text-xs text-[#161D1F]">
                      {test.test_params?.join(", ") ||
                        "No parameters specified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#161D1F] mb-2">
                  Test Description:
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {test.description || "No description available"}
                </p>
              </div>

              <div className="border-t border-gray-200"></div>

              {test.preparation_instructions &&
                test.preparation_instructions.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#161D1F] mb-3">
                      Preparation Instructions:
                    </h3>
                    <div className="rounded-lg border border-[#D3D7D8] p-4">
                      <ul className="space-y-2">
                        {test.preparation_instructions.map(
                          (instruction, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-xs text-gray-600 mt-0.5">
                                •
                              </span>
                              <span className="text-xs text-gray-600 flex-1">
                                {instruction}
                              </span>
                            </li>
                          )
                        )}
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
                      ₹{test.cost_price}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Selling Price:</p>
                    <p className="text-[15px] font-semibold text-[#161D1F]">
                      ₹{test.selling_price}
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
              Manage Relationships ({test.related_lab_test_ids?.length || 0})
            </button>
          </div>
        </div>
      </div>

      <ManageRelationshipsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        test={test}
        onUpdateTest={handleTestUpdate} // Pass the update handler
      />
    </>
  );
};
