// store/productStore.ts
import { create } from "zustand";
import { Product } from "@/app/admin/dashboard/pharmacy/product/types/product";

interface ProductState {
  products: Product[];
  totalCount: number;
  statistics: {
    activeProducts: number;
    inactiveProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    featuredProducts: number;
    nonfeaturedProducts: number;
    totalCategories: number;
  };
  lastFetched: number | null; // Timestamp to track when data was last fetched
  loading: boolean;
  error: string | null;
  setProducts: (
    products: Product[],
    totalCount: number,
    statistics: any
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// 5 minutes in milliseconds
const CACHE_TTL = 5 * 60 * 1000;

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  totalCount: 0,
  statistics: {
    activeProducts: 0,
    inactiveProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    featuredProducts: 0,
    nonfeaturedProducts: 0,
    totalCategories: 0,
  },
  lastFetched: null,
  loading: false,
  error: null,
  setProducts: (products, totalCount, statistics) =>
    set({ products, totalCount, statistics, lastFetched: Date.now() }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
