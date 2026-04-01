"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Search, Plus, Package } from "lucide-react";
import { useAdminStore } from "@/app/store/adminStore";
import { CustomerService } from "../services/customerService";
import Image from "next/image";
import toast from "react-hot-toast";
import { getProductsWithPaginationAPI } from "../../pharmacy/product/services/ProductService";

interface Product {
  productId: string;
  ProductName: string;
  SellingPrice: number | string;
  DiscountedPrice?: number | string;
  ManufacturerName?: string;
  Composition?: string;
  SKU?: string;
  imageUrls?: string[];
  PrescriptionRequired?: string;
  ColdChain?: string;
  discount_allowed?: boolean;
  discountPercentage?: number;
  StockAvailableInInventory?: number;
}

interface AddProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  onProductsAdded: () => void;
}

const AddProductsModal: React.FC<AddProductsModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  onProductsAdded,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchLoadingMore, setIsSearchLoadingMore] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>(
    {},
  );
  const { token } = useAdminStore();
  const pageSize = 20;
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const customerService = new CustomerService();

  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleSearch = useCallback(
    async (term: string, page: number = 1) => {
      if (!term.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        setSearchPage(1);
        setHasMoreSearch(true);
        return;
      }

      if (page === 1) setIsSearching(true);
      else setIsSearchLoadingMore(true);

      try {
        const response = await getProductsWithPaginationAPI(
          (page - 1) * pageSize,
          pageSize,
          { searchTerm: term.trim() },
        );

        if (response.products) {
          const transformed = response.products.map((product: any) => ({
            ...product,
            SellingPrice: product.SellingPrice || product.sellingPrice || 0,
            DiscountedPrice: product.DiscountedPrice || product.discountedPrice,
          }));
          if (page === 1) setSearchResults(transformed);
          else setSearchResults((prev) => [...prev, ...transformed]);
          setHasMoreSearch(response.products.length === pageSize);
        } else {
          if (page === 1) setSearchResults([]);
          setHasMoreSearch(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        if (page === 1) setSearchResults([]);
      } finally {
        if (page === 1) setIsSearching(false);
        else setIsSearchLoadingMore(false);
      }
    },
    [pageSize],
  );

  const loadMoreSearchResults = useCallback(() => {
    if (
      !isSearchLoadingMore &&
      !isSearching &&
      hasMoreSearch &&
      searchTerm.trim()
    ) {
      const nextPage = searchPage + 1;
      setSearchPage(nextPage);
      handleSearch(searchTerm, nextPage);
    }
  }, [
    isSearchLoadingMore,
    isSearching,
    hasMoreSearch,
    searchTerm,
    searchPage,
    handleSearch,
  ]);

  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      setSearchPage(1);
      handleSearch(debouncedSearchTerm, 1);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setSearchPage(1);
      setHasMoreSearch(true);
    }
  }, [debouncedSearchTerm, handleSearch]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (
      el.scrollHeight - el.scrollTop <= el.clientHeight + 50 &&
      !isSearchLoadingMore &&
      hasMoreSearch &&
      searchTerm.trim()
    ) {
      loadMoreSearchResults();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchPage(1);
    setHasMoreSearch(true);
    setIsSearching(false);
    setIsSearchLoadingMore(false);
  };

  const addToCart = async (product: Product) => {
    if (!token || !customerId) {
      toast.error("Unable to add to cart");
      return;
    }

    setAddingProductId(product.productId);

    try {
      const currentQuantity = cartQuantities[product.productId] ?? 0;
      const newQuantity = currentQuantity + 1;

      const productData = {
        ...product,
        quantity: newQuantity,
      };

      await customerService.addToCart(customerId, productData, token);

      setCartQuantities((prev) => ({
        ...prev,
        [product.productId]: newQuantity,
      }));

      toast.success(`${product.ProductName} added to cart`);
      onProductsAdded();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setAddingProductId(null);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(num || 0);
  };

  const ProductImage = ({
    imageUrl,
    productName,
  }: {
    imageUrl?: string;
    productName: string;
  }) => {
    if (imageUrl) {
      return (
        <Image
          src={imageUrl}
          alt={productName}
          width={48}
          height={48}
          className="w-12 h-12 object-contain rounded-lg border border-gray-200"
        />
      );
    }
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <Package className="w-5 h-5 text-gray-400" />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-fade-in">
      {/* Modal — flex column so footer sticks to bottom */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-xl mx-4">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-[16px] font-semibold text-[#161D1F]">
              Add Products to Cart
            </h2>
            <p className="text-[12px] text-[#899193] mt-0.5">
              Customer: {customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#899193] hover:text-[#161D1F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B6B8]" />
            <input
              type="text"
              placeholder="Search pharmacy products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-10 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] text-black focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-xs placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search results */}
          {searchTerm ? (
            <>
              <div
                ref={searchResultsRef}
                onScroll={handleScroll}
                className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto"
              >
                {isSearching ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0088B1]" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="divide-y divide-gray-200">
                      {searchResults.map((product) => (
                        <div
                          key={product.productId}
                          className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() =>
                            addingProductId !== product.productId &&
                            addToCart(product)
                          }
                        >
                          {/* <ProductImage
                            imageUrl={product.imageUrls?.[0]}
                            productName={product.ProductName}
                          /> */}
                          <div className="ml-4 flex-1">
                            <div className="text-xs font-medium text-[#161D1F]">
                              {product.ProductName}
                            </div>
                            {product.ManufacturerName && (
                              <div className="text-xs text-gray-500 mt-1">
                                {product.ManufacturerName}
                              </div>
                            )}
                            {product.Composition && (
                              <div className="text-xs text-gray-400 mt-1">
                                {product.Composition}
                              </div>
                            )}
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-[#0088B1]">
                                  {formatCurrency(
                                    parseFloat(
                                      product.DiscountedPrice as string,
                                    ) ||
                                      parseFloat(
                                        product.SellingPrice as string,
                                      ) ||
                                      0,
                                  )}
                                </span>
                                {product.DiscountedPrice &&
                                  parseFloat(
                                    product.DiscountedPrice as string,
                                  ) <
                                    parseFloat(
                                      product.SellingPrice as string,
                                    ) && (
                                    <span className="text-[10px] text-gray-400 line-through">
                                      {formatCurrency(
                                        parseFloat(
                                          product.SellingPrice as string,
                                        ),
                                      )}
                                    </span>
                                  )}
                              </div>
                              <div className="flex items-center gap-2">
                                {product.PrescriptionRequired === "Yes" && (
                                  <span className="text-[10px] bg-[#FFD700] text-white px-1.5 py-0.5 rounded">
                                    Rx
                                  </span>
                                )}
                                {product.ColdChain === "Yes" && (
                                  <span className="text-[10px] bg-[#0088b1] text-white px-1.5 py-0.5 rounded">
                                    Cold Chain
                                  </span>
                                )}
                                {product.StockAvailableInInventory !==
                                  undefined && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                                      product.StockAvailableInInventory > 0
                                        ? "bg-green-500 text-white"
                                        : "bg-red-500 text-white"
                                    }`}
                                  >
                                    {product.StockAvailableInInventory > 0
                                      ? `${product.StockAvailableInInventory} in stock`
                                      : "Out of stock"}
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">
                                  {addingProductId === product.productId ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0088B1]" />
                                  ) : (
                                    "+1 Qty"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {isSearchLoadingMore && (
                      <div className="flex justify-center items-center py-4 border-t border-gray-200">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0088B1]" />
                        <span className="ml-2 text-xs text-gray-500">
                          Loading more...
                        </span>
                      </div>
                    )}

                    {!hasMoreSearch && searchResults.length > 0 && (
                      <div className="text-center py-4 text-xs text-gray-500 border-t border-gray-200">
                        No more products to load
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No products found for "{searchTerm}"
                  </div>
                )}
              </div>

              {searchResults.length > 0 && (
                <p className="text-xs text-gray-500">
                  Showing {searchResults.length} product
                  {searchResults.length !== 1 ? "s" : ""}
                  {hasMoreSearch && " — scroll down to load more"}
                </p>
              )}
            </>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Start typing to search for products
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Search by product name, manufacturer, or composition
              </p>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="flex-shrink-0 flex justify-end px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductsModal;
