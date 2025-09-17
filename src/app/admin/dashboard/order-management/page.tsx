"use client";

import FilterComponent from "../../../components/common/FilterComponent";

interface FilterData {
  sku: string;
  productName: string;
  productStatus: string;
  category: string;
  priceFrom: string;
  priceTo: string;
}

export default function HomePage() {
  const handleFilterChange = (filters: FilterData) => {
    console.log("Filters changed:", filters);
  };

  const handleNewProduct = () => {
    console.log("New product clicked");
  };

  const customStatusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
  ];

  const customCategoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books" },
    { value: "home", label: "Home & Garden" },
    { value: "sports", label: "Sports" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <FilterComponent
          title="Order Management"
          onFilterChange={handleFilterChange}
          onNewClick={handleNewProduct}
          statusOptions={customStatusOptions}
          categoryOptions={customCategoryOptions}
          showNewButton={true}
          newButtonText="New Product"
        />

        {/* Your main content goes here */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">
            Your product list or other content would go here...
          </p>
        </div>
      </div>
    </div>
  );
}
