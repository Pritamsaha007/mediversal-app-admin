import axios from "axios";
import { useAdminStore } from "@/app/store/adminStore";
import {
  Product,
  ProductSearchParams,
  Statistics,
  UpsertProductPayload,
} from "../types/product";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const productCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000;

interface GetProductsResponse {
  success: boolean;
  products: Product[];
  statistics: Statistics[];
}

const getCurrentUserId = (): string => {
  const { admin } = useAdminStore.getState();
  return admin?.id;
};

const getFromCache = (key: string) => {
  const item = productCache.get(key);
  if (!item) return null;

  if (Date.now() - item.timestamp > CACHE_TTL) {
    productCache.delete(key);
    return null;
  }

  return item.data;
};

const setToCache = (key: string, data: any) => {
  productCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

export const clearProductCache = () => {
  productCache.clear();
};

const getAuthHeaders = () => {
  const { token } = useAdminStore.getState();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const addProductAPI = async (
  productData: Product,
  imageUrls: string[] = []
): Promise<any> => {
  try {
    const userId = getCurrentUserId();
    const payload: UpsertProductPayload = {
      id: null,
      ProductName: productData.ProductName || "",
      CostPrice: parseFloat(productData.CostPrice?.toString() || "0"),
      SellingPrice: parseFloat(productData.SellingPrice?.toString() || "0"),
      DiscountedPrice: parseFloat(productData.SellingPrice?.toString() || "0"),
      Type: productData.Type || "Tablet",
      PrescriptionRequired: productData.PrescriptionRequired,
      ColdChain: productData.ColdChain || "No",
      ManufacturerName: productData.ManufacturerName || "Generic Manufacturer",
      Composition: productData.Composition || "Standard Composition",
      ProductInformation:
        productData.ProductInformation || "Product Information",
      SafetyAdvices:
        productData.SafetyAdvices || "Follow standard safety guidelines",
      StorageInstructions:
        productData.StorageInstructions || "Store in cool, dry place",
      GST: productData.GST || "18",
      Coupons: productData.Coupons || "5",
      Category: productData.Category || "Medicine",
      Subcategory: productData.Subcategory || "General",
      subCategoryType: productData.subCategoryType || "",
      DiscountedPercentage: parseFloat(
        productData.DiscountedPercentage?.toString() || "0"
      ),
      HSN_Code: productData.HSN_Code || "",
      SKU: productData.SKU || "",
      StockAvailableInInventory: parseInt(
        productData.StockAvailableInInventory?.toString() || "0"
      ),
      productLength: parseFloat(productData.productLength?.toString() || "20"),
      productBreadth: parseFloat(
        productData.productBreadth?.toString() || "20"
      ),
      productHeight: parseFloat(productData.productHeight?.toString() || "5"),
      productWeight: parseFloat(productData.productWeight?.toString() || "0.4"),
      tax: parseFloat(productData.tax?.toString() || "0"),
      ProductStrength: productData.ProductStrength || "",
      PackageSize: productData.PackageSize || "",
      featuredProduct: Boolean(productData.featuredProduct),
      active: Boolean(productData.active),
      image_url: imageUrls.length > 0 ? imageUrls : undefined,
      archivedProduct: false,
      InventoryUpdatedBy: "",
      created_by: "",
      updated_by: "",
      is_deleted: false,
      dosageForm: productData.dosageForm || "",
      schedule: productData.schedule || "",
      storageConditions: productData.storageConditions || "",
    };

    console.log("Add product payload:", payload);

    const response = await axios.post(`${API_BASE_URL}/api/product/`, payload, {
      headers: getAuthHeaders(),
    });

    clearProductCache();
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Add product error:", error.response?.data);
      throw new Error(error.response?.data?.message || "Failed to add product");
    }
    console.error("Add product error:", error);
    throw error;
  }
};

export const updateProductAPI = async (id: string, data: any): Promise<any> => {
  try {
    const userId = getCurrentUserId();
    const payload: UpsertProductPayload = {
      id,
      ProductName: data.ProductName || "",
      CostPrice: parseFloat(data.CostPrice?.toString() || "0"),
      SellingPrice: parseFloat(data.SellingPrice?.toString() || "0"),
      DiscountedPrice: parseFloat(
        data.DiscountedPrice?.toString() || data.SellingPrice || "0"
      ),
      Type: data.Type || "Tablet",
      PrescriptionRequired: data.PrescriptionRequired,
      ColdChain: data.ColdChain || "No",
      ManufacturerName: data.ManufacturerName || "",
      Composition: data.Composition || "",
      ProductInformation: data.ProductInformation || "",
      SafetyAdvices: data.SafetyAdvices || "",
      StorageInstructions: data.StorageInstructions || "",
      GST: data.GST || "18",
      Coupons: data.Coupons || "5",
      Category: data.Category || "",
      Subcategory: data.Subcategory || "",
      subCategoryType: data.subCategoryType || "",
      DiscountedPercentage: parseFloat(
        data.DiscountedPercentage?.toString() || "0"
      ),
      HSN_Code: data.HSN_Code || "",
      SKU: data.SKU || "",
      StockAvailableInInventory: parseInt(
        data.StockAvailableInInventory?.toString() || "0"
      ),
      productLength: parseFloat(data.productLength?.toString() || "20"),
      productBreadth: parseFloat(data.productBreadth?.toString() || "20"),
      productHeight: parseFloat(data.productHeight?.toString() || "5"),
      productWeight: parseFloat(data.productWeight?.toString() || "0.4"),
      tax: parseFloat(data.tax?.toString() || "0"),
      ProductStrength: data.ProductStrength || "",
      PackageSize: data.PackageSize || "",
      featuredProduct: Boolean(data.featuredProduct),
      active: Boolean(data.active),
      image_url: data.image_url || [],
      archivedProduct: !Boolean(data.active),
      InventoryUpdatedBy: "",
      updated_by: "",
      is_deleted: false,
      dosageForm: data.dosageForm || "",
      schedule: data.schedule || "",
      storageConditions: data.storageConditions || "",
    };

    console.log("Update product payload:", payload);

    const response = await axios.post(`${API_BASE_URL}/api/product/`, payload, {
      headers: getAuthHeaders(),
    });

    clearProductCache();
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Update product error:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to update product"
      );
    }
    console.error("Update product error:", error);
    throw error;
  }
};

export const deleteProductAPI = async (id: string): Promise<any> => {
  try {
    const userId = getCurrentUserId();
    const searchParams: ProductSearchParams = {
      product_id: id,
      start: 0,
      max: 1,
    };

    const searchResponse = await axios.post(
      `${API_BASE_URL}/api/product/search`,
      searchParams,
      { headers: getAuthHeaders() }
    );

    if (!searchResponse.data.products?.[0]) {
      throw new Error("Product not found");
    }

    const product = searchResponse.data.products[0];

    const updatePayload: UpsertProductPayload = {
      id,
      ProductName: product.ProductName,
      CostPrice: parseFloat(product.CostPrice),
      SellingPrice: parseFloat(product.SellingPrice),
      DiscountedPrice: parseFloat(product.DiscountedPrice),
      Type: product.Type,
      PrescriptionRequired: product.PrescriptionRequired,
      ColdChain: product.ColdChain,
      ManufacturerName: product.ManufacturerName,
      Composition: product.Composition,
      ProductInformation: product.ProductInformation,
      SafetyAdvices: product.SafetyAdvices,
      StorageInstructions: product.StorageInstructions,
      GST: product.GST,
      Coupons: product.Coupons || "5",
      Category: product.Category,
      Subcategory: product.Subcategory,
      subCategoryType: product.subCategoryType || "",
      DiscountedPercentage: parseFloat(product.DiscountedPercentage),
      HSN_Code: product.HSN_Code || "",
      SKU: product.SKU,
      StockAvailableInInventory: product.StockAvailableInInventory,
      productLength: parseFloat(product.productLength),
      productBreadth: parseFloat(product.productBreadth),
      productHeight: parseFloat(product.productHeight),
      productWeight: parseFloat(product.productWeight),
      tax: parseFloat(product.tax),
      ProductStrength: product.ProductStrength || "",
      PackageSize: product.PackageSize || "",
      featuredProduct: product.featuredProduct,
      active: product.active,
      image_url: product.image_url || [],
      archivedProduct: product.archivedProduct,
      InventoryUpdatedBy: "",
      updated_by: "",
      is_deleted: true,
      dosageForm: product.dosageForm || "",
      schedule: product.schedule || "",
      storageConditions: product.storageConditions || "",
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/product/`,
      updatePayload,
      { headers: getAuthHeaders() }
    );

    clearProductCache();
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Delete product error:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to delete product"
      );
    }
    console.error("Delete product error:", error);
    throw error;
  }
};

export const getProductsWithPaginationAPI = async (
  start: number = 0,
  max: number = 20,
  filters: ProductSearchParams = {}
): Promise<GetProductsResponse> => {
  const cacheKey = `products_${start}_${max}_${JSON.stringify(filters)}`;

  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    console.log("Returning cached products data");
    return cachedData;
  }

  try {
    const searchParams: ProductSearchParams = {
      start,
      max,
      ...filters,
    };

    console.log("Fetching products with params:", searchParams);

    const response = await axios.post<GetProductsResponse>(
      `${API_BASE_URL}/api/product/search`,
      searchParams,
      { headers: getAuthHeaders() }
    );

    console.log("Products API response:", response.data);

    setToCache(cacheKey, response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Get products error:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
    console.error("Get products error:", error);
    throw error;
  }
};

export const getProductByIdAPI = async (id: string): Promise<Product> => {
  const cacheKey = `product_${id}`;

  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    console.log("Returning cached product data");
    return cachedData;
  }

  try {
    const searchParams: ProductSearchParams = {
      product_id: id,
      start: 0,
      max: 1,
    };

    const response = await axios.post<GetProductsResponse>(
      `${API_BASE_URL}/api/product/search`,
      searchParams,
      { headers: getAuthHeaders() }
    );

    if (!response.data.products?.[0]) {
      throw new Error("Product not found");
    }

    const product = response.data.products[0];

    setToCache(cacheKey, product);

    return product;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
    throw error;
  }
};
