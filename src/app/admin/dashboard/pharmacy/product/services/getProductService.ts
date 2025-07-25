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

/* ---------- API RESPONSE TYPES ---------- */

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
  Substitutes: string[];
  SimilarProducts: string[];
  ProductStrength: string;
  PackageSize: string;
  GST: string;
  Coupons: string;
  StockAvailableInInventory: number;
  InventoryUpdated: string;
  InventoryUpdatedBy: number;
  DiscountedPercentage: string;
  updated_by: number;
  archivedProduct: number;
  images: string[];
  HSN_Code: string;
  SKU: string;
  Subcategory: string;
  Category: string;
  featuredProduct: number;
}

/* ---------- MAPPER ---------- */

const mapApiResponseToProduct = (apiProduct: ProductApiResponse): Product => {
  const costPrice = parseFloat(apiProduct.CostPrice);
  const sellingPrice = parseFloat(apiProduct.SellingPrice);

  const calculatedDiscount =
    costPrice > 0 ? ((costPrice - sellingPrice) / costPrice) * 100 : 0;

  return {
    id: apiProduct.productId?.toString() || "",
    name: apiProduct.ProductName,
    code: `MED-${apiProduct.productId}`,
    category: apiProduct.Category,
    subcategory: apiProduct.Subcategory,
    brand: apiProduct.ManufacturerName,
    manufacturer: apiProduct.ManufacturerName,
    mrp: costPrice,
    SafetyAdvices: apiProduct.SafetyAdvices,
    sellingPrice: sellingPrice,
    discount: Math.round(calculatedDiscount),
    stock: apiProduct.StockAvailableInInventory,
    status: apiProduct.archivedProduct === 0 ? "Active" : "Inactive",
    featured: apiProduct.featuredProduct === 1,
    description: apiProduct.ProductInformation,
    composition: apiProduct.Composition,
    dosageForm: "",
    sku: apiProduct.SKU || "",
    ProductStrength: apiProduct.ProductStrength || "",
    PackageSize: apiProduct.PackageSize || "",
    schedule: apiProduct.ColdChain === "Yes" ? "Cold Chain" : "Non-Cold Chain",
    taxRate: parseFloat(apiProduct.GST),
    hsnCode: apiProduct.HSN_Code || "",
    storageConditions: apiProduct.SafetyAdvices,
    shelfLife: 0,
    Type: apiProduct.Type,
    prescriptionRequired: apiProduct.PrescriptionRequired === "Yes",
    saftyDescription: apiProduct.SafetyAdvices,
    storageDescription: apiProduct.StorageInstructions,
    createdAt: apiProduct.InventoryUpdated,
    productImage:
      Array.isArray(apiProduct.images) && apiProduct.images.length > 0
        ? apiProduct.images[0]
        : undefined,
    Substitutes: Array.isArray(apiProduct.Substitutes)
      ? apiProduct.Substitutes
      : [],
    SimilarProducts: Array.isArray(apiProduct.SimilarProducts)
      ? apiProduct.SimilarProducts
      : [],
    substitutesCount: Array.isArray(apiProduct.Substitutes)
      ? apiProduct.Substitutes.length
      : 0,
    similarCount: Array.isArray(apiProduct.SimilarProducts)
      ? apiProduct.SimilarProducts.length
      : 0,
  };
};

/* ---------- SERVICE ---------- */

export const productService = {
  /* ----- DELETE PRODUCT ----- */
  async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`/app/api/Product/deleteProduct/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw new Error(`Failed to delete product ${id}`);
    }
  },

  /* ----- GET ALL PRODUCTS (NO PAGINATION) ----- */
  async getAllProducts(): Promise<{
    products: Product[];
    totalCount: number;
  }> {
    try {
      const response = await apiClient.get("/app/api/Product/getProducts");

      const productsArray = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];
      console.log("Fetched Products:", productsArray);

      return {
        products: productsArray.map(mapApiResponseToProduct),
        totalCount: productsArray.length,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  },

  /* ----- UPDATE PRODUCT ----- */
  async updateProduct(id: string, data: ProductFormData): Promise<Product> {
    try {
      const payload = {
        ProductName: data.productName,
        CostPrice: (data.mrp ?? 0).toFixed(2),
        SellingPrice: (data.sellingPrice ?? 0).toFixed(2),
        DiscountedPrice: (data.sellingPrice ?? 0).toFixed(2),
        Type: data.Type,
        PrescriptionRequired: data.prescriptionRequired ? "Yes" : "No",
        ColdChain: data.schedule === "Cold Chain" ? "Yes" : "No",
        ManufacturerName: data.manufacturer,
        Composition: data.Composition,
        ProductInformation: data.description,
        SafetyAdvices: data.safetyDescription,
        StorageInstructions: data.storageDescription,
        Substitutes: data.Substitutes || [],
        SimilarProducts: data.SimilarProducts || [],
        GST: data.taxRate.toFixed(2),
        Coupons: "10",
        InventoryUpdated: new Date().toISOString(),
        InventoryUpdatedBy: 1,
        DiscountedPercentage: "5.00",
        updated_by: 1,
        archivedProduct: data.activeProduct ? 0 : 1,
        HSN_Code: data.HSN_Code,
        SKU: data.SKU,
        StockAvailableInInventory: data.stockQuantity,
        Category: data.Category,
        Subcategory: data.Subcategory,
        featuredProduct: data.featuredProduct ? 1 : 0,
        active: data.activeProduct ? 1 : 0,
        PackageSize: data.PackageSize,
        ProductStrength: data.ProductStrength,
        productLength: data.productLength ?? "0.00",
        productBreadth: data.productBreadth ?? "0.00",
        productHeight: data.productHeight ?? "0.00",
        productWeight: data.productWeight ?? "0.00",
      };

      console.log("Updating Product with Payload:", payload);

      const response = await apiClient.put(
        `/app/api/Product/updateProduct/${id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      return mapApiResponseToProduct(response.data);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw new Error(`Failed to update product ${id}`);
    }
  },
};
