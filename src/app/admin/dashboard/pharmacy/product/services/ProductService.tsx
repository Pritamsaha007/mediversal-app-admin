import axios from "axios";
import {
  CacheItem,
  Product,
  ProductApiResponse,
} from "@/app/admin/dashboard/pharmacy/product/types/product";
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
const CACHE_TTL = 5 * 60 * 1000;

export const addProductAPI = async (
  productData: any,
  imageUrls: string[] = []
) => {
  try {
    const { token } = useAdminStore.getState();
    const formData = new FormData();

    formData.append("admin_id", productData.admin_id || "1");
    formData.append("ProductName", productData.ProductName || "");
    formData.append("CostPrice", productData.CostPrice?.toString() || "0");
    formData.append(
      "SellingPrice",
      productData.SellingPrice?.toString() || "0"
    );
    formData.append(
      "DiscountedPrice",
      productData.SellingPrice?.toString() || "0"
    );
    formData.append("Category", productData.Category || "Medicine");
    formData.append("Type", productData.Type || "Type Default");
    formData.append(
      "Subcategory",
      productData.Subcategory || "Sub Category Default"
    );
    formData.append(
      "PrescriptionRequired",
      productData.PrescriptionRequired ? "Yes" : "No"
    );
    formData.append("ColdChain", productData.ColdChain || "No");
    formData.append(
      "ManufacturerName",
      productData.ManufacturerName || "Generic Manufacturer"
    );
    formData.append(
      "Composition",
      productData.Composition || "Standard Composition"
    );
    formData.append(
      "ProductInformation",
      productData.ProductInformation || "Product Information"
    );
    formData.append(
      "SafetyAdvices",
      productData.SafetyAdvices || "Follow standard safety guidelines"
    );
    formData.append(
      "StorageInstructions",
      productData.StorageInstructions || "Store in cool, dry place"
    );
    formData.append("Substitutes", "Generic Substitutes Available");
    formData.append("SimilarProducts", "Similar Products Available");
    formData.append("GST", productData.GST || "18");
    formData.append("Coupons", "5");
    formData.append(
      "StockAvailableInInventory",
      productData.StockAvailableInInventory?.toString() || "0"
    );
    formData.append("HSN_Code", productData.HSN_Code || "");
    formData.append("SKU", productData.SKU || "");
    formData.append("PackageSize", productData.PackageSize || "");
    formData.append("ProductStrength", productData.ProductStrength || "");
    formData.append("featuredProduct", productData.featuredProduct ? "1" : "0");
    formData.append("active", productData.active ? "1" : "0");
    formData.append(
      "productLength",
      productData.productLength?.toString() || "20"
    );
    formData.append(
      "productBreadth",
      productData.productBreadth?.toString() || "20"
    );
    formData.append(
      "productHeight",
      productData.productHeight?.toString() || "5"
    );
    formData.append(
      "productWeight",
      productData.productWeight?.toString() || "0.4"
    );
    formData.append("subCategoryType", productData.subCategoryType || "");
    formData.append("tax", productData.tax?.toString() || "0");
    formData.append("dosageForm", productData.dosageForm || "");
    formData.append("schedule", productData.schedule || "");
    formData.append("storageConditions", productData.storageConditions || "");
    formData.append(
      "DiscountedPercentage",
      productData.DiscountedPercentage?.toString() || "0"
    );

    if (imageUrls.length > 0) {
      formData.append("image_url", JSON.stringify(imageUrls));
      console.log(
        "Sending image_url as JSON string:",
        JSON.stringify(imageUrls)
      );
    } else {
      formData.append("image_url", "[]");
    }

    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/Product/addProduct`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
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
    ColdChain: apiProduct.ColdChain,
    taxRate: parseFloat(apiProduct.tax),
    GST: apiProduct.GST,
    //sheltfLife: apiProduct.shelfLife || 0,
    hsnCode: apiProduct.HSN_Code || "",
    storageConditions: apiProduct.SafetyAdvices,

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
  } as unknown as Product;
};

export const productService = {
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

  async updateProduct(id: string, data: ProductFormData): Promise<Product> {
    try {
      const payload = {
        ProductName: data.ProductName,
        CostPrice: (data.CostPrice ?? 0).toFixed(2),
        SellingPrice: (data.SellingPrice ?? 0).toFixed(2),
        DiscountedPrice: (
          data.DiscountedPrice ??
          data.SellingPrice ??
          0
        ).toFixed(2),
        Type: data.Type,
        PrescriptionRequired: data.PrescriptionRequired ? "Yes" : "No",
        ColdChain: data.ColdChain || "No",
        ManufacturerName: data.ManufacturerName,
        Composition: data.Composition,
        ProductInformation: data.ProductInformation,
        SafetyAdvices: data.SafetyAdvices,
        StorageInstructions: data.StorageInstructions,
        Substitutes: data.Substitutes || [],
        SimilarProducts: data.SimilarProducts || [],
        GST: data.GST || "18",
        Coupons: data.Coupons || "5",
        InventoryUpdated: new Date().toISOString(),
        InventoryUpdatedBy: data.admin_id || "1",
        DiscountedPercentage: (data.DiscountedPercentage ?? 0).toFixed(2),
        updated_by: data.admin_id || "1",
        archivedProduct: data.active ? 0 : 1,
        HSN_Code: data.HSN_Code,
        SKU: data.SKU,
        StockAvailableInInventory: data.StockAvailableInInventory ?? 0,
        Category: data.Category,
        Subcategory: data.Subcategory,
        subCategoryType: data.subCategoryType || "",
        featuredProduct: data.featuredProduct ? 1 : 0,
        active: data.active ? 1 : 0,
        PackageSize: data.PackageSize,
        ProductStrength: data.ProductStrength,
        productLength: (data.productLength ?? 20).toFixed(2),
        productBreadth: (data.productBreadth ?? 20).toFixed(2),
        productHeight: (data.productHeight ?? 5).toFixed(2),
        productWeight: (data.productWeight ?? 0.4).toFixed(2),
        // Additional fields
        dosageForm: data.dosageForm || "",
        schedule: data.schedule || "",
        storageConditions: data.storageConditions || "",
        // shelfLife: data.shelfLife ?? 0,
        tax: (data.tax ?? 0).toFixed(2),
        admin_id: data.admin_id || "1",
      };

      console.log("Update payload:", payload);

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

  async getProductById(id: string): Promise<Product> {
    const cacheKey = `product_${id}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await apiClient.get(`/api/Product/getProduct/${id}`, {
        headers: getAuthHeaders(),
      });
      const product = mapApiResponseToProduct(response.data);
      setToCache(cacheKey, product);
      return product;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw new Error(`Failed to fetch product ${id}`);
    }
  },

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
