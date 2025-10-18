"use client";
import React, { useState } from "react";
import { X, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { ManageRelationshipsModal } from "./ManageRelationship";
import { PathologyTest } from "../types";

interface ViewTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: PathologyTest | null;
  onEdit?: (test: PathologyTest) => void;
}

export const ViewTestModal: React.FC<ViewTestModalProps> = ({
  isOpen,
  onClose,
  test,
  onEdit,
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

  if (!isOpen || !test) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-[16px] font-semibold text-[#161D1F]">
              Lab Test Details
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
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>Test Code: {test.code}</span>
                  <span>|</span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
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
                    Sample Types: {test.sample_type_ids.join(", ")}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-[12px] rounded border border-green-200">
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
                      {test.test_params?.join(", ")}
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
                  {test.description}
                </p>
              </div>

              <div className="border-t border-gray-200"></div>

              {test.preparation_instructions.length > 0 && (
                <div>
                  <h3 className="text-[14px] font-semibold text-[#161D1F] mb-3 ">
                    Preparation Instructions:
                  </h3>
                  <div className="rounded-lg border border-[#D3D7D8] p-2">
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

              {test.precautions && test.precautions.length > 0 && (
                <div>
                  <h3 className="text-[14px] font-semibold text-[#161D1F] mb-3 ">
                    Precautions:
                  </h3>
                  <div className="rounded-lg border border-[#D3D7D8] p-2 bg-[#FFEAEA]">
                    <ul className="space-y-2">
                      {test.precautions.map((precaution, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-xs text-gray-600 mt-0.5">
                            •
                          </span>
                          <span className="text-xs text-gray-600 flex-1">
                            {precaution}
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
                      ₹ {test.cost_price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Selling Price:</p>
                    <p className="text-[15px] font-semibold text-[#161D1F]">
                      ₹ {test.selling_price.toFixed(2)}
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
              Manage Relationships
            </button>
          </div>
        </div>
      </div>

      <ManageRelationshipsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        test={test}
      />
    </>
  );
};
