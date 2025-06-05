// services/productService.ts
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const addProductAPI = async (productData: any, imageFile?: File) => {
  try {
    const formData = new FormData();

    // Map your form fields to API fields
    formData.append("admin_id", "1");
    formData.append("ProductName", productData.productName || "");
    formData.append("CostPrice", productData.mrp?.toString() || "0");
    formData.append(
      "SellingPrice",
      productData.sellingPrice?.toString() || "0"
    );
    formData.append(
      "DiscountedPrice",
      productData.sellingPrice?.toString() || "0"
    );
    formData.append("Type", productData.category || "Medicine");
    formData.append(
      "PrescriptionRequired",
      productData.prescriptionRequired ? "Yes" : "No"
    );
    formData.append("ColdChain", "No");
    formData.append(
      "ManufacturerName",
      productData.manufacturer || "Generic Manufacturer"
    );
    formData.append(
      "Composition",
      productData.composition || "Standard Composition"
    );
    formData.append(
      "ProductInformation",
      productData.description || "Product Information"
    );
    formData.append(
      "SafetyAdvices",
      productData.saftyDescription || "Follow standard safety guidelines"
    );
    formData.append(
      "StorageInstructions",
      productData.storageDescription || "Store in cool, dry place"
    );
    formData.append("Substitutes", "Generic Substitutes Available");
    formData.append("SimilarProducts", "Similar Products Available");
    formData.append("GST", productData.taxRate?.toString() || "18");
    formData.append("Coupons", "5");
    formData.append(
      "AvailableInInventory",
      productData.stockQuantity?.toString() || "0"
    );
    formData.append(
      "InventoryUpdated",
      productData.stockQuantity?.toString() || "0"
    );

    if (imageFile) {
      formData.append("images", imageFile);
    }

    const response = await axios.post(
      `${API_BASE_URL}/app/api/Product/addProduct`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to add product");
    }
    console.error("Error adding product:", error);
    throw error;
  }
};
