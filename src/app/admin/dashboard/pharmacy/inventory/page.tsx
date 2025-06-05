"use client";
import {
  AddInventoryModal,
  useAddInventoryModal,
  InventoryItem,
} from "./components/AddInventoryModal";
import {
  ChevronDown,
  Download,
  FileText,
  Plus,
  Printer,
  Scan,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductHistoryModal } from "./components/ProductHistoryModal";
import { generateInventoryPDF } from "./components/PDFExportUtils";
import { inventoryItem } from "./types/inventory";
import { categories, sortOptions, tabs } from "./types/inventory";
import { initialInventoryData, sampleHistory } from "./data/InventoryData";
import { InventoryCard } from "./components/InventoryCard";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Sort");
  const [activeTab, setActiveTab] = useState("All Products");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const { isOpen, mode, editItem, openAddModal, openEditModal, closeModal } =
    useAddInventoryModal();
  const [products, setProducts] =
    useState<inventoryItem[]>(initialInventoryData);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const bulkActionsRef = useRef<HTMLDivElement>(null);
  const [selectedProductHistory, setSelectedProductHistory] = useState<{
    productName: string;
    productId: string;
    history: any[];
  }>({
    productName: "",
    productId: "",
    history: [],
  });

  const bulkActions = [
    { label: "Delete Selected", value: "delete", icon: "🗑️" },
    { label: "Export Selected", value: "export", icon: "📤" },
    { label: "Print Labels", value: "print_labels", icon: "🏷️" },
  ];

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
      // Add this for bulk actions dropdown
      if (
        bulkActionsRef.current &&
        !bulkActionsRef.current.contains(event.target as Node)
      ) {
        setBulkActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const getFilteredAndSortedProducts = () => {
    let filtered = products.filter((product) => {
      // Apply tab filter
      let tabMatch = true;
      switch (activeTab) {
        case "In Stock":
          tabMatch = product.stock > 10; // Items with more than 10 in stock
          break;
        case "Low Stock":
          tabMatch = product.stock > 0 && product.stock <= 100; // Low stock threshold
          break;
        case "Out of Stock":
          tabMatch = product.stock === 0;
          break;
        case "Expired":
          // Check if expiry date is in the past
          const expiryDate = new Date(
            product.expiry_date.split("/").reverse().join("-")
          );
          tabMatch = expiryDate < new Date();
          break;
        case "All Products":
        default:
          tabMatch = true;
      }

      // Apply search filter
      const searchMatch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.batch_no.toLowerCase().includes(searchTerm.toLowerCase());

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
          case "Product Name (A-Z)":
            return a.name.localeCompare(b.name);
          case "Product Name (Z-A)":
            return b.name.localeCompare(a.name);
          case "By Stock (High to Low)":
            return b.stock - a.stock;
          case "By Stock (Low to High)":
            return a.stock - b.stock;
          // case "Selling Price - Low to High":
          //   return (a.sellingPrice || 0) - (b.sellingPrice || 0);
          // case "Selling Price - High to Low":
          //   return (b.sellingPrice || 0) - (a.sellingPrice || 0);
          case "Expiry Date (Earliest)":
            const dateA = new Date(
              a.expiry_date.split("/").reverse().join("-")
            );
            const dateB = new Date(
              b.expiry_date.split("/").reverse().join("-")
            );
            return dateA.getTime() - dateB.getTime();
          case "Expiry Date (Latest)":
            const dateC = new Date(
              a.expiry_date.split("/").reverse().join("-")
            );
            const dateD = new Date(
              b.expiry_date.split("/").reverse().join("-")
            );
            return dateD.getTime() - dateC.getTime();
          default:
            return 0;
        }
      });
    }

    return filtered;
  };

  const handleProductAction = (action: string, id: string) => {
    const product = products.find((p) => p.id === id);

    switch (action) {
      case "view":
        alert(`Viewing details for: ${product?.name}`);
        break;
      case "history":
        if (product) {
          setSelectedProductHistory({
            productName: product.name,
            productId: product.id,
            history: sampleHistory, // In real app, fetch actual history for this product
          });
          setHistoryModalOpen(true);
        }
        break;
      case "edit":
        if (product) {
          const modalItem = convertToModalFormat(product);
          openEditModal(modalItem);
        }
        break;
      case "unfeature":
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, featured: false } : p))
        );
        break;
      case "deactivate":
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "Inactive" } : p))
        );
        break;
      case "delete":
        if (confirm(`Are you sure you want to delete ${product?.name}?`)) {
          setProducts((prev) => prev.filter((p) => p.id !== id));
          setSelectedItems((prev) => prev.filter((item) => item !== id));
        }
        break;
    }
  };

  const handleSelectItem = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(filteredProducts.map((p) => p.id));
    } else {
      setSelectedItems([]);
    }
  };
  const convertToModalFormat = (item: inventoryItem): InventoryItem => ({
    id: item.id,
    productName: item.name,
    batchNumber: item.batch_no,
    expiryDate: item.expiry_date,
    quantity: item.stock,
    reorderLevel: 100, // Default value or get from your data if available
    location: "Shelf A1", // Default value or get from your data if available
    manufacturer: "GSK", // Default value or get from your data if available
    category: item.category,
  });

  const convertFromModalFormat = (item: InventoryItem): inventoryItem => ({
    id: item.id || Date.now().toString(),
    name: item.productName,
    batch_no: item.batchNumber,
    code: generateCode(), // Generate a unique code
    subcategory: "Pharma", // Default or map from category
    category: item.category,
    expiry_date: item.expiryDate,
    stock: item.quantity,
    status: "Active",
  });

  const generateCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  const handleAddItem = (item: InventoryItem) => {
    const newProduct = convertFromModalFormat(item);
    setProducts((prev) => [...prev, newProduct]);
    console.log("Added new item:", newProduct);
  };
  const handleEditItem = (item: InventoryItem) => {
    const updatedProduct = convertFromModalFormat(item);
    setProducts((prev) =>
      prev.map((p) => (p.id === item.id ? updatedProduct : p))
    );
    console.log("Updated item:", updatedProduct);
  };

  const handleExportPDF = () => {
    const currentFilters = {
      searchTerm,
      selectedCategory,
      activeTab,
    };

    generateInventoryPDF(filteredProducts, currentFilters);
  };
  // Add this function after your existing handlers
  const handleBulkAction = (action: string) => {
    switch (action) {
      case "delete":
        if (
          confirm(
            `Are you sure you want to delete ${selectedItems.length} selected items?`
          )
        ) {
          setProducts((prev) =>
            prev.filter((p) => !selectedItems.includes(p.id))
          );
          setSelectedItems([]);
        }
        break;
      case "export":
        const selectedProducts = products.filter((p) =>
          selectedItems.includes(p.id)
        );
        generateInventoryPDF(selectedProducts, {
          searchTerm: "Selected Items",
          selectedCategory: "All Categories",
          activeTab: "Selected",
        });
        break;
      case "print_labels":
        alert(`Printing labels for ${selectedItems.length} selected items`);
        break;
    }
    setBulkActionsOpen(false);
  };

  const filteredProducts = getFilteredAndSortedProducts();

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#161D1F]">
          Inventory Management
        </h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 text-sm px-4 py-2 border text-[12px] border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50 transition-colors">
            <Scan className="w-4 h-4" />
            Scan Barcode
          </button>
          <button className="flex items-center gap-2 text-sm px-4 py-2 border text-[12px] border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50 transition-colors">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            className="flex items-center gap-2 text-sm px-4 py-2 text-[12px] bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors"
            onClick={openAddModal}
          >
            <Plus className="w-4 h-4" />
            Add Inventory Item
          </button>
        </div>
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
      <div className="flex justify-between items-center gap-1 mb-4">
        <div className="flex gap-1 bg-[#F8F8F8] rounded-lg">
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

        {/* Bulk Actions Dropdown - only show when items are selected */}
        {selectedItems.length > 0 && (
          <div className="relative" ref={bulkActionsRef}>
            <button
              onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-[#899193] text-[#899193] rounded-lg hover:bg-[#F9F9F9] text-[10px] font-medium transition-colors"
            >
              Actions ({selectedItems.length})
              <ChevronDown className="w-4 h-4" />
            </button>
            {bulkActionsOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                {bulkActions.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => handleBulkAction(action.value)}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="bg-white rounded-tl rounded-tr border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-[16px] font-medium text-[#161D1F]">
            {activeTab}
            <span className="text-[8px] text-[#899193] font-normal ml-2">
              {filteredProducts.length} Products
            </span>
          </h3>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedItems.length === filteredProducts.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-[#0088B1] border-gray-300 rounded focus:ring-[#0088B1]"
                  />
                </div>
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  tracking-wider">
                Batch Number
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  tracking-wider">
                Expiry Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <InventoryCard
                  key={product.id}
                  inventoryItem={product}
                  isSelected={selectedItems.includes(product.id)}
                  onSelect={(id, selected) => handleSelectItem(id, selected)}
                  onHistory={(id) => handleProductAction("history", id)}
                  onEdit={(id) => handleProductAction("edit", id)}
                  onUnfeature={(id) => handleProductAction("unfeature", id)}
                  onDeactivate={(id) => handleProductAction("deactivate", id)}
                  onDelete={(id) => handleProductAction("delete", id)}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <FileText className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-2">
                      No products found
                    </p>
                    <p className="text-sm">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ProductHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        productName={selectedProductHistory.productName}
        productId={selectedProductHistory.productId}
        history={selectedProductHistory.history}
      />
      <AddInventoryModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={mode === "edit" ? handleEditItem : handleAddItem}
        editItem={editItem}
        mode={mode}
      />
    </div>
  );
}
