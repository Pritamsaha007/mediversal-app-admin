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
    code: `MED-${apiProduct.productId}`, // Generate code since not provided
    category: apiProduct.Type,
    subcategory: apiProduct.Type, // Using Type as subcategory since specific subcategory not provided
    brand: "", // Not provided in API
    manufacturer: apiProduct.ManufacturerName,
    mrp: costPrice,
    sellingPrice: sellingPrice,
    discount: Math.round(calculatedDiscount),
    stock: apiProduct.AvailableInInventory,
    status: apiProduct.archivedProduct === 0 ? "Active" : "Inactive",
    featured: false, // Not provided in API, defaulting to false
    description: apiProduct.ProductInformation,
    composition: apiProduct.Composition,
    dosageForm: "", // Not provided in API
    strength: "", // Not provided in API
    packSize: "", // Not provided in API
    schedule: "", // Not provided in API
    taxRate: parseFloat(apiProduct.GST),
    hsnCode: "", // Not provided in API
    storageConditions: apiProduct.StorageInstructions,
    shelfLife: 0, // Not provided in API
    prescriptionRequired: apiProduct.PrescriptionRequired === "Yes",
    saftyDescription: apiProduct.SafetyAdvices,
    storageDescription: apiProduct.StorageInstructions,
    createdAt: apiProduct.InventoryUpdated,
    productImage: apiProduct.images.length > 0 ? apiProduct.images[0] : null,
    // Parse substitutes and similar products count from strings
    substitutes: apiProduct.Substitutes.includes("Available") ? 1 : 0,
    similar: apiProduct.SimilarProducts.includes("Available") ? 1 : 0,
  };
};

export const productService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get("/app/api/Product/getProducts");

      if (Array.isArray(response.data)) {
        return response.data.map(mapApiResponseToProduct);
      } else {
        console.error("API response is not an array:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  },
};
