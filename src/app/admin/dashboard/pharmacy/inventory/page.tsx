"use client";
import { InventoryCard } from "@/app/admin/dashboard/pharmacy/inventory/components/InventoryCard";
import { inventoryItem, Product } from "@/app/types/product";
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
import {
  AddInventoryModal,
  useAddInventoryModal,
} from "./components/AddInventoryModal";

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
  const { isOpen, openModal, closeModal } = useAddInventoryModal();

  const [products, setProducts] = useState<inventoryItem[]>([
    {
      id: "1",
      name: "Amoxicillin 250mg",
      batch_no: "BATCH-2002",
      code: "ABCD",
      subcategory: "Pharma",
      category: "Antibiotic",
      expiry_date: "13/02/2025",
      stock: 1200,
      status: "Active",
    },
    {
      id: "2",
      name: "Ibuprofen 200mg",
      batch_no: "BATCH-2003",
      code: "EFGH",
      subcategory: "Pharma",
      category: "Analgesic",
      expiry_date: "15/03/2025",
      stock: 800,
      status: "Active",
    },
    {
      id: "3",
      name: "Vitamin D3 1000IU",
      batch_no: "BATCH-2004",
      code: "IJKL",
      subcategory: "Antihypertensive",
      category: "Antihypertensive",
      expiry_date: "20/04/2025",
      stock: 8,
      status: "Active",
    },
    {
      id: "4",
      name: "Digital Thermometer",
      batch_no: "BATCH-2005",
      code: "MNOP",
      subcategory: "Diagnostic",
      category: "Proton Pump Inhibitor",
      expiry_date: "10/12/2026",
      stock: 0,
      status: "Inactive",
    },
    {
      id: "5",
      name: "Hand Sanitizer 250ml",
      batch_no: "BATCH-2006",
      code: "QRST",
      subcategory: "Hygiene",
      category: "Antidepressant",
      expiry_date: "01/01/2024",
      stock: 300,
      status: "Active",
    },
    {
      id: "6",
      name: "Paracetamol 500mg",
      batch_no: "BATCH-2007",
      code: "UVWX",
      subcategory: "Pharma",
      category: "Diuretic",
      expiry_date: "30/06/2025",
      stock: 5,
      status: "Active",
    },
  ]);

  const categories = [
    "All Categories",
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

  const sortOptions = [
    "Product Name (A-Z)",
    "Product Name (Z-A)",
    "Selling Price - Low to High",
    "Selling Price - High to Low",
    "Expiry Date (Earliest)",
    "Expiry Date (Latest)",
    "By Stock",
    "Discount",
  ];

  const tabs = [
    "All Products",
    "In Stock",
    "Low Stock",
    "Out of Stock",
    "Expired",
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
      case "edit":
        alert(`Editing: ${product?.name}`);
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
  const handleAddItem = (item: InventoryItem) => {
    // Handle the new item - send to API, update state, etc.
    console.log("New item:", item);
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
            onClick={openModal}
          >
            <Plus className="w-4 h-4" />
            Add Inventory Item
          </button>
          <AddInventoryModal
            isOpen={isOpen}
            onClose={closeModal}
            onSubmit={handleAddItem}
          />
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
            <button className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

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
                <input
                  type="checkbox"
                  checked={
                    filteredProducts.length > 0 &&
                    selectedItems.length === filteredProducts.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-[#0088B1] focus:ring-[#0088B1]"
                />
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
                  onView={(id) => handleProductAction("view", id)}
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
    </div>
  );
}
