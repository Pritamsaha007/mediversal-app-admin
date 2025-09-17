import axios from "axios";
import { useAdminStore } from "@/app/store/adminStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const dashboardApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth headers helper using your existing admin store
const getAuthHeaders = () => {
  const { token } = useAdminStore.getState();
  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// Product Statistics Interface
export interface ProductStatistics {
  activeProducts: number;
  inactiveProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  featuredProducts: number;
  nonFeaturedProducts: number;
  totalCategories: number;
}

// API Response Interface
interface StatisticsApiResponse {
  statistics: Array<{
    activeproducts: string;
    inactiveproducts: string;
    instockproducts: string;
    outofstockproducts: string;
    featuredproducts: string;
    nonfeaturedproducts: string;
    totalcategories: string | number;
  }>;
}

export const dashboardService = {
  /**
   * Get product statistics from the existing product API
   */
  async getProductStatistics(): Promise<ProductStatistics> {
    try {
      console.log("Fetching product statistics...");

      const response = await dashboardApiClient.post<StatisticsApiResponse>(
        `/api/Product/getProducts?start=0&max=5`,
        {}, // empty body for filters
        {
          headers: getAuthHeaders(),
          timeout: 10000, // 10 second timeout
        }
      );

      const statisticsArray = response.data.statistics || [];

      if (statisticsArray.length === 0) {
        throw new Error("No statistics data received from API");
      }

      const stats = statisticsArray[0];

      // Parse and validate the statistics
      const productStatistics: ProductStatistics = {
        activeProducts: parseInt(stats.activeproducts) || 0,
        inactiveProducts: parseInt(stats.inactiveproducts) || 0,
        inStockProducts: parseInt(stats.instockproducts) || 0,
        outOfStockProducts: parseInt(stats.outofstockproducts) || 0,
        featuredProducts: parseInt(stats.featuredproducts) || 0,
        nonFeaturedProducts: parseInt(stats.nonfeaturedproducts) || 0,
        totalCategories: parseInt(stats.totalcategories?.toString()) || 0,
      };

      console.log(
        "Product statistics fetched successfully:",
        productStatistics
      );
      return productStatistics;
    } catch (error) {
      console.error("Error fetching product statistics:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (error.response?.status === 403) {
          throw new Error("Access denied. Insufficient permissions.");
        } else if (
          error.response &&
          typeof error.response.status === "number" &&
          error.response.status >= 500
        ) {
          throw new Error("Server error. Please try again later.");
        } else if (error.code === "ECONNABORTED") {
          throw new Error("Request timed out. Please check your connection.");
        } else {
          throw new Error(
            `API Error: ${error.response?.statusText || error.message}`
          );
        }
      }

      throw new Error("Failed to fetch product statistics. Please try again.");
    }
  },

  isAuthenticated(): boolean {
    const { isLoggedIn, token } = useAdminStore.getState();
    return isLoggedIn && !!token;
  },
  getCurrentUser() {
    const { admin } = useAdminStore.getState();
    return admin;
  },
};

export default dashboardService;
