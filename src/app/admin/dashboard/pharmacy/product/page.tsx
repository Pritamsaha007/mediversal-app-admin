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
import { categories, sortOptions, tabs } from "./data/productCatalogData";
import { AddProductModal } from "./components/AddProductModal";
import { ProductCard } from "./components/ProductCard";
import { ProductFormData } from "./types/productForm.type";
import toast from "react-hot-toast";
import { useConfirmationDialog } from "./components/ConfirmationDialog";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useProductStore } from "./store/productStore";
import { useDebounce } from "./utils/useDebounce";
import Pagination from "@/app/components/common/pagination";
import { StatsCard } from "@/app/components/common/StatsCard";
import {
  getProductsWithPaginationAPI,
  addProductAPI,
  updateProductAPI,
  deleteProductAPI,
} from "./services/ProductService";
import { Product } from "./types/product";

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
    getCache,
    setCache,
    clearCache,
    setProducts,
    setStatistics,
    setLoading,
    setError,
  } = useProductStore();

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  const handleRefreshProducts = async () => {
    clearCache();
    await fetchProducts(currentPage);
  };

  const handleExportPDF = () => {
    const productsToExport =
      selectedProducts.length > 0
        ? products.filter((p) => selectedProducts.includes(p.productId))
        : getFilteredProducts();

    if (productsToExport.length === 0) {
      toast.error("No products to export");
      return;
    }

    const doc = new jsPDF();
    doc.text("Product Catalog Report", 14, 15);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableData = productsToExport.map((product) => [
      product.ProductName,
      product.SKU || "N/A",
      product.Category,
      `₹${parseFloat(product.CostPrice as string).toFixed(2)}`,
      `₹${parseFloat(product.SellingPrice as string).toFixed(2)}`,
      `${parseFloat(product.DiscountedPercentage as string)}%`,
      product.StockAvailableInInventory.toString(),
      product.active ? "Active" : "Inactive",
    ]);

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
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [0, 112, 154],
        textColor: 255,
        fontSize: 9,
      },
    });

    doc.save(`products_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success(`Exported ${productsToExport.length} products to PDF`);
  };

  const fetchProducts = async (page: number, filters?: Record<string, any>) => {
    const start = page * itemsPerPage;
    const cacheKey = `products_${start}_${itemsPerPage}_${JSON.stringify(
      filters || {}
    )}`;

    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log("Using cached data for", cacheKey);
      setProducts(cachedData.products);
      if (cachedData.statistics?.[0]) {
        setStatistics(cachedData.statistics[0]);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching: start=${start}, max=${itemsPerPage}`);
      const response = await getProductsWithPaginationAPI(
        start,
        itemsPerPage,
        filters
      );

      setCache(cacheKey, response);

      setProducts(response.products || []);
      if (response.statistics?.[0]) {
        setStatistics(response.statistics[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData: ProductFormData) => {
    try {
      setLoading(true);

      const payload = {
        productId: productData.id || "",
        ProductName: productData.ProductName || "",
        CostPrice: productData.CostPrice || 0,
        SellingPrice: productData.SellingPrice || 0,
        DiscountedPrice:
          productData.DiscountedPrice || productData.SellingPrice || 0,
        Type: productData.Type || "Tablet",
        PrescriptionRequired: productData.PrescriptionRequired,
        ColdChain: productData.ColdChain || "No",
        ManufacturerName: productData.ManufacturerName || "",
        Composition: productData.Composition || "",
        ProductInformation: productData.ProductInformation || "",
        SafetyAdvices: productData.SafetyAdvices || "",
        StorageInstructions: productData.StorageInstructions || "",
        GST: productData.GST || "18",
        Coupons: productData.Coupons || "5",
        Category: productData.Category || "",
        Subcategory: productData.Subcategory || "",
        subCategoryType: productData.subCategoryType || "",
        DiscountedPercentage: productData.DiscountedPercentage || 0,
        HSN_Code: productData.HSN_Code || "",
        SKU: productData.SKU || "",
        StockAvailableInInventory: productData.StockAvailableInInventory || 0,
        productLength: productData.productLength || 20,
        productBreadth: productData.productBreadth || 20,
        productHeight: productData.productHeight || 5,
        productWeight: productData.productWeight || 0.4,
        tax: productData.tax || 0,
        ProductStrength: productData.ProductStrength || "",
        PackageSize: productData.PackageSize || "",
        featuredProduct: Boolean(productData.featuredProduct),
        active: Boolean(productData.active),
        archivedProduct: false,
        is_deleted: false,
        dosageForm: productData.dosageForm || "",
        schedule: productData.schedule || "",
        storageConditions: productData.storageConditions || "",
        InventoryUpdated: new Date().toISOString(),
        updated_by: "",
      };

      const imageUrls = productData.image_url || [];

      console.log("Calling addProductAPI with payload:", payload);
      const result = await addProductAPI(payload, imageUrls);

      toast.success("Product added successfully");
      setIsModalOpen(false);

      // Clear cache and refresh products
      clearCache();
      await fetchProducts(currentPage);
    } catch (error: any) {
      toast.error(error.message || "Failed to add product");
      console.error("Add product error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (
    id: string,
    productData: ProductFormData
  ) => {
    try {
      setLoading(true);

      const productId = id;
      if (!productId) {
        throw new Error("Product ID is required for update");
      }

      const payload = {
        ProductName: productData.ProductName || "",
        CostPrice: productData.CostPrice || 0,
        SellingPrice: productData.SellingPrice || 0,
        DiscountedPrice:
          productData.DiscountedPrice || productData.SellingPrice || 0,
        Type: productData.Type || "",
        PrescriptionRequired: productData.PrescriptionRequired,
        ColdChain: productData.ColdChain || "No",
        ManufacturerName: productData.ManufacturerName || "",
        Composition: productData.Composition || "",
        ProductInformation: productData.ProductInformation || "",
        SafetyAdvices: productData.SafetyAdvices || "",
        StorageInstructions: productData.StorageInstructions || "",
        GST: productData.GST || "18",
        Coupons: productData.Coupons || "5",
        Category: productData.Category || "",
        Subcategory: productData.Subcategory || "",
        subCategoryType: productData.subCategoryType || "",
        DiscountedPercentage: productData.DiscountedPercentage || 0,
        HSN_Code: productData.HSN_Code || "",
        SKU: productData.SKU || "",
        StockAvailableInInventory: productData.StockAvailableInInventory || 0,
        productLength: productData.productLength || 20,
        productBreadth: productData.productBreadth || 20,
        productHeight: productData.productHeight || 5,
        productWeight: productData.productWeight || 0.4,
        tax: productData.tax || 0,
        ProductStrength: productData.ProductStrength || "",
        PackageSize: productData.PackageSize || "",
        featuredProduct: Boolean(productData.featuredProduct),
        active: Boolean(productData.active),
        archivedProduct: !Boolean(productData.active),
        is_deleted: false,
        dosageForm: productData.dosageForm || "",
        schedule: productData.schedule || "",
        storageConditions: productData.storageConditions || "",
        image_url: productData.image_url || [],
      };

      console.log(
        "Calling updateProductAPI with ID:",
        productId,
        "payload:",
        payload
      );
      const result = await updateProductAPI(productId, payload);

      toast.success("Product updated successfully");

      clearCache();
      await fetchProducts(currentPage);
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
      console.error("Update product error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteProduct = async (id: string) => {
    try {
      setLoading(true);
      console.log("Calling deleteProductAPI for ID:", id);
      await deleteProductAPI(id);
      toast.success("Product deleted successfully");

      clearCache();
      await fetchProducts(currentPage);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
      console.error("Delete product error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCategoryDropdownOpen(false);
    setCurrentPage(0);
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const filters: Record<string, any> = {
      ...(debouncedSearch && { searchTerm: debouncedSearch }),
      ...(selectedCategory !== "All Categories" && {
        search_category: selectedCategory,
      }),
    };

    // Only fetch if we have filters
    if (Object.keys(filters).length > 0) {
      fetchProducts(0, filters);
      setCurrentPage(0);
    }
  }, [debouncedSearch, selectedCategory]);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

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
      const confirmed = await showConfirmation({
        title: "Delete Product",
        message:
          "Are you sure you want to delete this product? This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "danger",
        onConfirm: async () => {
          try {
            await handleDeleteProduct(id);
          } catch (error: any) {
            toast.error(error.message || "Failed to delete product");
          }
        },
      });
      return;
    }

    try {
      const product = products.find((p) => p.productId === id);
      if (!product) {
        toast.error("Product not found");
        return;
      }

      if (action === "deactivate") {
        const deactivatePayload = {
          ...product,
          active: false,
          archivedProduct: true,
        };
        await updateProductAPI(id, deactivatePayload);
        toast.success("Product deactivated");
      } else if (action === "unfeature") {
        const unfeaturePayload = {
          ...product,
          featuredProduct: false,
        };
        await updateProductAPI(id, unfeaturePayload);
        toast.success("Product unfeatured");
      }

      // Clear cache and refresh
      clearCache();
      await fetchProducts(currentPage);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} product`);
    }
  };

  // Pagination calculations
  const totalItems = statistics.activeProducts + statistics.inactiveProducts;
  const hasMore = (currentPage + 1) * itemsPerPage < totalItems;

  const handleNextPage = () => {
    if (hasMore && !loading) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0 && !loading) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Filter products for display
  const getFilteredProducts = () => {
    let filtered = products.filter((product) => {
      let tabMatch = true;
      switch (activeTab) {
        case "Active":
          tabMatch = product.active === true;
          break;
        case "Inactive":
          tabMatch = product.active === false;
          break;
        case "Featured":
          tabMatch = product.featuredProduct === true;
          break;
        case "Out of Stock":
          tabMatch = product.StockAvailableInInventory === 0;
          break;
        default:
          tabMatch = true;
      }
      return tabMatch;
    });

    if (sortBy !== "Sort") {
      filtered = [...filtered].sort((a, b) => {
        const priceA = parseFloat(a.SellingPrice as string);
        const priceB = parseFloat(b.SellingPrice as string);
        const stockA = a.StockAvailableInInventory;
        const stockB = b.StockAvailableInInventory;

        switch (sortBy) {
          case "ProductName - A to Z":
            return a.ProductName.localeCompare(b.ProductName);
          case "ProductName - Z to A":
            return b.ProductName.localeCompare(a.ProductName);
          case "SellingPrice - Low to High":
            return priceA - priceB;
          case "SellingPrice - High to Low":
            return priceB - priceA;
          // case "StockAvailableInInventory - High to Low":
          //   return stockB - stockA;
          // case "StockAvailableInInventory - Low to High":
          //   return stockA - stockB;
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
    setSelectedProducts(
      selected ? getFilteredProducts().map((p) => p.productId) : []
    );
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
        try {
          setLoading(true);
          await Promise.all(selectedProducts.map((id) => deleteProductAPI(id)));
          toast.success(
            `${selectedProducts.length} products deleted successfully`
          );

          // Clear cache and refresh
          clearCache();
          await fetchProducts(currentPage);
          setSelectedProducts([]);
        } catch (error: any) {
          toast.error("Failed to delete some products");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const statsData = getStatsData();
  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Product Catalog
          </h1>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-[#F8F8F8] rounded-lg hover:bg-[#00729A] cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-3 h-3" />
              Add New Products
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
          <StatsCard
            title="Total Products"
            stats={[
              { label: "Active", value: statsData.activeProducts },
              { label: "Inactive", value: statsData.inactiveProducts },
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

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, brand or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedCategory}
                <ChevronDown className="w-4 h-4" />
              </button>
              {categoryDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
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

            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {sortBy}
                <ChevronDown className="w-4 h-4" />
              </button>
              {sortDropdownOpen && (
                <div className="absolute  right-0 top-full mt-1 z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
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

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              {activeTab}
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                Showing {filteredProducts.length} of {products.length} loaded
                products
                {hasMore && " (Load more available)"}
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full relative">
              <thead className="bg-gray-50 sticky top-0 z-20">
                <tr>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length > 0 &&
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.every((p) =>
                          selectedProducts.includes(p.productId)
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
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088B1]"></div>
                      </div>
                    </td>
                  </tr>
                ) : !error && filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard
                      key={product.productId}
                      product={product}
                      onEdit={handleUpdateProduct}
                      isSelected={selectedProducts.includes(product.productId)}
                      onSelect={handleProductSelect}
                      onView={(id) => handleProductAction("view", id)}
                      onUnfeature={(id) => handleProductAction("unfeature", id)}
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
                        clearCache();
                        await fetchProducts(currentPage);
                      }}
                    />
                  ))
                ) : (
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

          <Pagination
            currentPage={currentPage}
            hasMore={hasMore}
            loading={loading}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
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
