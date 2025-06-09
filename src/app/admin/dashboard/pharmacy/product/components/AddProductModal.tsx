"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  AddProductModalProps,
  ProductFormData,
} from "../types/productForm.type";
import { BasicInformationTab } from "./BasicInformationTab";
import { ProductDetailsTab } from "./ProductDetailsTab";
import { SettingsTab } from "./SettingsTab";
import { addProductAPI } from "../services/productService";
import toast from "react-hot-toast";

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  onUpdateProduct,
  productToEdit,
  isEditMode,
}) => {
  const [activeTab, setActiveTab] = useState("Basic Information");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [dosageDropdownOpen, setDosageDropdownOpen] = useState(false);
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);
  const [storageDropdownOpen, setStorageDropdownOpen] = useState(false);
  const [tabAnimationKey, setTabAnimationKey] = useState(0);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (isEditMode && productToEdit) {
      setFormData(productToEdit);
    }
  }, [isEditMode, productToEdit]);

  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    SKU: "",
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
    HSN_Code: "",
    storageConditions: "",
    shelfLife: 0,
    prescriptionRequired: false,
    featuredProduct: false,
    activeProduct: true,
    saftyDescription: "",
    storageDescription: "",
    productImage: null,
  });

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedImages((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setFormData({
      productName: "",
      SKU: "",
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
      HSN_Code: "",
      storageConditions: "",
      shelfLife: 0,
      prescriptionRequired: false,
      featuredProduct: false,
      activeProduct: true,
      saftyDescription: "",
      storageDescription: "",
      productImage: null,
    });
    setSelectedImages([]);
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode && onUpdateProduct) {
        const productJSON = {
          ...formData,
          id: productToEdit?.id,
          createdAt: productToEdit?.createdAt,
          discount:
            formData.mrp > 0
              ? Math.round(
                  ((formData.mrp - formData.sellingPrice) / formData.mrp) * 100
                )
              : 0,
          status: formData.activeProduct ? "Active" : "Inactive",
        };
        onUpdateProduct(productJSON);
        toast.success("Product updated successfully");
      } else {
        console.log("Final Data Sent to Backend:", {
          formData,
          selectedImages,
        });
        const result = await addProductAPI(formData, selectedImages);
        onAddProduct(result);
        console.log("This is my Uploaded data", result);
        toast.success("Product added successfully!");
      }

      handleReset();
      setSelectedImages([]);
      setImagePreviews([]);
      onClose();
    } catch (error: any) {
      console.error("Error submitting product:", error);
      toast.error(
        `Failed to ${isEditMode ? "update" : "add"} product: ${
          error.message || "Please try again."
        }`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-scroll no-scrollbar ">
        {/* Header */}
        <div className="flex items-center justify-between p-4 top-0 sticky bg-white z-10">
          <h2 className="text-[16px] font-semibold text-[#161D1F] ">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h2>

          <button
            onClick={onClose}
            className="text-[#161D1F] hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[#F8F8F8]">
          {["Basic Information", "Product Details", "Settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setTabAnimationKey((prev) => prev + 1);
              }}
              className={`px-6 py-2 text-[10px] font-medium transition-colors rounded ${
                activeTab === tab
                  ? "bg-[#0088B1] text-[F8F8F8] "
                  : "text-[#161D1F] hover:text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] transition-all duration-300 ease-in-out">
          <div key={tabAnimationKey} className="animate-fade-in">
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
                selectedImages={selectedImages}
                imagePreviews={imagePreviews}
                onImageChange={handleImageChange}
                onRemoveImage={removeImage}
                onDrop={(files) => {
                  const newFiles = Array.from(files);
                  setSelectedImages((prev) => [...prev, ...newFiles]);
                  const newPreviews = newFiles.map((file) =>
                    URL.createObjectURL(file)
                  );
                  setImagePreviews((prev) => [...prev, ...newPreviews]);
                }}
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
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-3 text-[10px] text-[#161D1F] hover:text-gray-900"
          >
            Reset
          </button>

          {activeTab !== "Settings" ? (
            <button
              onClick={() => {
                if (activeTab === "Basic Information")
                  setActiveTab("Product Details");
                else if (activeTab === "Product Details")
                  setActiveTab("Settings");
                setTabAnimationKey((prev) => prev + 1);
              }}
              className="px-6 py-3 bg-[#0088B1] text-[#F8F8F8] text-[10px] rounded-lg hover:bg-[#00729A]"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-[#0088B1] text-[#F8F8F8] text-[10px] rounded-lg hover:bg-[#00729A]"
            >
              {isEditMode ? "Update Product" : "Add Product"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
