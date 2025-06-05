// services/productService.ts
import axios from "axios";
import { Product } from "@/app/admin/dashboard/pharmacy/product/types/product";

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
}

// Map API response to Product interface
const mapApiResponseToProduct = (apiProduct: ProductApiResponse): Product => {
  const sellingPrice = parseFloat(apiProduct.SellingPrice);
  const costPrice = parseFloat(apiProduct.CostPrice);
  const discountPercentage = parseFloat(apiProduct.DiscountedPercentage);

  // Calculate discount if not provided or is 0
  const calculatedDiscount =
    discountPercentage > 0
      ? discountPercentage
      : ((costPrice - sellingPrice) / costPrice) * 100;

  return {
    id: apiProduct.productId.toString(),
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
      apiProduct.images.length > 0 ? apiProduct.images[0] : undefined,
    substitutes: apiProduct.Substitutes.includes("Available") ? 1 : 0,
    similar: apiProduct.SimilarProducts.includes("Available") ? 1 : 0,
    substitutesCount: 0, // <-- Add placeholder or actual value if available
    similarCount: 0, // <-- Add placeholder or actual value if available
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

  async getAllProducts(
    page: number = 1,
    pageSize: number = 5
  ): Promise<{ products: Product[]; totalCount: number }> {
    try {
      const response = await apiClient.get("/app/api/Product/getProducts");

      // Handle both response formats:
      const productsArray = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];

      return {
        products: productsArray.map(mapApiResponseToProduct),
        totalCount: response.data.totalCount || productsArray.length,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  },
};
