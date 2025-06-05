"use client";
import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";

interface ProductFormData {
  // Basic Information
  productName: string;
  sku: string;
  category: string;
  subCategory: string;
  brand: string;
  manufacturer: string;
  mrp: number;
  sellingPrice: number;
  stockQuantity: number;

  // Product Details
  description: string;
  composition: string;
  dosageForm: string;
  strength: string;
  packSize: string;

  // Settings
  schedule: string;
  taxRate: number;
  hsnCode: string;
  storageConditions: string;
  shelfLife: number;
  prescriptionRequired: boolean;
  featuredProduct: boolean;
  activeProduct: boolean;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productData: ProductFormData) => void;
}

const categories = [
  "All Categories",
  "Medicines",
  "Healthcare",
  "Beauty & Personal Care",
  "Baby Care",
  "Wellness",
];

const dosageForms = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Ointment",
  "Drops",
];

const schedules = [
  "Schedule H",
  "Schedule H1",
  "Schedule X",
  "OTC",
  "Ayurvedic",
];

const storageConditions = [
  "Store in cool & dry place",
  "Store below 25°C",
  "Store below 30°C",
  "Store in refrigerator (2-8°C)",
  "Store away from light",
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [activeTab, setActiveTab] = useState("Basic Information");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [dosageDropdownOpen, setDosageDropdownOpen] = useState(false);
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);
  const [storageDropdownOpen, setStorageDropdownOpen] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    sku: "",
    category: "",
    subCategory: "",
    brand: "",
    manufacturer: "",
    mrp: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    description: "",
    composition: "",
    dosageForm: "",
    strength: "",
    packSize: "",
    schedule: "",
    taxRate: 0,
    hsnCode: "",
    storageConditions: "",
    shelfLife: 0,
    prescriptionRequired: false,
    featuredProduct: false,
    activeProduct: true,
  });

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      productName: "",
      sku: "",
      category: "",
      subCategory: "",
      brand: "",
      manufacturer: "",
      mrp: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      description: "",
      composition: "",
      dosageForm: "",
      strength: "",
      packSize: "",
      schedule: "",
      taxRate: 0,
      hsnCode: "",
      storageConditions: "",
      shelfLife: 0,
      prescriptionRequired: false,
      featuredProduct: false,
      activeProduct: true,
    });
  };

  const handleSubmit = () => {
    // Create JSON with all form data
    const productJSON = {
      ...formData,
      id: Date.now().toString(), // Generate a temporary ID
      createdAt: new Date().toISOString(),
      discount:
        formData.mrp > 0
          ? Math.round(
              ((formData.mrp - formData.sellingPrice) / formData.mrp) * 100
            )
          : 0,
      status: formData.activeProduct ? "Active" : "Inactive",
    };

    console.log("Product JSON:", JSON.stringify(productJSON, null, 2));
    onAddProduct(formData);
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  const renderBasicInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> Product Name
          </label>
          <input
            type="text"
            placeholder="Enter Product Name"
            value={formData.productName}
            onChange={(e) => handleInputChange("productName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> SKU
          </label>
          <input
            type="text"
            placeholder="Enter SKU"
            value={formData.sku}
            onChange={(e) => handleInputChange("sku", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> Category
          </label>
          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-left flex items-center justify-between"
            >
              <span
                className={formData.category ? "text-black" : "text-gray-500"}
              >
                {formData.category || "Select a category"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {categoryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {categories.slice(1).map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      handleInputChange("category", category);
                      setCategoryDropdownOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sub Category
          </label>
          <input
            type="text"
            placeholder="Enter subcategory"
            value={formData.subCategory}
            onChange={(e) => handleInputChange("subCategory", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> Brand
          </label>
          <input
            type="text"
            placeholder="Enter brand name"
            value={formData.brand}
            onChange={(e) => handleInputChange("brand", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> Manufacturer
          </label>
          <input
            type="text"
            placeholder="Enter manufacturer name"
            value={formData.manufacturer}
            onChange={(e) => handleInputChange("manufacturer", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> MRP (₹)
          </label>
          <input
            type="number"
            placeholder="0"
            value={formData.mrp || ""}
            onChange={(e) =>
              handleInputChange("mrp", parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> Selling Price (₹)
          </label>
          <input
            type="number"
            placeholder="0"
            value={formData.sellingPrice || ""}
            onChange={(e) =>
              handleInputChange("sellingPrice", parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> Stock Quantity
          </label>
          <input
            type="number"
            placeholder="0"
            value={formData.stockQuantity || ""}
            onChange={(e) =>
              handleInputChange("stockQuantity", parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );

  const renderProductDetails = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          placeholder="Enter product description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Composition
          </label>
          <input
            type="text"
            placeholder="Enter Composition"
            value={formData.composition}
            onChange={(e) => handleInputChange("composition", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dosage Form
          </label>
          <div className="relative">
            <button
              onClick={() => setDosageDropdownOpen(!dosageDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-left flex items-center justify-between"
            >
              <span
                className={formData.dosageForm ? "text-black" : "text-gray-500"}
              >
                {formData.dosageForm || "Select dosage form"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {dosageDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {dosageForms.map((form) => (
                  <button
                    key={form}
                    onClick={() => {
                      handleInputChange("dosageForm", form);
                      setDosageDropdownOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {form}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Strength
          </label>
          <input
            type="text"
            placeholder="e.g., 500mg, 10ml"
            value={formData.strength}
            onChange={(e) => handleInputChange("strength", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pack Size
          </label>
          <input
            type="text"
            placeholder="e.g., 10 tablets, 100ml"
            value={formData.packSize}
            onChange={(e) => handleInputChange("packSize", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schedule
          </label>
          <div className="relative">
            <button
              onClick={() => setScheduleDropdownOpen(!scheduleDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-left flex items-center justify-between"
            >
              <span
                className={formData.schedule ? "text-black" : "text-gray-500"}
              >
                {formData.schedule || "Select schedule"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {scheduleDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {schedules.map((schedule) => (
                  <button
                    key={schedule}
                    onClick={() => {
                      handleInputChange("schedule", schedule);
                      setScheduleDropdownOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {schedule}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax Rate (%)
          </label>
          <input
            type="number"
            placeholder="e.g., 5, 12, 18"
            value={formData.taxRate || ""}
            onChange={(e) =>
              handleInputChange("taxRate", parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HSN Code
          </label>
          <input
            type="text"
            placeholder="Enter HSN code"
            value={formData.hsnCode}
            onChange={(e) => handleInputChange("hsnCode", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Storage Conditions
          </label>
          <div className="relative">
            <button
              onClick={() => setStorageDropdownOpen(!storageDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-left flex items-center justify-between"
            >
              <span
                className={
                  formData.storageConditions ? "text-black" : "text-gray-500"
                }
              >
                {formData.storageConditions || "Select storage condition"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {storageDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {storageConditions.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => {
                      handleInputChange("storageConditions", condition);
                      setStorageDropdownOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {condition}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Shelf Life (months)
        </label>
        <input
          type="number"
          placeholder="0"
          value={formData.shelfLife || ""}
          onChange={(e) =>
            handleInputChange("shelfLife", parseInt(e.target.value) || 0)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
        />
      </div>

      <div className="space-y-3">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.prescriptionRequired}
              onChange={(e) =>
                handleInputChange("prescriptionRequired", e.target.checked)
              }
              className="mt-0.5"
            />
            <div>
              <div className="font-medium text-gray-900">
                Prescription Required
              </div>
              <div className="text-sm text-gray-500">
                Check this if the product requires a prescription for purchase
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.featuredProduct}
              onChange={(e) =>
                handleInputChange("featuredProduct", e.target.checked)
              }
              className="mt-0.5"
            />
            <div>
              <div className="font-medium text-gray-900">Featured Product</div>
              <div className="text-sm text-gray-500">
                Featured products are displayed prominently on the website
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-2 border-[#0088B1] bg-[#E8F4F7] rounded-lg">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.activeProduct}
              onChange={(e) =>
                handleInputChange("activeProduct", e.target.checked)
              }
              className="mt-0.5 accent-[#0088B1]"
            />
            <div>
              <div className="font-medium text-gray-900">Active Product</div>
              <div className="text-sm text-gray-500">
                Inactive products are not displayed on the website
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Product
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {["Basic Information", "Product Details", "Settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#0088B1] text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === "Basic Information" && renderBasicInformation()}
          {activeTab === "Product Details" && renderProductDetails()}
          {activeTab === "Settings" && renderSettings()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#0088B1] text-white text-sm rounded-lg hover:bg-[#00729A] transition-colors"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
};
