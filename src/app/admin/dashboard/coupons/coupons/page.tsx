"use client";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { CouponModal } from "./components/AddCouponModal";
import CouponTable from "./components/CouponTable";
import SearchAndActions from "./components/SearchAndActions";
import { useCouponStore } from "@/app/store/couponStore"; // Import the Zustand store
import { CouponItem } from "@/app/types/auth.types";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../../../service/api/coupon";
import toast from "react-hot-toast";

export default function CouponsManagement() {
  // Zustand store selectors
  const {
    coupons,
    filteredCoupons,
    searchTerm,
    selectedItems,
    modalOpen,
    couponToEdit,
    isEditMode,
    currentPage,
    itemsPerPage,
    isLoading,
    error,
    setCoupons,
    setSearchTerm,
    setCurrentPage,
    setIsLoading,
    setError,
    addCoupon,
    updateCouponInStore,
    removeCoupon,
    selectItem,
    selectAll,
    openAddModal,
    openEditModal,
    closeModal,
  } = useCouponStore();

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCoupons();
        setCoupons(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch coupons"
        );
        console.error("Error fetching coupons:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [setCoupons, setIsLoading, setError]);

  const handleAddCoupon = () => {
    openAddModal();
  };

  const handleEditCoupon = (id: string) => {
    const coupon = coupons.find((c) => String(c.id) === String(id));
    if (coupon) {
      openEditModal(coupon);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    const coupon = coupons.find((c) => String(c.id) === String(id));
    if (!coupon) return;

    try {
      if (confirm(`Are you sure you want to delete ${coupon.coupon_code}?`)) {
        await deleteCoupon(id);
        removeCoupon(id);
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
      alert(err instanceof Error ? err.message : "Failed to delete coupon");
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "active" | "inactive"
  ) => {
    try {
      const couponToUpdate = coupons.find((c) => String(c.id) === String(id));
      if (!couponToUpdate) return;

      const updatedCoupon = {
        ...couponToUpdate,
        status: status, // No need to convert case since we're now consistent
      };

      await updateCoupon(updatedCoupon);
      updateCouponInStore(updatedCoupon);
    } catch (err) {
      console.error("Error updating coupon status:", err);
      alert(
        err instanceof Error ? err.message : "Failed to update coupon status"
      );
    }
  };

  const handleSubmitCoupon = async (couponData: CouponItem) => {
    try {
      if (isEditMode) {
        const updatedCoupon = await updateCoupon(couponData);
        updateCouponInStore(updatedCoupon);
        toast.success("Coupon updated successfully");
      } else {
        const newCoupon = await createCoupon(couponData);
        addCoupon(newCoupon);
        toast.success("Coupon created successfully");
      }
      closeModal();

      // Refresh the coupons list after successful operation
      try {
        setIsLoading(true);
        const data = await getAllCoupons();
        setCoupons(data);
        setError(null);
      } catch (refreshErr) {
        setError(
          refreshErr instanceof Error
            ? refreshErr.message
            : "Failed to refresh coupons"
        );
        console.error("Error refreshing coupons:", refreshErr);
      } finally {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error submitting coupon:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to submit coupon"
      );
    }
  };

  const handleSelectItem = (id: string, selected: boolean) => {
    selectItem(id, selected);
  };

  const handleSelectAll = (selected: boolean) => {
    selectAll(selected);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#161D1F]">Coupons</h1>
          <p className="text-sm text-gray-600">
            Manage all coupon codes for customer discounts
          </p>
        </div>
      </div>

      {/* Search and Actions */}
      <SearchAndActions
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedItems={selectedItems}
        onAddCoupon={handleAddCoupon}
      />

      {/* Coupon Table */}
      <CouponTable
        coupons={filteredCoupons}
        selectedItems={selectedItems}
        onSelect={handleSelectItem}
        onSelectAll={handleSelectAll}
        onEdit={handleEditCoupon}
        onDelete={handleDeleteCoupon}
        onStatusChange={handleStatusChange}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredCoupons.length}
        onPageChange={handlePageChange}
      />

      <CouponModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitCoupon}
        couponToEdit={couponToEdit}
        isEditMode={isEditMode}
      />
    </div>
  );
}
