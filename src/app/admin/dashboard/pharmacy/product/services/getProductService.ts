import axios from "axios";
import { Product } from "@/app/admin/dashboard/pharmacy/product/types/product";
import { ProductFormData } from "../types/productForm.type";
import { productStore } from "@/app/store/productStore";
import { useAdminStore } from "@/app/store/adminStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthHeaders = () => {
  const { token } = useAdminStore.getState();
  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

const productCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheItem {
  data: any;
  timestamp: number;
}

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
  ProductStrength: string;
  PackageSize: string;
  GST: string;
  active: boolean;
  Coupons: string;
  StockAvailableInInventory: number;
  InventoryUpdated: string;
  InventoryUpdatedBy: number;
  DiscountedPercentage: string;
  updated_by: number;
  archivedProduct: number;
  imageUrls: string[];
  HSN_Code: string;
  substitutes: any[];
  similarProducts: any[];
  SKU: string;
  Subcategory: string;
  Category: string;
  featuredProduct: boolean;
}

interface StatisticsResponse {
  activeProducts: string;
  inactiveProducts: string;
  inStockProducts: string;
  outOfStockProducts: string;
  featuredProducts: string;
  nonfeaturedProducts: string;
  totalCategories: number;
}

/* ---------- CACHE HELPERS ---------- */
const getFromCache = (key: string) => {
  const item = productCache.get(key) as CacheItem | undefined;
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

/* ---------- MAPPER ---------- */
const mapApiResponseToProduct = (apiProduct: ProductApiResponse): Product => {
  const costPrice = parseFloat(apiProduct.CostPrice);
  const sellingPrice = parseFloat(apiProduct.SellingPrice);

  const calculatedDiscount =
    costPrice > 0 ? ((costPrice - sellingPrice) / costPrice) * 100 : 0;

  return {
    id: apiProduct.productId
      ? apiProduct.productId.toString()
      : `fallback-${Date.now()}-${Math.random()}`,
    name: apiProduct.ProductName,
    code: apiProduct.SKU || `MED-${apiProduct.productId}`,
    category: apiProduct.Category,
    subcategory: apiProduct.Subcategory,
    brand: apiProduct.ManufacturerName,
    manufacturer: apiProduct.ManufacturerName,
    mrp: costPrice,
    SafetyAdvices: apiProduct.SafetyAdvices,
    sellingPrice: sellingPrice,
    discount: Math.round(calculatedDiscount),
    stock: apiProduct.StockAvailableInInventory,
    status: apiProduct.active === true ? "Active" : "Inactive",
    featured: apiProduct.featuredProduct === true,
    description: apiProduct.ProductInformation,
    composition: apiProduct.Composition,
    dosageForm: "",
    sku: apiProduct.SKU || "",
    ProductStrength: apiProduct.ProductStrength || "",
    PackageSize: apiProduct.PackageSize || "",
    schedule: apiProduct.ColdChain === "Yes" ? "Cold Chain" : "Non-Cold Chain",
    taxRate: parseFloat(apiProduct.GST || apiProduct.GST || "0"),
    hsnCode: apiProduct.HSN_Code || "",
    storageConditions: apiProduct.SafetyAdvices,
    shelfLife: 0,
    Type: apiProduct.Type,
    prescriptionRequired: apiProduct.PrescriptionRequired === "Yes",
    saftyDescription: apiProduct.SafetyAdvices,
    storageDescription: apiProduct.StorageInstructions,
    createdAt: apiProduct.InventoryUpdated,
    productImage:
      apiProduct.imageUrls && apiProduct.imageUrls.length > 0
        ? apiProduct.imageUrls[0]
        : undefined,
    Substitutes: Array.isArray(apiProduct.substitutes)
      ? apiProduct.substitutes.map((sub) =>
          typeof sub === "string" ? sub : sub.ProductName || sub.name || ""
        )
      : [],
    SimilarProducts: Array.isArray(apiProduct.similarProducts)
      ? apiProduct.similarProducts.map((sim) =>
          typeof sim === "string" ? sim : sim.ProductName || sim.name || ""
        )
      : [],
    substitutesCount: Array.isArray(apiProduct.substitutes)
      ? apiProduct.substitutes.length
      : 0,
    similarCount: Array.isArray(apiProduct.similarProducts)
      ? apiProduct.similarProducts.length
      : 0,
  };
};

export const productService = {
  /* ----- DELETE PRODUCT ----- */
  async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/Product/deleteProduct/${id}`, {
        headers: getAuthHeaders(),
      });
      this.clearCache();
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw new Error(`Failed to delete product ${id}`);
    }
  },

  /* ----- GET ALL PRODUCTS WITH PAGINATION & FILTERS ----- */
  async getAllProducts(
    start: number = 0,
    max: number = 20,
    filters: Record<string, any> = {}
  ): Promise<{
    products: Product[];
    totalCount: number;
    hasNextPage: boolean;
    statistics: {
      activeProducts: number;
      inactiveProducts: number;
      inStockProducts: number;
      outOfStockProducts: number;
      featuredProducts: number;
      nonfeaturedProducts: number;
      totalCategories: number;
    };
  }> {
    const cacheKey = `products_${start}_${max}_${JSON.stringify(filters)}`;
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("api-call", {
          detail: `Fetching products ${start}-${start + max} with filters`,
        })
      );
    }

    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await apiClient.post(
        `/api/Product/getProducts?start=${start}&max=${max}`,
        filters,
        { headers: getAuthHeaders() }
      );

      const productsArray = response.data.products || [];
      const statisticsArray = response.data.statistics || [];
      console.log("Fetched products:", productsArray);

      const mappedProducts = productsArray.map((product: ProductApiResponse) =>
        mapApiResponseToProduct(product)
      );

      const stats = statisticsArray[0] || {
        activeProducts: "0",
        inactiveProducts: "0",
        inStockProducts: "0",
        outOfStockProducts: "0",
        featuredProducts: "0",
        nonfeaturedProducts: "0",
        totalCategories: 0,
      };

      const statistics = {
        activeProducts: parseInt(stats.activeproducts),
        inactiveProducts: parseInt(stats.inactiveproducts),
        inStockProducts: parseInt(stats.instockproducts),
        outOfStockProducts: parseInt(stats.outofstockproducts),
        featuredProducts: parseInt(stats.featuredproducts),
        nonfeaturedProducts: parseInt(stats.nonfeaturedproducts),
        totalCategories: parseInt(stats.totalcategories.toString()),
      };

      const totalCount =
        statistics.activeProducts + statistics.inactiveProducts;
      const hasNextPage = start + max < totalCount;

      const result = {
        products: mappedProducts,
        totalCount,
        hasNextPage,
        statistics,
      };

      setToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error fetching paginated products:", error);
      throw new Error("Failed to fetch products");
    }
  },

  /* ----- GET STATISTICS ONLY ----- */
  async getStatistics(): Promise<{
    activeProducts: number;
    inactiveProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    featuredProducts: number;
    nonfeaturedProducts: number;
    totalCategories: number;
  }> {
    const cacheKey = "products_stats";
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await apiClient.post(
        `/api/Product/getProducts?start=0&max=1`,
        {},
        { headers: getAuthHeaders() } // Add this line
      );

      const statisticsArray = response.data.statistics || [];
      const stats = statisticsArray[0] || {
        activeProducts: "0",
        inactiveProducts: "0",
        inStockProducts: "0",
        outOfStockProducts: "0",
        featuredProducts: "0",
        nonfeaturedProducts: "0",
        totalCategories: 0,
      };

      const result = {
        activeProducts: parseInt(stats.activeproducts),
        inactiveProducts: parseInt(stats.inactiveproducts),
        inStockProducts: parseInt(stats.instockproducts),
        outOfStockProducts: parseInt(stats.outofstockproducts),
        featuredProducts: parseInt(stats.featuredproducts),
        nonfeaturedProducts: parseInt(stats.nonfeaturedproducts),
        totalCategories: parseInt(stats.totalcategories.toString()),
      };

      setToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw new Error("Failed to fetch statistics");
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

      const response = await apiClient.put(
        `/api/Product/updateProduct/${id}`,
        payload,
        { headers: getAuthHeaders() }
      );
      this.clearCache();

      return mapApiResponseToProduct(response.data);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw new Error(`Failed to update product ${id}`);
    }
  },

  /* ----- SEARCH PRODUCTS ----- */
  async searchProducts(query: string): Promise<Product[]> {
    const cacheKey = `search_${query}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await apiClient.get(
        `/api/Product/searchProducts?query=${encodeURIComponent(query)}`,
        { headers: getAuthHeaders() }
      );

      const productsArray = response.data.products || [];
      const mappedProducts = productsArray.map(
        (product: ProductApiResponse) => {
          return mapApiResponseToProduct(product);
        }
      );

      setToCache(cacheKey, mappedProducts);
      return mappedProducts;
    } catch (error) {
      console.error("Error searching products:", error);
      throw new Error("Failed to search products");
    }
  },

  /* ----- GET SINGLE PRODUCT ----- */
  async getProductById(id: string): Promise<Product> {
    const cacheKey = `product_${id}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await apiClient.get(
        `/api/Product/getProduct/${id}`,
        { headers: getAuthHeaders() } // Add this line
      );
      const product = mapApiResponseToProduct(response.data);
      setToCache(cacheKey, product);
      return product;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw new Error(`Failed to fetch product ${id}`);
    }
  },

  /* ----- CLEAR CACHE ----- */
  clearCache(): void {
    productCache.clear();
  },
};
export const getProductsWithPagination = async (
  start: number,
  max: number,
  token: string | undefined,
  filters: {
    searchCategory?: string | null;
    searchTerm?: string | null;
    filter_manufacturer?: string[] | null;
    filter_product_name?: string[] | null;
    filter_availability?: boolean | null;
    filter_subcategory?: string[] | null;
    filter_composition?: string[] | null;
    filter_prescription_reqd?: boolean | null;
    sort_by?: string | null;
    sort_order?: string | null;
  } = {}
) => {
  try {
    const requestBody = {
      searchCategory: filters.searchCategory || null,
      searchTerm: filters.searchTerm || null,
      filter_manufacturer: filters.filter_manufacturer || null,
      filter_product_name: filters.filter_product_name || null,
      filter_subcategory: filters.filter_subcategory || null,
      filter_composition: filters.filter_composition || null,
      filter_availability:
        filters.filter_availability !== undefined
          ? filters.filter_availability
          : null,
      filter_prescription_reqd:
        filters.filter_prescription_reqd !== undefined
          ? filters.filter_prescription_reqd
          : null,
      sort_by: filters.sort_by || null,
      sort_order: filters.sort_order || null,
    };
    console.log(requestBody, "requestbody");
    const response = await axios.post(
      `${API_BASE_URL}/api/Product/getProducts?start=${start}&max=${max}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
