"use client";

import type React from "react";

import { useState } from "react";
import { Filter, Search, MessageSquare, Plus, ChevronDown } from "lucide-react";
import CreateOrderComponent from "./CreateOrderComponent";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterComponentProps {
  title?: string;
  onFilterChange?: (filters: FilterData) => void;
  statusOptions?: FilterOption[];
  categoryOptions?: FilterOption[];
  showNewButton?: boolean;
  onNewClick?: () => void;
  newButtonText?: string;
}

interface FilterData {
  sku: string;
  productName: string;
  productStatus: string;
  category: string;
  priceFrom: string;
  priceTo: string;
}

// Custom Button Component
const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  [key: string]: any;
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-[#0088B1] hover:bg-[#007197] text-white focus:ring-[#33BEE2]",
    secondary:
      "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-[#33BEE2]",
    ghost:
      "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-[#33BEE2]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Input Component
const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
  ...props
}: {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#33BEE2] focus:border-[#0088B1] ${className}`}
        {...props}
      />
    </div>
  );
};

// Custom Select Component
const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#33BEE2	] focus:border-[#0088B1] ${className}`}
        >
          <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                    value === option.value
                      ? "bg-teal-50 text-teal-900"
                      : "text-gray-900"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function FilterComponent({
  title = "Product Catalog",
  onFilterChange,
  statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" },
  ],
  categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books" },
  ],
  showNewButton = true,
  onNewClick,
  newButtonText = "New Product",
}: FilterComponentProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [filters, setFilters] = useState<FilterData>({
    sku: "",
    productName: "",
    productStatus: "all",
    category: "all",
    priceFrom: "",
    priceTo: "",
  });

  const handleFilterChange = (key: keyof FilterData, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleNewOrderClick = () => {
    setShowCreateOrder(true);
    onNewClick?.();
  };

  const handleCancelOrder = () => {
    setShowCreateOrder(false);
  };

  const handleProceedToCheckout = () => {
    console.log("Proceeding to checkout...");
    // Handle checkout logic here
  };

  // Show Create Order Component
  if (showCreateOrder) {
    return (
      <CreateOrderComponent
        onCancel={handleCancelOrder}
        onProceedToCheckout={handleProceedToCheckout}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="p-2">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" className="p-2">
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button onClick={toggleFilter} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          {showNewButton && (
            <Button
              onClick={handleNewOrderClick}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {newButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* SKU */}
            <Input
              label="SKU"
              placeholder="Enter product SKU"
              value={filters.sku}
              onChange={(e) => handleFilterChange("sku", e.target.value)}
            />

            {/* Product Status */}
            <Select
              label="Product Status"
              value={filters.productStatus}
              onChange={(value) => handleFilterChange("productStatus", value)}
              options={statusOptions}
              placeholder="Select status"
            />

            {/* Price Range (From) */}
            <Input
              label="Price Range (From)"
              placeholder="000.00"
              type="number"
              value={filters.priceFrom}
              onChange={(e) => handleFilterChange("priceFrom", e.target.value)}
            />

            {/* Product Name */}
            <Input
              label="Product Name"
              placeholder="Enter Product Name"
              value={filters.productName}
              onChange={(e) =>
                handleFilterChange("productName", e.target.value)
              }
            />

            {/* Category */}
            <Select
              label="Category"
              value={filters.category}
              onChange={(value) => handleFilterChange("category", value)}
              options={categoryOptions}
              placeholder="Select category"
            />

            {/* Price Range (To) */}
            <Input
              label="Price Range (To)"
              placeholder="500.00"
              type="number"
              value={filters.priceTo}
              onChange={(e) => handleFilterChange("priceTo", e.target.value)}
            />
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                const resetFilters = {
                  sku: "",
                  productName: "",
                  productStatus: "all",
                  category: "all",
                  priceFrom: "",
                  priceTo: "",
                };
                setFilters(resetFilters);
                onFilterChange?.(resetFilters);
              }}
            >
              Clear Filters
            </Button>
            <Button onClick={() => onFilterChange?.(filters)}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
