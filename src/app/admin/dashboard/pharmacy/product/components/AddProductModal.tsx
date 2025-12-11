"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ProductFormData } from "../types/productForm.type";
import { BasicInformationTab } from "./BasicInformationTab";
import { ProductDetailsTab } from "./ProductDetailsTab";
import { SettingsTab } from "./SettingsTab";

import toast from "react-hot-toast";
import { useAdminStore } from "@/app/store/adminStore";
import { addProductAPI } from "../services/ProductService";
import { uploadFile } from "../../../lab_tests/services";
interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: ProductFormData) => void;
  onUpdateProduct?: (product: ProductFormData) => void;
  productToEdit?: ProductFormData | null;
  isEditMode?: boolean;
}
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
  const [subcategoryDropdownOpen, setSubcategoryDropdownOpen] = useState(false);
  const [symptomsDropdownOpen, setSymptomsDropdownOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const admin = useAdminStore((state) => state.admin);

  useEffect(() => {
    if (isEditMode && productToEdit) {
      setFormData(productToEdit);
    }
  }, [isEditMode, productToEdit]);
  const { token } = useAdminStore();
  const [formData, setFormData] = useState<ProductFormData>({
    ProductName: "",
    SKU: "",
    Category: "",
    Subcategory: "",
    ManufacturerName: "",
    CostPrice: null,
    SellingPrice: null,
    StockAvailableInInventory: null,
    ProductInformation: "",
    Composition: "",
    dosageForm: "",
    ProductStrength: "",
    PackageSize: "",
    schedule: "",
    Type: "",
    tax: 0,
    HSN_Code: "",
    storageConditions: "",
    image_url: [],
    // shelfLife: 0,
    PrescriptionRequired: false,
    featuredProduct: false,
    active: true,
    SafetyAdvices: "",
    StorageInstructions: "",
    productImage: null,
    // New required fields
    ColdChain: "",
    GST: "",
    admin_id: admin?.id || "", // Fixed from admin store, not shown in UI
    // Additional backend fields
    DiscountedPrice: null,
    DiscountedPercentage: 0,
    productLength: 20,
    productBreadth: 20,
    productHeight: 5,
    productWeight: 0.4,
    subCategoryType: "",
    Coupons: null,
  });

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    const maxFiles = 5;
    if (fileArray.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }

    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setSelectedImages((prev) => [...prev, ...fileArray]);
    setImagePreviews((prev) => [...prev, ...previews]);
  };
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setFormData({
      ProductName: "",
      SKU: "",
      Category: "",
      Subcategory: "",
      ManufacturerName: "",
      CostPrice: null,
      SellingPrice: null,
      StockAvailableInInventory: null,
      ProductInformation: "",
      Composition: "",
      dosageForm: "",
      ProductStrength: "",
      PackageSize: "",
      schedule: "",
      Type: "",
      tax: 0,
      HSN_Code: "",
      storageConditions: "",
      image_url: [],
      // shelfLife: 0,
      PrescriptionRequired: false,
      featuredProduct: false,
      active: true,
      SafetyAdvices: "",
      StorageInstructions: "",
      productImage: null,
      ColdChain: "",
      GST: "",
      admin_id: admin?.id || "",
      DiscountedPrice: null,
      DiscountedPercentage: 0,
      productLength: 20,
      productBreadth: 20,
      productHeight: 5,
      productWeight: 0.4,
      subCategoryType: "",
      Coupons: null,
    });
    setSelectedImages([]);
  };
  const fileToBase64 = async (fileUri: string): Promise<string> => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result?.toString().split(",")[1];
          if (base64) {
            resolve(base64);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting file to base64:", error);
      throw error;
    }
  };
  const handleSubmit = async () => {
    try {
      let uploadedImageUrls: string[] = [];

      if (selectedImages.length > 0) {
        setUploadingImages(true);

        for (let i = 0; i < selectedImages.length; i++) {
          const file = selectedImages[i];
          try {
            if (!file.type.startsWith("image/")) {
              toast.error("Please upload only image files.");
              continue;
            }

            if (file.size > 5 * 1024 * 1024) {
              toast.error(`Image ${file.name} size should be less than 5MB.`);
              continue;
            }

            const fileUri = URL.createObjectURL(file);
            const fileContent = await fileToBase64(fileUri);

            const bucketName =
              process.env.NODE_ENV === "development"
                ? process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_DEV
                : process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_PROD;

            if (!bucketName) {
              throw new Error("S3 bucket name is not configured properly.");
            }

            const uploadRequest = {
              bucketName,
              folderPath: "products",
              fileName: `${Date.now()}_${i}_${file.name}`,
              fileContent,
            };

            const uploadRes = await uploadFile(token!, uploadRequest);
            uploadedImageUrls.push(uploadRes.result);

            URL.revokeObjectURL(fileUri);

            console.log(`Uploaded image ${i + 1}: ${uploadRes.result}`);
          } catch (error: any) {
            console.error(`Failed to upload image ${file.name}:`, error);
            toast.error(`Failed to upload ${file.name}: ${error.message}`);
          }
        }

        setUploadingImages(false);
      }

      const allImageUrls = [
        ...(formData.image_url || []),
        ...uploadedImageUrls,
      ];

      console.log("All image URLs:", allImageUrls);
      console.log("Current formData:", formData);

      const discountPercentage =
        formData.CostPrice !== null &&
        formData.CostPrice > 0 &&
        formData.SellingPrice !== null
          ? Math.round(
              ((formData.CostPrice - formData.SellingPrice) /
                formData.CostPrice) *
                100
            )
          : 0;

      if (isEditMode && onUpdateProduct) {
        const productJSON = {
          ...formData,
          admin_id: admin?.id,
          id: productToEdit?.id,
          DiscountedPercentage: discountPercentage,
          DiscountedPrice: formData.SellingPrice,
          status: formData.active ? "Active" : "Inactive",
          image_url: allImageUrls,
        };

        console.log("Product JSON for update:", productJSON);
        onUpdateProduct(productJSON);
        toast.success("Product updated successfully");
      } else {
        console.log("=== SUBMITTING NEW PRODUCT ===");
        console.log("Image URLs to send:", allImageUrls);
        console.log("Form data structure:", {
          ...formData,
          image_url: allImageUrls,
        });

        const completeProductData = {
          ...formData,
          admin_id: admin?.id,
          DiscountedPercentage: discountPercentage,
          DiscountedPrice: formData.SellingPrice,
          image_url: allImageUrls,
        };

        console.log(
          "Complete data being sent to addProductAPI:",
          completeProductData
        );

        const result = await addProductAPI(completeProductData, allImageUrls);

        console.log("API Response:", result);
        onAddProduct(result);
        toast.success("Product added successfully!");
      }

      // Only reset if it's not edit mode (preserve data for editing)
      if (!isEditMode) {
        handleReset();
      }
      onClose();
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });

      toast.error(
        `Failed to ${isEditMode ? "update" : "add"} product: ${
          error.message || "Please try again."
        }`
      );
    } finally {
      setUploadingImages(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-scroll no-scrollbar ">
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] transition-all duration-300 ease-in-out">
          <div key={tabAnimationKey} className="animate-fade-in">
            {activeTab === "Basic Information" && (
              <BasicInformationTab
                formData={formData}
                onInputChange={handleInputChange}
                categoryDropdownOpen={categoryDropdownOpen}
                setCategoryDropdownOpen={setCategoryDropdownOpen}
                subcategoryDropdownOpen={subcategoryDropdownOpen}
                setSubcategoryDropdownOpen={setSubcategoryDropdownOpen}
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
                symptomsDropdownOpen={symptomsDropdownOpen}
                setSymptomsDropdownOpen={setSymptomsDropdownOpen}
              />
            )}
          </div>
        </div>

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
              {uploadingImages
                ? "Uploading Images..."
                : isEditMode
                ? "Update Product"
                : "Add Product"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
