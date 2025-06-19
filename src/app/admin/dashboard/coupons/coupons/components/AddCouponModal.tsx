"use client";
import React, { useEffect } from "react";
import { X, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { CouponItem } from "@/app/types/auth.types";
import toast from "react-hot-toast";
import { useCouponStore } from "@/app/store/couponStore";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (coupon: CouponItem) => void;
  couponToEdit?: CouponItem | null;
  isEditMode?: boolean;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  couponToEdit,
  isEditMode = false,
}) => {
  // Zustand store selectors
  const {
    formData,
    categoryDropdownOpen,
    setFormData,
    updateFormField,
    setCategoryDropdownOpen,
    resetForm,
    generateRandomCode,
  } = useCouponStore();

  // Sample categories
  const categories = [
    "Antibiotics",
    "Ambulance",
    "Cardiology",
    "Dermatology",
    "Neurology",
  ];

  useEffect(() => {
    if (isEditMode && couponToEdit) {
      setFormData(couponToEdit);
    } else {
      resetForm();
    }
  }, [isEditMode, couponToEdit, setFormData, resetForm]);

  const handleInputChange = (field: keyof CouponItem, value: any) => {
    updateFormField(field, value);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleGenerateCode = () => {
    generateRandomCode();
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.coupon_code) {
      toast.error("Coupon code is required");
      return;
    }
    if (!formData.expiry_date) {
      toast.error("Expiry date is required");
      return;
    }
    if (Number(formData.discount_value) <= 0) {
      toast.error("Discount must be greater than 0");
      return;
    }

    const couponData: CouponItem = {
      ...formData,
      id: isEditMode && couponToEdit?.id ? couponToEdit.id : Date.now(),
    };

    onSubmit(couponData);
    toast.success(`Coupon ${isEditMode ? "updated" : "created"} successfully`);
    onClose();
  };

  const handleCategorySelect = (category: string) => {
    handleInputChange("category", category);
    setCategoryDropdownOpen(false);
  };

  const toggleCategoryDropdown = () => {
    setCategoryDropdownOpen(!categoryDropdownOpen);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sticky top-0 bg-white z-10">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            {isEditMode ? "Edit Coupon" : "Create New Coupon"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#161D1F] hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-150px)]">
          <div className="grid grid-cols-1 md:grid-row-2 gap-4">
            {/* Coupon Code */}
            <div className="space-y-1 col-span-2">
              <label className="block text-xs font-medium text-[#161D1F]">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.coupon_code}
                  onChange={(e) =>
                    handleInputChange(
                      "coupon_code",
                      e.target.value.toUpperCase()
                    )
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-500"
                  placeholder="e.g., WELCOME10"
                  required
                />
                {/* <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                >
                  Generate
                </button> */}
              </div>
              {/* Discount Type */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#161D1F]">
                  Discount Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange("discount_type", "percentage")
                    }
                    className={`flex-1 py-2 px-3 rounded-md border text-xs ${
                      formData.discount_type === "percentage"
                        ? "bg-blue-100 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("discount_type", "fixed")}
                    className={`flex-1 py-2 px-3 rounded-md border text-xs ${
                      formData.discount_type === "fixed"
                        ? "bg-blue-100 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  >
                    Fixed Amount
                  </button>
                </div>
              </div>
            </div>

            {/* Discount Value */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#161D1F]">
                {formData.discount_type === "percentage"
                  ? "Discount Percentage"
                  : "Discount Amount"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) =>
                    handleInputChange(
                      "discount_value",
                      parseFloat(e.target.value)
                    )
                  }
                  min="0"
                  max={
                    formData.discount_type === "percentage" ? "100" : undefined
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-500"
                  required
                />
                <span className="absolute right-3 top-2 text-gray-500 text-xs">
                  {formData.discount_type === "percentage" ? "%" : "₹"}
                </span>
              </div>
            </div>

            {/* Minimum Order Value */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#161D1F]">
                Minimum Order Value (₹)
              </label>
              <input
                type="number"
                value={formData.minimum_order_value}
                onChange={(e) =>
                  handleInputChange(
                    "minimum_order_value",
                    parseFloat(e.target.value)
                  )
                }
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-500"
              />
            </div>

            {/* Usage Limit */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#161D1F]">
                Usage Limit
              </label>
              <input
                type="number"
                value={formData.uses_limit ?? ""}
                onChange={(e) =>
                  handleInputChange("uses_limit", parseInt(e.target.value))
                }
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-500"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#161D1F]">
                Expiry Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) =>
                    handleInputChange("expiry_date", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-500"
                  required
                />
                <CalendarIcon className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1 relative">
              <label className="block text-xs font-medium text-[#161D1F]">
                Category
              </label>
              <div className="relative" onClick={toggleCategoryDropdown}>
                <input
                  type="text"
                  value={formData.category}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-xs text-gray-500"
                  placeholder="Select category"
                />
                <ChevronDown className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
              </div>
              {categoryDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200 max-h-60 overflow-auto">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-xs text-gray-500"
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#161D1F]">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  handleInputChange(
                    "status",
                    e.target.value as "active" | "inactive"
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Description (full width) */}
          <div className="space-y-1 mt-4 col-span-2">
            <label className="block text-xs font-medium text-[#161D1F]">
              Coupon Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-500"
              placeholder="Enter coupon description"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-3 text-[10px] text-[#161D1F] hover:text-gray-900"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-[#0088B1] text-[#F8F8F8] text-[10px] rounded-lg hover:bg-[#00729A]"
          >
            {isEditMode ? "Update Coupon" : "Create Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
};
