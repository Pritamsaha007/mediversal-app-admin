import { create } from "zustand";
import { CouponItem } from "@/app/types/auth.types";

interface CouponStore {
  // Data state
  coupons: CouponItem[];
  filteredCoupons: CouponItem[];
  searchTerm: string;
  selectedItems: string[];

  // Modal state
  modalOpen: boolean;
  couponToEdit: CouponItem | null;
  isEditMode: boolean;

  // Modal form state
  formData: CouponItem;
  categoryDropdownOpen: boolean;

  // Pagination state
  currentPage: number;
  itemsPerPage: number;

  // Loading and error state
  isLoading: boolean;
  error: string | null;

  // Actions
  setCoupons: (coupons: CouponItem[]) => void;
  setSearchTerm: (term: string) => void;
  setSelectedItems: (items: string[]) => void;
  setModalOpen: (open: boolean) => void;
  setCouponToEdit: (coupon: CouponItem | null) => void;
  setIsEditMode: (mode: boolean) => void;
  setCurrentPage: (page: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Form actions
  setFormData: (data: CouponItem) => void;
  updateFormField: (field: keyof CouponItem, value: any) => void;
  setCategoryDropdownOpen: (open: boolean) => void;
  resetForm: () => void;
  generateRandomCode: () => void;

  // Complex actions
  addCoupon: (coupon: CouponItem) => void;
  updateCouponInStore: (coupon: CouponItem) => void;
  removeCoupon: (id: string) => void;
  filterCoupons: () => void;
  selectItem: (id: string, selected: boolean) => void;
  selectAll: (selected: boolean) => void;
  openAddModal: () => void;
  openEditModal: (coupon: CouponItem) => void;
  closeModal: () => void;
}

export const useCouponStore = create<CouponStore>((set, get) => {
  const defaultFormData: CouponItem = {
    id: 0,
    coupon_code: "",
    coupon_name: "",
    discount_value: "10",
    minimum_order_value: "0",
    uses_limit: 100,
    expiry_date: "",
    start_date: "",
    status: "active",
    description: "",
    discount_type: "percentage",
    category: "",
    is_for_first_time_user: 0,
    is_for_comeback_user: 0,
    is_for_loyal_user: 0,
    is_for_birthday_user: 0,
    is_general_coupon: 1,
    is_for_new_customer: 0,
    is_for_existing_customer: 0,
    created_at: "",
    updated_at: "",
  };

  return {
    // Initial state
    coupons: [],
    filteredCoupons: [],
    searchTerm: "",
    selectedItems: [],
    modalOpen: false,
    couponToEdit: null,
    isEditMode: false,
    formData: defaultFormData,
    categoryDropdownOpen: false,
    currentPage: 1,
    itemsPerPage: 5,
    isLoading: true,
    error: null,

    // Basic setters
    setCoupons: (coupons) => {
      set({ coupons });
      get().filterCoupons();
    },

    setSearchTerm: (term) => {
      set({ searchTerm: term, currentPage: 1 });
      get().filterCoupons();
    },

    setSelectedItems: (items) => set({ selectedItems: items }),
    setModalOpen: (open) => set({ modalOpen: open }),
    setCouponToEdit: (coupon) => set({ couponToEdit: coupon }),
    setIsEditMode: (mode) => set({ isEditMode: mode }),
    setCurrentPage: (page) => set({ currentPage: page }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Form actions
    setFormData: (data) => set({ formData: data }),
    updateFormField: (field, value) => {
      const { formData } = get();
      set({ formData: { ...formData, [field]: value } });
    },
    setCategoryDropdownOpen: (open) => set({ categoryDropdownOpen: open }),
    resetForm: () => set({ formData: defaultFormData }),
    generateRandomCode: () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const { formData } = get();
      set({ formData: { ...formData, coupon_code: result } });
    },

    // Complex actions
    addCoupon: (coupon) => {
      const { coupons, itemsPerPage } = get();
      const newCoupons = [...coupons, coupon];
      set({ coupons: newCoupons });
      get().filterCoupons();

      // Go to last page when adding new item
      const newTotalPages = Math.ceil(newCoupons.length / itemsPerPage);
      set({ currentPage: newTotalPages });
    },

    updateCouponInStore: (updatedCoupon) => {
      const { coupons } = get();
      const newCoupons = coupons.map((c) =>
        c.id === updatedCoupon.id ? updatedCoupon : c
      );
      set({ coupons: newCoupons });
      get().filterCoupons();
    },

    removeCoupon: (id) => {
      const {
        coupons,
        selectedItems,
        filteredCoupons,
        currentPage,
        itemsPerPage,
      } = get();
      const newCoupons = coupons.filter((c) => String(c.id) !== String(id));
      const newSelectedItems = selectedItems.filter((item) => item !== id);

      set({
        coupons: newCoupons,
        selectedItems: newSelectedItems,
      });
      get().filterCoupons();

      // Reset to first page if we deleted the last item on current page
      if (filteredCoupons.length - 1 <= (currentPage - 1) * itemsPerPage) {
        set({ currentPage: Math.max(1, currentPage - 1) });
      }
    },

    filterCoupons: () => {
      const { coupons, searchTerm } = get();
      const filtered = coupons.filter(
        (coupon) =>
          coupon.coupon_code
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          coupon.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          coupon.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      set({ filteredCoupons: filtered });
    },

    selectItem: (id, selected) => {
      const { selectedItems } = get();
      if (selected) {
        set({ selectedItems: [...selectedItems, id] });
      } else {
        set({ selectedItems: selectedItems.filter((item) => item !== id) });
      }
    },

    selectAll: (selected) => {
      const { filteredCoupons } = get();
      if (selected) {
        set({ selectedItems: filteredCoupons.map((c) => c.id.toString()) });
      } else {
        set({ selectedItems: [] });
      }
    },

    openAddModal: () => {
      set({
        isEditMode: false,
        couponToEdit: null,
        modalOpen: true,
      });
    },

    openEditModal: (coupon) => {
      set({
        isEditMode: true,
        couponToEdit: coupon,
        modalOpen: true,
      });
    },

    closeModal: () => {
      set({
        modalOpen: false,
        couponToEdit: null,
        isEditMode: false,
      });
    },
  };
});
