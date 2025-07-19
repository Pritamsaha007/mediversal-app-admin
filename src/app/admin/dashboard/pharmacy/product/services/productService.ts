import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const addProductAPI = async (
  productData: any,
  imageFiles: File[] = []
) => {
  try {
    const formData = new FormData();

    // Required fields
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
    formData.append("Category", productData.Category || "Medicine");
    formData.append("Type", productData.Type || "Type Default");
    formData.append(
      "Subcategory",
      productData.Subcategory || "Sub Default hai "
    );
    formData.append(
      "PrescriptionRequired",
      productData.prescriptionRequired ? "Yes" : "No"
    );
    formData.append("ColdChain", "No");

    // Manufacturer & composition
    formData.append(
      "ManufacturerName",
      productData.manufacturer || "Generic Manufacturer"
    );
    formData.append(
      "Composition",
      productData.composition || "Standard Composition"
    );

    // Description fields
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

    // Substitutes & similar
    formData.append("Substitutes", "Generic Substitutes Available");
    formData.append("SimilarProducts", "Similar Products Available");

    // Tax & inventory
    formData.append("GST", productData.taxRate?.toString() || "18");
    formData.append("Coupons", "5");
    formData.append(
      "StockAvailableInInventory",
      productData.stockQuantity || 0
    );
    formData.append("HSN_Code", productData.HSN_Code || "");
    formData.append("SKU", productData.SKU || "");
    formData.append("PackageSize", productData.PackageSize || "");
    formData.append("ProductStrength", productData.ProductStrength || "");

    // Optional image
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file, index) => {
        formData.append(`images`, file);
      });
    }

    for (const [k, v] of formData.entries()) {
      console.log(k, v);
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
