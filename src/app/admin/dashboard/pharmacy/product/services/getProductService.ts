// services/productService.ts
import axios from "axios";
import { Product } from "@/app/admin/dashboard/pharmacy/product/types/product";
import { ProductFormData } from "../types/productForm.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API Response interface
interface ProductApiResponse {
  productId: number;
  ProductName: string;
  CostPrice: string;
  SellingPrice: string;
  DiscountedPrice: string;
  Type: string;
  PrescriptionRequired: string;
  ColdChain: string;
  ManufacturerName: string;
  Composition: string;
  ProductInformation: string;
  SafetyAdvices: string;
  StorageInstructions: string;
  Substitutes: string;
  SimilarProducts: string;
  GST: string;
  Coupons: string;
  AvailableInInventory: number;
  InventoryUpdated: string;
  InventoryUpdatedBy: number;
  DiscountedPercentage: string;
  updated_by: number;
  archivedProduct: number;
  images: string[];
  HSN_Code: string;
  SKU: string;
}

// Map API response to Product interface
const mapApiResponseToProduct = (apiProduct: ProductApiResponse): Product => {
  const sellingPrice = parseFloat(apiProduct.SellingPrice);
  const costPrice = parseFloat(apiProduct.CostPrice);
  const discountPercentage = parseFloat(apiProduct.DiscountedPercentage);

  const calculatedDiscount =
    discountPercentage > 0
      ? discountPercentage
      : ((costPrice - sellingPrice) / costPrice) * 100;

  return {
    id: apiProduct.productId?.toString() || "",
    name: apiProduct.ProductName,
    code: `MED-${apiProduct.productId}`,
    category: apiProduct.Type,
    subcategory: apiProduct.Type,
    brand: "",
    manufacturer: apiProduct.ManufacturerName,
    mrp: costPrice,
    sellingPrice: sellingPrice,
    discount: Math.round(calculatedDiscount),
    stock: apiProduct.AvailableInInventory,
    status: apiProduct.archivedProduct === 0 ? "Active" : "Inactive",
    featured: false,
    description: apiProduct.ProductInformation,
    composition: apiProduct.Composition,
    dosageForm: "",
    sku: apiProduct.SKU,
    strength: "",
    packSize: "",
    schedule: "",
    taxRate: parseFloat(apiProduct.GST),
    hsnCode: "",
    storageConditions: apiProduct.StorageInstructions,
    shelfLife: 0,
    prescriptionRequired: apiProduct.PrescriptionRequired === "Yes",
    saftyDescription: apiProduct.SafetyAdvices,
    storageDescription: apiProduct.StorageInstructions,
    createdAt: apiProduct.InventoryUpdated,
    productImage:
      Array.isArray(apiProduct.images) && apiProduct.images.length > 0
        ? apiProduct.images[0]
        : undefined,

    substitutes: apiProduct.Substitutes?.includes("Available") ? 1 : 0,
    similar: apiProduct.SimilarProducts?.includes("Available") ? 1 : 0,
    substitutesCount: 1,
    similarCount: 1,
  };
};

export const productService = {
  // Add to productService.ts
  async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`/app/api/Product/deleteProduct/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw new Error(`Failed to delete product ${id}`);
    }
  },

  // Update getAllProducts to properly handle pagination
  async getAllProducts(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ products: Product[]; totalCount: number }> {
    try {
      const response = await apiClient.get("/app/api/Product/getProducts");

      const productsArray = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];

      // Implement client-side pagination if API doesn't support it
      const startIndex = (page - 1) * pageSize;
      const paginatedProducts = productsArray.slice(
        startIndex,
        startIndex + pageSize
      );

      return {
        products: paginatedProducts.map(mapApiResponseToProduct),
        totalCount: productsArray.length, // Total available products
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  },

  // Add to productService.ts
  async updateProduct(
    id: string,
    productData: ProductFormData
  ): Promise<Product> {
    try {
      const payload = {
        ProductName: productData.productName,
        CostPrice: productData.mrp.toFixed(2),
        SellingPrice: productData.sellingPrice.toFixed(2),
        DiscountedPrice: productData.sellingPrice.toFixed(2), // assuming discounted = selling
        Type: productData.category,
        PrescriptionRequired: productData.prescriptionRequired ? "Yes" : "No",
        ColdChain: "No", // or from form
        ManufacturerName: productData.manufacturer,
        Composition: productData.composition,
        ProductInformation: productData.description,
        SafetyAdvices: productData.saftyDescription,
        StorageInstructions: productData.storageDescription,
        GST: productData.taxRate.toFixed(2),
        Coupons: "5", // or dynamic if needed
        AvailableInInventory: productData.stockQuantity,
        InventoryUpdated: new Date().toISOString(), // or from form if needed
        InventoryUpdatedBy: 1, // or from user context
        DiscountedPercentage: "0.00", // can be calculated
        updated_by: 1,
        archivedProduct: productData.activeProduct ? 0 : 1,
        HSN_Code: productData.HSN_Code || null,
        SKU: productData.SKU || null,
      };

      const response = await apiClient.put(
        `/app/api/Product/updateProduct/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return mapApiResponseToProduct(response.data);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw new Error(`Failed to update product ${id}`);
    }
  },
};
