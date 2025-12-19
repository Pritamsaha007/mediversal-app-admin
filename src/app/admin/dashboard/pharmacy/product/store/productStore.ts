// store/productStore.ts
import { create } from "zustand";
import { Product } from "../types/product";

interface ProductCache {
  data: any;
  timestamp: number;
}

interface ProductStoreState {
  products: Product[];
  statistics: {
    activeProducts: number;
    inactiveProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    featuredProducts: number;
    nonfeaturedProducts: number;
    totalCategories: number;
  };
  loading: boolean;
  error: string | null;

  // Cache management
  cache: Map<string, ProductCache>;
  setCache: (key: string, data: any) => void;
  getCache: (key: string) => any | null;
  clearCache: () => void;

  // Store updaters
  setProducts: (products: Product[]) => void;
  setStatistics: (stats: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProduct: (updatedProduct: Product) => void;
  removeProduct: (productId: string) => void;
  addProduct: (newProduct: Product) => void;
}

export const useProductStore = create<ProductStoreState>((set, get) => ({
  products: [],
  statistics: {
    activeProducts: 0,
    inactiveProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    featuredProducts: 0,
    nonfeaturedProducts: 0,
    totalCategories: 0,
  },
  loading: false,
  error: null,

  // Cache with 5 minute TTL
  cache: new Map(),

  setCache: (key: string, data: any) => {
    set((state) => ({
      cache: new Map(state.cache).set(key, {
        data,
        timestamp: Date.now(),
      }),
    }));
  },

  getCache: (key: string) => {
    const cached = get().cache.get(key);
    if (!cached) return null;

    // Check if cache is expired (5 minutes)
    if (Date.now() - cached.timestamp > 5 * 60 * 1000) {
      get().cache.delete(key);
      return null;
    }

    return cached.data;
  },

  clearCache: () => {
    set({ cache: new Map() });
  },

  setProducts: (products: Product[]) => {
    set({ products });
  },

  setStatistics: (stats: any) => {
    set({
      statistics: {
        activeProducts: parseInt(stats.activeproducts) || 0,
        inactiveProducts: parseInt(stats.inactiveproducts) || 0,
        inStockProducts: parseInt(stats.instockproducts) || 0,
        outOfStockProducts: parseInt(stats.outofstockproducts) || 0,
        featuredProducts: parseInt(stats.featuredproducts) || 0,
        nonfeaturedProducts: parseInt(stats.nonfeaturedproducts) || 0,
        totalCategories: parseInt(stats.totalcategories) || 0,
      },
    });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  updateProduct: (updatedProduct: Product) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.productId === updatedProduct.productId
          ? { ...product, ...updatedProduct }
          : product
      ),
    }));
  },

  removeProduct: (productId: string) => {
    set((state) => ({
      products: state.products.filter(
        (product) => product.productId !== productId
      ),
    }));
  },

  addProduct: (newProduct: Product) => {
    set((state) => ({
      products: [newProduct, ...state.products],
    }));
  },
}));
