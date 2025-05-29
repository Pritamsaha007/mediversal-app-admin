"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  Download,
  Plus,
  FileText,
  ShoppingBag,
  ListOrdered,
  Projector,
} from "lucide-react";
import { ProductCard } from "@/app/components/common/ProductCard";
import { StatsCard } from "@/app/components/common/StatsCard";
import {
  products,
  categories,
  sortOptions,
  tabs,
} from "@/app/data/productCatalogData";
import { AddProductModal } from "@/app/components/common/AddProductModal";

const ProductCatalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Sort");
  const [activeTab, setActiveTab] = useState("All Products");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddProduct = (productData: any) => {
    console.log("New product added:", productData);
    setIsModalOpen(false);
  };

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductAction = (action: string, id: string) => {
    console.log(`${action} product with id: ${id}`);
  };

  // Apply filters and sorting
  const getFilteredAndSortedProducts = () => {
    let filtered = products.filter((product) => {
      // Apply tab filter
      let tabMatch = true;
      switch (activeTab) {
        case "Active":
          tabMatch = product.status === "Active";
          break;
        case "Inactive":
          tabMatch = product.status === "Inactive";
          break;
        case "Featured":
          tabMatch = product.featured;
          break;
        case "Out of Stock":
          tabMatch = product.stock === 0;
          break;
        default:
          tabMatch = true;
      }

      // Apply search filter
      const searchMatch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply category filter
      const categoryMatch =
        selectedCategory === "All Categories" ||
        product.category === selectedCategory;

      return tabMatch && searchMatch && categoryMatch;
    });

    // Apply sorting
    if (sortBy !== "Sort") {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "Selling Price - Low to High":
            return a.sellingPrice - b.sellingPrice;
          case "Selling Price - High to Low":
            return b.sellingPrice - a.sellingPrice;
          case "Product Status":
            return a.status.localeCompare(b.status);
          case "By Name":
            return a.name.localeCompare(b.name);
          case "By Stock":
            return b.stock - a.stock;
          case "Discount":
            return b.discount - a.discount;
          case "Relevance (default)":
          default:
            return 0;
        }
      });
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Product Catalog
          </h1>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-[#F8F8F8] rounded-lg hover:bg-[#00729A]"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-3 h-3" />
              Product Catalog
            </button>
            <button className="flex items-center gap-2 text-[12px] px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50">
              <FileText className="w-3 h-3" />
              Bulk Import
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
          <StatsCard
            title="Total Products"
            stats={[
              { label: "Active", value: 5 },
              { label: "Deactivated", value: 8 },
            ]}
            icon={<ShoppingBag className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="Products"
            stats={[
              { label: "Active", value: 6 },
              { label: "Deactivated", value: 2 },
            ]}
            icon={<Projector className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="Categories"
            stats={[
              { label: "Active", value: 3 },
              { label: "Deactivated", value: 1 },
            ]}
            icon={<FileText className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="Orders"
            stats={[
              { label: "Active", value: 10 },
              { label: "Deactivated", value: 20 },
            ]}
            icon={<ListOrdered className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by name, SKU, brand or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-3">
            {/* Category Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedCategory}
                <ChevronDown className="w-4 h-4" />
              </button>
              {categoryDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setCategoryDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {sortBy}
                <ChevronDown className="w-4 h-4" />
              </button>
              {sortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setSortDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-[#F8F8F8] rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#0088B1] text-[#F8F8F8]"
                  : "text-[#161D1F] hover:bg-[#E8F4F7] hover:text-[#0088B1]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              {activeTab}
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredProducts.length} Products
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]  tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]  tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]  tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]  tracking-wider">
                    MRP
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]  tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]  tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]  tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]  tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F]  tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={false}
                    onSelect={() => {}}
                    onView={(id) => handleProductAction("view", id)}
                    onEdit={(id) => handleProductAction("edit", id)}
                    onUnfeature={(id) => handleProductAction("unfeature", id)}
                    onDeactivate={(id) => handleProductAction("deactivate", id)}
                    onDelete={(id) => handleProductAction("delete", id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddProduct={handleAddProduct}
        />
      </div>
    </div>
  );
};

export default ProductCatalog;
