import { create } from "zustand";
import { Product } from "@/app/admin/dashboard/pharmacy/product/types/product";
import { productService } from "../services/getProductService";

interface ProductState {
  products: Product[];
  loadedChunks: Set<number>;
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
  fetchProducts: (start: number, max: number) => Promise<void>;
  getStatistics: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  resetProducts: () => void;
  updateProductInStore: (updatedProduct: Product) => void;
  removeProductFromStore: (productId: string) => void;
  addProductToStore: (newProduct: Product) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loadedChunks: new Set(),
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
  fetchProducts: async (start, max) => {
    const chunkId = Math.floor(start / max);
    if (get().loadedChunks.has(chunkId)) return;

    set({ loading: true, error: null });
    try {
      const { products: fetchedProducts, statistics } =
        await productService.getAllProducts(start, max);
      console.log(`Received ${fetchedProducts.length} products`);
      console.table(fetchedProducts.slice(0, 3));

      set((state) => {
        const newProducts = [...state.products];
        fetchedProducts.forEach((product, index) => {
          newProducts[start + index] = product;
        });

        return {
          products: newProducts,
          loadedChunks: new Set(state.loadedChunks).add(chunkId),
          statistics: statistics || state.statistics,
          loading: false,
        };
      });
    } catch (err) {
      set({ error: "Failed to load products", loading: false });
      throw err;
    }
  },
  getStatistics: async () => {
    try {
      const statistics = await productService.getStatistics();
      set({ statistics });
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  },

  resetProducts: () => {
    productService.clearCache();
    set({
      products: [],
      loadedChunks: new Set(),
      loading: false,
      error: null,
    });
  },
  updateProductInStore: (updatedProduct) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      ),
    }));
  },

  removeProductFromStore: (productId) => {
    set((state) => ({
      products: state.products.filter((product) => product.id !== productId),
      statistics: {
        ...state.statistics,
        activeProducts: state.statistics.activeProducts - 1,
      },
    }));
  },

  addProductToStore: (newProduct) => {
    set((state) => ({
      products: [newProduct, ...state.products],
      statistics: {
        ...state.statistics,
        activeProducts: state.statistics.activeProducts + 1,
      },
    }));
  },

  refreshProducts: async () => {
    productService.clearCache();
    set({ products: [], loadedChunks: new Set() }); // Clear store data
    const { fetchProducts, getStatistics } = get();
    await Promise.all([fetchProducts(0, 20), getStatistics()]);
  },
}));
