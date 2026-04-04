"use client";
import { useEffect, useState, useRef } from "react";
import { Plus, Download } from "lucide-react";

import { useCouponStore } from "@/app/admin/dashboard/coupons/store/couponStore";
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

  const toastShownRef = useRef<boolean>(false);
  const isUpdatingRef = useRef<boolean>(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (coupons.length > 0 && !isUpdatingRef.current) {
        setIsLoading(false);
        return;
      }
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
  }, [setCoupons, setIsLoading, setError, coupons.length]);

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

    if (!confirm(`Are you sure you want to delete ${coupon.coupon_code}?`)) {
      return;
    }

    isUpdatingRef.current = true;

    const originalCoupons = [...coupons];

    removeCoupon(id);
    toast.success(`Deleting ${coupon.coupon_code}...`);
    toastShownRef.current = true;

    try {
      await deleteCoupon(id);
      toast.dismiss();
      toast.success(`${coupon.coupon_code} deleted successfully!`);
    } catch (err) {
      console.error("Error deleting coupon:", err);

      setCoupons(originalCoupons);
      toast.dismiss();
      toast.error(
        err instanceof Error ? err.message : "Failed to delete coupon",
      );
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 500);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "active" | "inactive",
  ) => {
    const couponToUpdate = coupons.find((c) => String(c.id) === String(id));
    if (!couponToUpdate) return;

    isUpdatingRef.current = true;

    const originalCoupon = { ...couponToUpdate };

    const updatedCouponData = {
      ...couponToUpdate,
      status: status,
    };
    updateCouponInStore(updatedCouponData);
    toast.success(`Updating status to ${status}...`);
    toastShownRef.current = true;

    try {
      await updateCoupon(updatedCouponData);
      toast.dismiss();
      toast.success(`Coupon status updated to ${status}!`);
    } catch (err) {
      console.error("Error updating coupon status:", err);

      updateCouponInStore(originalCoupon);
      toast.dismiss();
      toast.error(
        err instanceof Error ? err.message : "Failed to update coupon status",
      );
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 500);
    }
  };

  const handleSubmitCoupon = async (couponData: CouponItem) => {
    isUpdatingRef.current = true;

    closeModal();

    if (isEditMode) {
      const originalCoupon = coupons.find(
        (c) => String(c.id) === String(couponData.id),
      );

      updateCouponInStore(couponData);
      toast.success("Updating coupon...");
      toastShownRef.current = true;

      try {
        const updatedCoupon = await updateCoupon(couponData);
        updateCouponInStore(updatedCoupon);
        toast.dismiss();
        toast.success("Coupon updated successfully!");

        await refreshCouponsSilently();
      } catch (err) {
        console.error("Error updating coupon:", err);

        if (originalCoupon) {
          updateCouponInStore(originalCoupon);
        }
        toast.dismiss();
        toast.error(
          err instanceof Error ? err.message : "Failed to update coupon",
        );
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const optimisticCoupon: CouponItem = {
        ...couponData,
        id: tempId as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addCoupon(optimisticCoupon);
      toast.success("Adding coupon...");
      toastShownRef.current = true;

      try {
        const newCoupon = await createCoupon(couponData);

        removeCoupon(tempId);
        addCoupon(newCoupon);
        toast.dismiss();
        toast.success("Coupon created successfully!");

        await refreshCouponsSilently();
      } catch (err) {
        console.error("Error creating coupon:", err);

        removeCoupon(tempId);
        toast.dismiss();
        toast.error(
          err instanceof Error ? err.message : "Failed to create coupon",
        );
      }
    }

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 500);
  };

  const refreshCouponsSilently = async () => {
    try {
      const data = await getAllCoupons();
      setCoupons(data);
      setError(null);
    } catch (refreshErr) {
      console.error("Error refreshing coupons:", refreshErr);
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[20px] font-semibold text-[#161D1F]">Coupons</h1>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAddCoupon}
            className="flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg bg-[#0088B1] hover:bg-[#00729A] cursor-pointer w-auto min-w-[120px] justify-center"
          >
            <Plus className="w-3 h-3" />
            Add Coupon
          </button>
        </div>
      </div>

      <SearchAndActions
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedItems={selectedItems}
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
