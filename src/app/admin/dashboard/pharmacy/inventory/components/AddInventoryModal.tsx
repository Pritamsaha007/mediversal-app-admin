"use client";

import React, { useState } from "react";
import { X, Calendar } from "lucide-react";

// Types
interface InventoryItem {
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
}

// Main Modal Component
export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
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

  const categories = [
    "Pharmaceuticals",
    "Medical Equipment",
    "Surgical Instruments",
    "Laboratory Supplies",
    "Consumables",
    "Emergency Medicine",
    "Vaccines",
    "Diagnostic Tools",
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-[#161D1F]">
              Add Inventory Item
            </h2>
            <p className="text-[10px] text-[#899193] mt-1">
              Enter the details of the new inventory item.
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
              <label className="block text-[10px] font-medium text-gray-700">
                <span className="text-red-500">*</span> Product Name
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="e.g., Paracetamol 500mg"
                className="w-full px-3 py-2 text-[10px] border text-[#899193] border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                required
              />
            </div>

            {/* Batch Number */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-gray-700">
                <span className="text-red-500">*</span> Batch Number
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                placeholder="e.g., BATCH-001"
                className="w-full px-3 py-2 text-[10px] border text-[#899193] border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                required
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-gray-700">
                <span className="text-red-500">*</span> Expiry Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-[10px] border text-[#899193] border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-gray-700">
                <span className="text-red-500">*</span> Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 text-[10px] border text-[#899193] border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                required
              />
            </div>

            {/* Reorder Level */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-gray-700">
                Reorder Level
              </label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleInputChange}
                placeholder="100"
                min="0"
                className="w-full px-3 py-2 text-[10px] border text-[#899193] border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-gray-700">
                <span className="text-red-500">*</span> Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Shelf A1"
                className="w-full px-3 py-2 text-[10px] border text-[#899193] border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                required
              />
            </div>

            {/* Manufacturer */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-gray-700">
                <span className="text-red-500">*</span> Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="e.g., GSK"
                className="w-full px-3 py-2 text-[10px] border text-[#899193] border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Category - Full Width */}
          <div className="space-y-2 mt-6">
            <label className="block text-[10px] font-medium text-gray-700">
              <span className="text-red-500">*</span> Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-[10px] border text-[#899193] border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] outline-none transition-colors bg-white"
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
              className="px-6 py-2 text-gray-700 text-[10px] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-1 focus:ring-gray-200 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-[10px] text-white bg-[#0088B1] rounded-lg hover:[#0088B1] focus:ring-1 focus:ring-[#0088B1] transition-colors"
            >
              Add Item
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

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
  };
};
