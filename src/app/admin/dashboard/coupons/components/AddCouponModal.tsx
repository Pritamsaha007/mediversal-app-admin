"use client";
import React, { useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { CouponItem } from "@/app/types/auth.types";
import toast from "react-hot-toast";
import { useCouponStore } from "@/app/admin/dashboard/coupons/store/couponStore";
import { formatDateForInput } from "@/app/utils/date.utils";

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
  const {
    formData,
    categoryDropdownOpen,
    setFormData,
    updateFormField,
    setCategoryDropdownOpen,
    resetForm,
    generateRandomCode,
  } = useCouponStore();

  const [activeTab, setActiveTab] = React.useState<"general" | "eligibility">(
    "general",
  );

  const categories = [
    "OTC",
    "Prescription",
    "Supplements",
    "Devices",
    "Surgical Care",
    "Vaccines",
    "Personal Care",
    "Sexual Wellness",
    "Mother & Baby",
    "Senior Care",
    "Seasonal Needs",
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
      id:
        isEditMode && couponToEdit?.id
          ? couponToEdit.id
          : Date.now().toString(),
      start_date: formData.start_date || null,
      expiry_date: formData.expiry_date
        ? formData.expiry_date.includes("T") ||
          formData.expiry_date.includes(" ")
          ? formData.expiry_date
          : `${formData.expiry_date} 23:59:59`
        : null,
      is_for_first_time_user: formData.is_for_first_time_user ? 1 : 0,
      is_for_comeback_user: formData.is_for_comeback_user ? 1 : 0,
      is_for_loyal_user: formData.is_for_loyal_user ? 1 : 0,
      is_for_birthday_user: formData.is_for_birthday_user ? 1 : 0,
      is_general_coupon: formData.is_general_coupon ? 1 : 0,
      is_for_new_customer: formData.is_for_new_customer ? 1 : 0,
      is_for_existing_customer: formData.is_for_existing_customer ? 1 : 0,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[16px] font-semibold text-[#161D1F]">
            {isEditMode ? "Edit Coupon" : "Create New Coupon"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-[#899193]" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 px-5 bg-gray-50 p-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "general"
                ? "bg-[#0088B1] rounded-md text-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            General Information
          </button>
          <button
            onClick={() => setActiveTab("eligibility")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "eligibility"
                ? "bg-[#0088B1] text-white  rounded-md"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            User Eligibility
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "general" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="flex items-center gap-1 text-xs font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span>
                    <span>Coupon Code</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.coupon_code}
                      onChange={(e) =>
                        handleInputChange(
                          "coupon_code",
                          e.target.value.toUpperCase(),
                        )
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
                      placeholder="e.g., WELCOME10"
                      required
                    />
                    <button
                      onClick={handleGenerateCode}
                      className="px-4 py-2 bg-gray-100 text-[#0088B1] rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span>
                    <span>Discount Type</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange("discount_type", "percentage")
                      }
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium ${
                        formData.discount_type === "percentage"
                          ? "bg-[#0088B1] text-white border-[#0088B1]"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange("discount_type", "fixed")
                      }
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium ${
                        formData.discount_type === "fixed"
                          ? "bg-[#0088B1] text-white border-[#0088B1]"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Fixed Amount
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span>
                    <span>
                      {formData.discount_type === "percentage"
                        ? "Discount Percentage"
                        : "Discount Amount"}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={
                        formData.discount_value === 0
                          ? ""
                          : formData.discount_value
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        if (rawValue === "") {
                          handleInputChange("discount_value", 0);
                        } else {
                          const numValue = parseFloat(rawValue);
                          if (!isNaN(numValue)) {
                            handleInputChange("discount_value", numValue);
                          }
                        }
                      }}
                      min="0"
                      max={
                        formData.discount_type === "percentage"
                          ? 100
                          : undefined
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
                      placeholder={`Enter ${
                        formData.discount_type === "percentage"
                          ? "percentage"
                          : "amount"
                      }`}
                      required
                    />
                    <span className="absolute right-3 top-2 text-gray-500 text-xs">
                      {formData.discount_type === "percentage" ? "%" : "₹"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#161D1F] mb-2">
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_order_value || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseFloat(e.target.value);
                      handleInputChange("minimum_order_value", value);
                    }}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
                    placeholder="Enter minimum order value"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#161D1F] mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.uses_limit || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? undefined
                          : parseInt(e.target.value);
                      handleInputChange("uses_limit", value);
                    }}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
                    placeholder="Enter usage limit (optional)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#161D1F] mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={
                      formData.start_date
                        ? formatDateForInput(formData.start_date)
                        : ""
                    }
                    onChange={(e) =>
                      handleInputChange("start_date", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-xs font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span>
                    <span>Expiry Date</span>
                  </label>
                  <input
                    type="date"
                    value={
                      formData.expiry_date
                        ? formatDateForInput(formData.expiry_date)
                        : ""
                    }
                    onChange={(e) =>
                      handleInputChange("expiry_date", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
                    required
                  />
                </div>

                <div className="space-y-1 relative">
                  <label className="block text-xs font-medium text-[#161D1F] mb-2">
                    Category
                  </label>
                  <div className="relative" onClick={toggleCategoryDropdown}>
                    <input
                      type="text"
                      value={formData.category}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
                      placeholder="Select category"
                    />
                    <ChevronDown className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
                  </div>
                  {categoryDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 border border-gray-200 max-h-60 overflow-auto">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-xs text-gray-500 w-full text-left bg-white"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#161D1F] mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange(
                        "status",
                        e.target.value as "active" | "inactive",
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#161D1F] mb-2">
                  Coupon Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
                  placeholder="Enter coupon description"
                />
              </div>
            </div>
          )}

          {activeTab === "eligibility" && (
            <div className="space-y-4 animate-fade-in">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[#161D1F] mb-3">
                  User Types
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_for_first_time_user === 1}
                      onChange={(e) =>
                        handleInputChange(
                          "is_for_first_time_user",
                          e.target.checked ? 1 : 0,
                        )
                      }
                      className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-700">
                      First Time Users
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_for_comeback_user === 1}
                      onChange={(e) =>
                        handleInputChange(
                          "is_for_comeback_user",
                          e.target.checked ? 1 : 0,
                        )
                      }
                      className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-700">
                      Comeback Users
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_for_loyal_user === 1}
                      onChange={(e) =>
                        handleInputChange(
                          "is_for_loyal_user",
                          e.target.checked ? 1 : 0,
                        )
                      }
                      className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-700">Loyal Users</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_for_birthday_user === 1}
                      onChange={(e) =>
                        handleInputChange(
                          "is_for_birthday_user",
                          e.target.checked ? 1 : 0,
                        )
                      }
                      className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-700">
                      Birthday Users
                    </span>
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[#161D1F] mb-3">
                  Customer Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_for_new_customer === 1}
                      onChange={(e) =>
                        handleInputChange(
                          "is_for_new_customer",
                          e.target.checked ? 1 : 0,
                        )
                      }
                      className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-700">New Customers</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_for_existing_customer === 1}
                      onChange={(e) =>
                        handleInputChange(
                          "is_for_existing_customer",
                          e.target.checked ? 1 : 0,
                        )
                      }
                      className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-700">
                      Existing Customers
                    </span>
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[#161D1F] mb-3">
                  General Availability
                </h4>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_general_coupon === 1}
                    onChange={(e) =>
                      handleInputChange(
                        "is_general_coupon",
                        e.target.checked ? 1 : 0,
                      )
                    }
                    className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                  />
                  <span className="text-xs text-gray-700">
                    General Coupon (Available to all users)
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>

          <div className="flex gap-3">
            {activeTab === "eligibility" && (
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}

            {activeTab === "general" ? (
              <button
                type="button"
                onClick={() => setActiveTab("eligibility")}
                className="px-6 py-2.5 bg-[#0088B1] text-white rounded-lg text-xs font-medium hover:bg-[#00729A] transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-[#0088B1] text-white rounded-lg text-xs font-medium hover:bg-[#00729A] transition-colors"
              >
                {isEditMode ? "Update Coupon" : "Create Coupon"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
