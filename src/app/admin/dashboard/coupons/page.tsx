"use client";
import { useEffect } from "react";
import { Plus, Download } from "lucide-react";

import { useCouponStore } from "@/app/store/couponStore";
import { CouponItem } from "@/app/types/auth.types";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "./services";
import toast from "react-hot-toast";
import SearchAndActions from "./components/SearchAndActions";
import CouponTable from "./components/CouponTable";
import { CouponModal } from "./components/AddCouponModal";

export default function CouponsManagement() {
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
          err instanceof Error ? err.message : "Failed to fetch coupons",
        );
        console.error("Error fetching coupons:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [setCoupons, setIsLoading, setError]);

  console.log(coupons, "coupons");
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
    status: "active" | "inactive",
  ) => {
    try {
      const couponToUpdate = coupons.find((c) => String(c.id) === String(id));
      if (!couponToUpdate) return;

      const updatedCoupon = {
        ...couponToUpdate,
        status: status,
      };

      await updateCoupon(updatedCoupon);
      updateCouponInStore(updatedCoupon);
    } catch (err) {
      console.error("Error updating coupon status:", err);
      alert(
        err instanceof Error ? err.message : "Failed to update coupon status",
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

      try {
        setIsLoading(true);
        const data = await getAllCoupons();
        setCoupons(data);
        setError(null);
      } catch (refreshErr) {
        setError(
          refreshErr instanceof Error
            ? refreshErr.message
            : "Failed to refresh coupons",
        );
        console.error("Error refreshing coupons:", refreshErr);
      } finally {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error submitting coupon:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to submit coupon",
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

  const exportCouponsToCSV = (coupons: CouponItem[]) => {
    const headers = [
      "Coupon Code",
      "Description",
      "Discount Type",
      "Discount Value",
      "Minimum Cart Amount",
      "Maximum Discount Amount",
      "Usage Limit",
      "Start Date",
      "End Date",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...coupons.map((c) =>
        [
          `"${c.coupon_code}"`,
          `"${c.description || ""}"`,
          c.discount_type,
          c.discount_value,
          c.minimum_item_quantity || "0",
          c.minimum_order_value || "No limit",
          c.uses_limit || "Unlimited",
          `"${c.start_date || "N/A"}"`,
          `"${c.expiry_date || "No expiry"}"`,
          c.status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `coupons_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (coupons.length === 0) {
      toast.error("No coupons to export");
      return;
    }

    const couponsToExport =
      selectedItems.length > 0
        ? coupons.filter((c) => selectedItems.includes(c.id.toString()))
        : filteredCoupons;

    exportCouponsToCSV(couponsToExport);
    toast.success(`Exported ${couponsToExport.length} coupons successfully!`);
  };

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
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[16px] font-semibold text-[#161D1F]">Coupons</h1>
          <p className="text-[16px] text-gray-600">
            Manage all coupon codes for customer discounts
          </p>
        </div>
      </div>

      <SearchAndActions
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedItems={selectedItems}
        onAddCoupon={handleAddCoupon}
        onExport={handleExport}
      />

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
        isLoading={isLoading}
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
