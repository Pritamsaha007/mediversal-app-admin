"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";

// Types
interface InventoryItem {
  id?: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  reorderLevel: number;
  location: string;
  manufacturer: string;
  category: string;
}

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: InventoryItem) => void;
  editItem?: InventoryItem | null;
  mode?: "add" | "edit";
}

// Main Modal Component
export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editItem = null,
  mode = "add",
}) => {
  const [formData, setFormData] = useState<InventoryItem>({
    productName: "",
    batchNumber: "",
    expiryDate: "",
    quantity: 0,
    reorderLevel: 100,
    location: "",
    manufacturer: "",
    category: "",
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (mode === "edit" && editItem) {
      setFormData({
        id: editItem.id,
        productName: editItem.productName,
        batchNumber: editItem.batchNumber,
        expiryDate: editItem.expiryDate,
        quantity: editItem.quantity,
        reorderLevel: editItem.reorderLevel,
        location: editItem.location,
        manufacturer: editItem.manufacturer,
        category: editItem.category,
      });
    } else {
      // Reset form for add mode
      setFormData({
        productName: "",
        batchNumber: "",
        expiryDate: "",
        quantity: 0,
        reorderLevel: 100,
        location: "",
        manufacturer: "",
        category: "",
      });
    }
  }, [mode, editItem, isOpen]);

  const categories = [
    "Pharmaceuticals",
    "Medical Equipment",
    "Surgical Instruments",
    "Laboratory Supplies",
    "Consumables",
    "Emergency Medicine",
    "Vaccines",
    "Diagnostic Tools",
    "Antibiotic",
    "Analgesic",
    "Antihypertensive",
    "Statin",
    "Hormone",
    "Proton Pump Inhibitor",
    "Diuretic",
    "Antidepressant",
    "Calcium Channel Blocker",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "reorderLevel"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormData({
      productName: "",
      batchNumber: "",
      expiryDate: "",
      quantity: 0,
      reorderLevel: 100,
      location: "",
      manufacturer: "",
      category: "",
    });
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";

    // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return dateString;
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";

    // If date is in YYYY-MM-DD format, convert to DD/MM/YYYY
    if (dateString.includes("-") && dateString.length === 10) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }

    return dateString;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-[#161D1F]">
              {mode === "edit" ? "Edit Inventory Item" : "Add Inventory Item"}
            </h2>
            <p className="text-[10px] text-[#899193] mt-1">
              {mode === "edit"
                ? "Update the details of the inventory item."
                : "Enter the details of the new inventory item."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                <span className="text-red-500">*</span> Product Name
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="e.g., Paracetamol 500mg"
                className="w-full px-3 py-2 text-[#899193] text-[10px]  border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                required
              />
            </div>

            {/* Batch Number */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                <span className="text-red-500">*</span> Batch Number
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                placeholder="e.g., BATCH-001"
                className="w-full px-3 py-2 text-[#899193] text-[10px]  border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                required
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                <span className="text-red-500">*</span> Expiry Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="expiryDate"
                  value={formatDateForInput(formData.expiryDate)}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      expiryDate: formatDateForDisplay(e.target.value),
                    }));
                  }}
                  className="w-full px-3 py-2 text-[#899193] text-[10px]  border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                <span className="text-red-500">*</span> Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 text-[#899193] text-[10px]  border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                required
              />
            </div>

            {/* Reorder Level */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                Reorder Level
              </label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleInputChange}
                placeholder="100"
                min="0"
                className="w-full px-3 py-2 text-[#899193] text-[10px]  border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                <span className="text-red-500">*</span> Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Shelf A1"
                className="w-full px-3 py-2 text-[#899193] text-[10px]  border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                required
              />
            </div>

            {/* Manufacturer */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-[#161D1F]">
                <span className="text-red-500">*</span> Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="e.g., GSK"
                className="w-full px-3 py-2 text-[#899193] text-[10px]  border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Category - Full Width */}
          <div className="space-y-2 mt-6">
            <label className="block text-[10px] font-medium text-[#161D1F]">
              <span className="text-red-500">*</span> Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-[#899193] text-[10px]  border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors bg-white"
              required
            >
              <option value="">Select a Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 text-[10px] text-[#161D1F] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-1 focus:ring-gray-200 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white text-[10px] bg-[#0088B1] rounded-lg hover:bg-[#1c88a9] focus:ring-1 focus:ring-[#0088B1] transition-colors"
            >
              {mode === "edit" ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Hook for managing modal state
export const useAddInventoryModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const openAddModal = () => {
    setMode("add");
    setEditItem(null);
    setIsOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setMode("edit");
    setEditItem(item);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditItem(null);
    setMode("add");
  };

  return {
    isOpen,
    mode,
    editItem,
    openAddModal,
    openEditModal,
    closeModal,
  };
};

// Export the type for use in other components
export type { InventoryItem };
