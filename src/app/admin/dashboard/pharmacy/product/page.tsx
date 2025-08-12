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
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { categories, sortOptions, tabs } from "./data/productCatalogData";
import { AddProductModal } from "./components/AddProductModal";
import { ProductCard } from "./components/ProductCard";
import { StatsCard } from "./components/StatsCard";
import { productService } from "./services/getProductService";
import { ProductFormData } from "./types/productForm.type";
import toast from "react-hot-toast";
import { useConfirmationDialog } from "./components/ConfirmationDialog";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useProductStore } from "./store/productStore";
import { useDebounce } from "./utils/useDebounce";

const ProductCatalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Sort");
  const [activeTab, setActiveTab] = useState("All Products");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const { showConfirmation } = useConfirmationDialog();
  const debouncedSearch = useDebounce(searchTerm, 500);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
  const {
    products,
    statistics,
    loading,
    error,
    fetchProducts,
    getStatistics,
    refreshProducts,
    updateProductInStore,
    removeProductFromStore,
    addProductToStore,
  } = useProductStore();

  const handleRefreshProducts = async () => {
    await refreshProducts();
  };

  const handleExportPDF = () => {
    const productsToExport =
      selectedProducts.length > 0
        ? products.filter((p) => selectedProducts.includes(p.id))
        : getFilteredProducts();

    if (productsToExport.length === 0) {
      toast.error("No products to export");
      return;
    }

    const doc = new jsPDF();

    // Add title
    doc.text("Product Catalog Report", 14, 15);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Prepare data for the table
    const tableData = productsToExport.map((product) => [
      product.name,
      product.code || "N/A",
      product.category,
      `₹${product.mrp.toFixed(2)}`,
      `₹${product.sellingPrice.toFixed(2)}`,
      `${product.discount}%`,
      product.stock.toString(),
      product.status,
    ]);

    // Add table using the autoTable function directly
    autoTable(doc, {
      head: [
        [
          "Name",
          "Code",
          "Category",
          "MRP",
          "Price",
          "Discount",
          "Stock",
          "Status",
        ],
      ],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [0, 112, 154],
        textColor: 255,
        fontSize: 9,
      },
    });

    doc.save(`products_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success(`Exported ${productsToExport.length} products to PDF`);
  };

  // Change in ProductCatalog.tsx
  const handleAddProduct = async (productData: ProductFormData) => {
    console.log("New product added:", productData);
    setIsModalOpen(false);
    await refreshProducts();
  };
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: statistics.activeProducts + statistics.inactiveProducts,
    totalPages: Math.ceil(
      (statistics.activeProducts + statistics.inactiveProducts) / 20
    ),
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCategoryDropdownOpen(false);
    // Reset pagination when category changes
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  useEffect(() => {
    const filters = {
      ...(debouncedSearch && { searchTerm: debouncedSearch }),
      ...(selectedCategory !== "All Categories" && {
        searchCategory: selectedCategory,
      }),
    };
    fetchProducts(0, 20, filters);
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      totalItems: statistics.activeProducts + statistics.inactiveProducts,
      totalPages: Math.ceil(
        (statistics.activeProducts + statistics.inactiveProducts) /
          prev.itemsPerPage
      ),
    }));
  }, [statistics]);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchProducts(0, pagination.itemsPerPage),
        getStatistics(),
      ]);
    };

    loadInitialData();
  }, [pagination.itemsPerPage, fetchProducts, getStatistics]);

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
      if (
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(event.target as Node)
      ) {
        setActionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductAction = async (action: string, id: string) => {
    if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this product?")) {
        try {
          removeProductFromStore(id);
          toast.success("Product deleted successfully");

          await productService.deleteProduct(id);

          await getStatistics();
        } catch (error) {
          console.error("Error deleting product:", error);
          toast.error("Failed to delete product");
          await refreshProducts();
        }
      }
      return;
    }

    try {
      switch (action) {
        case "deactivate":
          toast.success("Product deactivated");
          break;
        case "unfeature":
          toast.success("Product unfeatured");
          break;
      }
      await refreshProducts();
    } catch (error) {
      console.error(`Error ${action} product:`, error);
      toast.error(`Failed to ${action} product`);
    }
  };

  const handleNextPage = async () => {
    if (pagination.currentPage < pagination.totalPages) {
      const nextPage = pagination.currentPage + 1;
      const start = (nextPage - 1) * pagination.itemsPerPage;

      await fetchProducts(start, pagination.itemsPerPage);
      setPagination((prev) => ({ ...prev, currentPage: nextPage }));
    }
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  const getFilteredProducts = () => {
    let filtered = products.filter((product) => {
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
      return tabMatch;
    });
    // Apply category filter
    //   const categoryMatch =
    //     selectedCategory === "All Categories" ||
    //     product.category === selectedCategory;

    //   return tabMatch && categoryMatch;
    // });

    // Apply sorting
    if (sortBy !== "Sort") {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "ProductName - A to Z":
            return a.name.localeCompare(b.name);
          case "ProductName - Z to A":
            return b.name.localeCompare(a.name);
          case "SellingPrice - Low to High":
            return a.sellingPrice - b.sellingPrice;
          case "SellingPrice - High to Low":
            return b.sellingPrice - a.sellingPrice;
          case "StockAvailableInInventory - High to Low":
            return b.stock - a.stock;
          case "StockAvailableInInventory - Low to High":
            return a.stock - b.stock;
          default:
            return 0;
        }
      });
    }

    return filtered;
  };

  const handleProductSelect = (id: string, selected: boolean) => {
    setSelectedProducts((prev) =>
      selected ? [...prev, id] : prev.filter((productId) => productId !== id)
    );
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSelectAll = (selected: boolean) => {
    setSelectedProducts(selected ? getFilteredProducts().map((p) => p.id) : []);
  };
  const getStatsData = () => {
    return {
      totalProducts: statistics.activeProducts + statistics.inactiveProducts,
      activeProducts: statistics.activeProducts,
      inactiveProducts: statistics.inactiveProducts,
      featuredProducts: statistics.featuredProducts,
      outOfStockProducts: statistics.outOfStockProducts,
      totalCategories: statistics.totalCategories,
    };
  };

  const handleUpdateProduct = async (
    id: string,
    productData: ProductFormData
  ) => {
    try {
      const updatedProduct = await productService.updateProduct(
        id,
        productData
      );
      updateProductInStore(updatedProduct);
      await getStatistics();
      toast.success("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
      await refreshProducts();
    }
  };

  const statsData = getStatsData();

  const filteredProducts = getFilteredProducts();
  const handleDeleteAll = async () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }

    const confirmed = await showConfirmation({
      title: "Delete Products",
      message: `Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`,
      confirmText: `Delete ${selectedProducts.length} products`,
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        const deletePromise = Promise.all(
          selectedProducts.map((id) => productService.deleteProduct(id))
        ).then(async () => {
          await refreshProducts();
          setSelectedProducts([]);
        });

        await toast.promise(deletePromise, {
          loading: "Deleting products...",
          success: `${selectedProducts.length} products deleted successfully`,
          error: "Failed to delete some products",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      {/* <div className="fixed top-4 right-4 bg-white p-3 shadow-lg rounded-lg z-50 border border-blue-100">
        <div className="text-sm font-semibold text-gray-700">Store Status</div>
        <div className="text-xs mt-1">
          <span className="font-medium text-gray-600">Total Products:</span>
          <span className="ml-1 font-bold text-blue-600">
            {useProductStore.getState().products.length}
          </span>
        </div>
        <div className="text-xs">
          <span className="font-medium text-gray-600">Loaded Chunks:</span>
          <span className="ml-1 font-bold text-blue-600">
            {Array.from(useProductStore.getState().loadedChunks).join(", ")}
          </span>
        </div>
      </div> */}
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
              Add New Products
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
              { label: "Active", value: statsData.activeProducts },
              { label: "Deactivated", value: statsData.inactiveProducts },
            ]}
            icon={<ShoppingBag className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />

          <StatsCard
            title="Featured Products"
            stats={[
              { label: "Featured", value: statsData.featuredProducts },
              {
                label: "Regular",
                value: statsData.totalProducts - statsData.featuredProducts,
              },
            ]}
            icon={<Projector className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />

          <StatsCard
            title="Categories"
            stats={[
              { label: "Total", value: statsData.totalCategories },
              { label: "Out of Stock", value: statsData.outOfStockProducts },
            ]}
            icon={<FileText className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />

          <StatsCard
            title="Inventory"
            stats={[
              { label: "In Stock", value: statistics.inStockProducts },
              { label: "Out of Stock", value: statsData.outOfStockProducts },
            ]}
            icon={<ListOrdered className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
        </div>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088B1]"></div>
            <span className="ml-3 text-gray-600">Loading products...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-red-800">{error}</span>
              <button
                onClick={handleRefreshProducts}
                className="text-red-600 hover:text-red-800 underline text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}
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
                      onClick={() => handleCategoryChange(category)}
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
              <button
                onClick={handleExportPDF}
                className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex justify-between mb-4 bg-[#F8F8F8] rounded-lg">
          <div className="">
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
          <div>
            {selectedProducts.length > 0 && (
              <div className="flex items-center justify-between px-6  bg-gray-50">
                <div className="text-[10px] text-gray-600 mr-3 ">
                  {selectedProducts.length} selected
                </div>
                <div className="relative" ref={actionDropdownRef}>
                  <button
                    onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 text- text-[#161D1F] bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Actions
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {actionDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <button
                        onClick={handleDeleteAll}
                        className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                      >
                        Delete All
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="block w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100"
                      >
                        Export PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              {activeTab}
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                Showing {getFilteredProducts().length} of {products.length}{" "}
                loaded products
                {pagination.totalItems && " (Load more available)"}
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length > 0 &&
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.every((p) =>
                          selectedProducts.includes(p.id)
                        )
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                    />
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
                {!loading &&
                  !error &&
                  getFilteredProducts()
                    .slice(
                      (pagination.currentPage - 1) * pagination.itemsPerPage,
                      pagination.currentPage * pagination.itemsPerPage
                    )
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onEdit={handleUpdateProduct}
                        isSelected={selectedProducts.includes(product.id)}
                        onSelect={handleProductSelect}
                        onView={(id) => handleProductAction("view", id)}
                        onUnfeature={(id) =>
                          handleProductAction("unfeature", id)
                        }
                        onDeactivate={(id) =>
                          handleProductAction("deactivate", id)
                        }
                        onDelete={(id) => handleProductAction("delete", id)}
                        availableProducts={products}
                        onUpdateRelationships={async (productId, data) => {
                          console.log(
                            "Updating relationships for product:",
                            productId,
                            data
                          );
                          await refreshProducts();
                        }}
                      />
                    ))}
                {!loading && !error && getFilteredProducts().length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No products found
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm ||
                          selectedCategory !== "All Categories" ||
                          activeTab !== "All Products"
                            ? "Try adjusting your search or filter criteria."
                            : "Get started by adding your first product."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {!loading &&
          !error &&
          products.length > 0 &&
          pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-6 py-4 bg-white rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">
                Showing page {pagination.currentPage} of {pagination.totalPages}
                ({pagination.totalItems} total products)
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePreviousPage}
                  disabled={pagination.currentPage === 1 || loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={
                    pagination.currentPage === pagination.totalPages || loading
                  }
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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
