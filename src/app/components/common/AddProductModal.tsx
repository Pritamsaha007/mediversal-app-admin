"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import {
  AddProductModalProps,
  ProductFormData,
} from "@/app/types/productForm.type";
import { BasicInformationTab } from "./BasicInformationTab";
import { ProductDetailsTab } from "./ProductDetailsTab";
import { SettingsTab } from "./SettingsTab";

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
    const productJSON = {
      ...formData,
      id: Date.now().toString(),
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
            className="text-gray-400 hover:text-gray-600"
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
          {activeTab === "Basic Information" && (
            <BasicInformationTab
              formData={formData}
              onInputChange={handleInputChange}
              categoryDropdownOpen={categoryDropdownOpen}
              setCategoryDropdownOpen={setCategoryDropdownOpen}
            />
          )}
          {activeTab === "Product Details" && (
            <ProductDetailsTab
              formData={formData}
              onInputChange={handleInputChange}
              dosageDropdownOpen={dosageDropdownOpen}
              setDosageDropdownOpen={setDosageDropdownOpen}
            />
          )}
          {activeTab === "Settings" && (
            <SettingsTab
              formData={formData}
              onInputChange={handleInputChange}
              scheduleDropdownOpen={scheduleDropdownOpen}
              setScheduleDropdownOpen={setScheduleDropdownOpen}
              storageDropdownOpen={storageDropdownOpen}
              setStorageDropdownOpen={setStorageDropdownOpen}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#0088B1] text-white text-sm rounded-lg hover:bg-[#00729A]"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
};
