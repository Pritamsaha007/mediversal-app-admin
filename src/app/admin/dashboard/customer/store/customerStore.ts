import { create } from "zustand";
import { Customer, CustomerMetrics } from "../type/customerDetailTypes";

interface CustomerStore {
  customers: Customer[];
  metrics: CustomerMetrics | null;
  currentPage: number;
  totalCount: number;
  searchTerm: string;
  loading: boolean;
  metricsLoading: boolean;
  error: string | null;

  setCustomers: (customers: Customer[]) => void;
  setMetrics: (metrics: CustomerMetrics | null) => void;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  setTotalCount: (count: number) => void;
  setSearchTerm: (term: string) => void;
  setLoading: (loading: boolean) => void;
  setMetricsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetPagination: () => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  metrics: null,
  currentPage: 0,
  totalCount: 0,
  searchTerm: "",
  loading: false,
  metricsLoading: true,
  error: null,

  setCustomers: (customers) => set({ customers }),
  setMetrics: (metrics) => set({ metrics }),
  setCurrentPage: (page) =>
    set((state) => ({
      currentPage: typeof page === "function" ? page(state.currentPage) : page,
    })),
  setTotalCount: (totalCount) => set({ totalCount }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setLoading: (loading) => set({ loading }),
  setMetricsLoading: (metricsLoading) => set({ metricsLoading }),
  setError: (error) => set({ error }),
  resetPagination: () => set({ currentPage: 0 }),
}));
