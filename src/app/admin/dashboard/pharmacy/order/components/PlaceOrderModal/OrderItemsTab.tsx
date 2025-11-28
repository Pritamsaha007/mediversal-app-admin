import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2, Search, X } from "lucide-react";
import { getProductsWithPagination } from "../../../../pharmacy/product/services/ProductService";
import { useAdminStore } from "@/app/store/adminStore";
import { CreateOrderItem, OrderItem, Product } from "../../types/types";
import Image from "next/image";
import { useOrderStore } from "../../store/placeOrderStore";

const OrderItemsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchLoadingMore, setIsSearchLoadingMore] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const { token } = useAdminStore();
  const { orderItems, updateOrderItems, updatePaymentMethod } = useOrderStore();
  const pageSize = 20;
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  console.log(orderItems, "jksa");
  const DELIVERY_CHARGE_THRESHOLD = 499;
  const DELIVERY_CHARGE = 40;
  const HANDLING_PACKAGING_FEE = 5;

  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const calculateCharges = () => {
    const subtotal = orderItems.reduce(
      (total, item) =>
        total + Number(item.sellingPrice) * Number(item.quantity),
      0
    );

    const deliveryCharge =
      subtotal < DELIVERY_CHARGE_THRESHOLD ? DELIVERY_CHARGE : 0;

    const handlingPackagingFee = HANDLING_PACKAGING_FEE;

    const total = subtotal + deliveryCharge + handlingPackagingFee;

    return {
      subtotal,
      deliveryCharge,
      handlingPackagingFee,
      total,
    };
  };

  const handleSearch = useCallback(
    async (term: string, page: number = 1) => {
      if (!term.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        setSearchPage(1);
        setHasMoreSearch(true);
        return;
      }

      if (page === 1) {
        setIsSearching(true);
      } else {
        setIsSearchLoadingMore(true);
      }

      try {
        const currentToken = token;
        if (!currentToken) {
          console.error("No authentication token found");
          setIsSearching(false);
          setIsSearchLoadingMore(false);
          return;
        }

        const response = await getProductsWithPagination(
          (page - 1) * pageSize,
          pageSize,
          currentToken,
          {
            searchTerm: term.trim(),
          }
        );

        if (response.data?.products) {
          if (page === 1) {
            setSearchResults(response.data.products);
          } else {
            setSearchResults((prev) => [...prev, ...response.data.products]);
          }
          setHasMoreSearch(response.data.products.length === pageSize);
        } else {
          if (page === 1) {
            setSearchResults([]);
          }
          setHasMoreSearch(false);
        }
      } catch (error: any) {
        console.error("Search error:", error);
        if (page === 1) {
          setSearchResults([]);
        }
      } finally {
        if (page === 1) {
          setIsSearching(false);
        } else {
          setIsSearchLoadingMore(false);
        }
      }
    },
    [token, pageSize]
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
  }, [debouncedSearchTerm]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;

    if (
      isAtBottom &&
      !isSearchLoadingMore &&
      hasMoreSearch &&
      searchTerm.trim()
    ) {
      loadMoreSearchResults();
    }
  };

  const addToOrder = (product: Product) => {
    const existingItem = orderItems.find(
      (item) => item.productId === product.productId
    );

    if (existingItem) {
      const updatedItems = orderItems.map((item) =>
        item.productId === product.productId
          ? {
              ...item,
              quantity: item.quantity + 1,
              total: (item.quantity + 1) * Number(item.sellingPrice),
            }
          : item
      );
      updateOrderItems(updatedItems);
    } else {
      const newItem: CreateOrderItem = {
        productId: product.productId,
        quantity: 1,
        sellingPrice: product.SellingPrice,
        productName: product.ProductName || "",
        sku: "",
        tax: 0,
        discount: 0,
        hsn: 0,
        productLength: 0,
        productBreadth: 0,
        productHeight: 0,
        productWeight: 0,
      };

      updateOrderItems([...orderItems, newItem]);
    }

    setSearchTerm("");
    setSearchResults([]);
    setSearchPage(1);
    setHasMoreSearch(true);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchPage(1);
    setHasMoreSearch(true);
    setIsSearching(false);
    setIsSearchLoadingMore(false);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedItems = orderItems.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: newQuantity,
            total: newQuantity * Number(item.sellingPrice),
          }
        : item
    );
    updateOrderItems(updatedItems);
  };

  const removeItem = (productId: string) => {
    const updatedItems = orderItems.filter(
      (item) => item.productId !== productId
    );
    updateOrderItems(updatedItems);
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    updatePaymentMethod(method);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const ProductImage = ({ product }: { product: Product | OrderItem }) => {
    const imageUrl = (product as Product).imageUrls?.[0] || "";

    const productName =
      (product as Product).ProductName ||
      (product as OrderItem).productName ||
      "";

    if (imageUrl) {
      return (
        <Image
          src={imageUrl}
          alt={productName}
          className="w-12 h-12 object-contain rounded-lg border border-gray-200"
        />
      );
    }
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <span className="text-xs text-gray-400"></span>
      </div>
    );
  };

  const charges = calculateCharges();

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B0B6B8]" />
        <input
          type="text"
          placeholder="Search pharmacy products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] text-black focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-xs placeholder:text-gray-400"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {searchTerm && (
        <div
          ref={searchResultsRef}
          onScroll={handleScroll}
          className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto"
        >
          {isSearching ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0088B1]"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200">
                {searchResults.map((product) => (
                  <div
                    key={product.productId}
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => addToOrder(product)}
                  >
                    {/* <ProductImage product={product} /> */}
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
                        <div className="text-xs text-gray-500 mt-1">
                          {product.Composition}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-medium text-[#161D1F]">
                          {formatCurrency(product.SellingPrice)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            product.StockAvailableInInventory > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.StockAvailableInInventory > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {isSearchLoadingMore && (
                <div className="flex justify-center items-center py-4 border-t border-gray-200">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0088B1]"></div>
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
            <div className="text-center py-8 text-gray-500">
              No products found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
      {searchTerm && searchResults.length > 0 && (
        <p className="text-xs text-gray-500">
          Showing {searchResults.length} product
          {searchResults.length !== 1 ? "s" : ""}
          {hasMoreSearch && " - Scroll down to load more"}
        </p>
      )}

      <div>
        <h4 className="text-md font-medium text-[#161D1F] mb-4">
          Order Items {orderItems.length > 0 && `(${orderItems.length})`}
        </h4>

        {orderItems.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#161D1F]">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#161D1F]">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#161D1F]">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#161D1F]">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#161D1F]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr
                    key={item.productId}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {/* <ProductImage product={item} /> */}
                        <div className="ml-3">
                          <div className="text-xs font-medium text-[#161D1F]">
                            {item.productName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#161D1F]">
                      {formatCurrency(Number(item.sellingPrice))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="text-xs text-black w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-[#161D1F]">
                      {formatCurrency(Number(item.sellingPrice))}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No items in order
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Add medicines by searching in the search bar above.
        </p>
      </div>
      {orderItems.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6 space-y-6">
          <div>
            <div>
              <h5 className="text-sm font-medium text-[#161D1F] mb-4">
                Order Summary
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-600">
                    {formatCurrency(charges.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charge</span>
                  <span className="font-medium text-gray-600">
                    {charges.deliveryCharge > 0
                      ? formatCurrency(charges.deliveryCharge)
                      : "FREE"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Handling & Packaging</span>
                  <span className="font-medium text-gray-600">
                    {formatCurrency(charges.handlingPackagingFee)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-base font-semibold text-black">
                    <span>Total</span>
                    <span>{formatCurrency(charges.total)}</span>
                  </div>
                </div>
              </div>

              {charges.deliveryCharge > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    * Delivery charge of {formatCurrency(DELIVERY_CHARGE)}{" "}
                    applied for orders below{" "}
                    {formatCurrency(DELIVERY_CHARGE_THRESHOLD)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItemsTab;
