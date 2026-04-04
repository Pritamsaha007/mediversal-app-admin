import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2, Search, X, Ticket, ChevronRight } from "lucide-react";
import { getProductsWithPaginationAPI } from "../../../../pharmacy/product/services/ProductService";
import { useAdminStore } from "@/app/store/adminStore";
import { CreateOrderItem, OrderItem, Product } from "../../types/types";
import Image from "next/image";
import { useOrderStore } from "../../store/placeOrderStore";
import toast from "react-hot-toast";
import { getAllCoupons } from "@/app/admin/dashboard/coupons/services";
import { CouponItem } from "@/app/types/auth.types";
interface OrderItemsTabProps {
  onCouponChange?: (coupon: CouponItem | null) => void;
}

const OrderItemsTab: React.FC<OrderItemsTabProps> = ({ onCouponChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchLoadingMore, setIsSearchLoadingMore] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponItem | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<CouponItem[]>([]);
  const [showCouponList, setShowCouponList] = useState(false);
  const { token } = useAdminStore();
  const { orderItems, updateOrderItems } = useOrderStore();
  const pageSize = 20;
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const MAX_QUANTITY = 10;
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

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const coupons = await getAllCoupons();
      setAvailableCoupons(coupons);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    }
  };

  const calculateEligibleItemsTotal = () => {
    return orderItems.reduce((total, item) => {
      const isEligible = (item as any).discount_allowed !== false;
      if (isEligible) {
        return total + Number(item.sellingPrice) * Number(item.quantity);
      }
      return total;
    }, 0);
  };

  const calculateCharges = () => {
    const subtotal = orderItems.reduce(
      (total, item) =>
        total + Number(item.sellingPrice) * Number(item.quantity),
      0,
    );

    const eligibleItemsTotal = calculateEligibleItemsTotal();
    const nonEligibleItemsTotal = subtotal - eligibleItemsTotal;

    let couponDiscount = 0;

    if (selectedCoupon && eligibleItemsTotal > 0) {
      const discountValue = Number(selectedCoupon.discount_value);
      const minOrderValue = Number(selectedCoupon.minimum_order_value) || 0;

      if (eligibleItemsTotal >= minOrderValue) {
        if (selectedCoupon.discount_type === "fixed") {
          couponDiscount = Math.min(discountValue, eligibleItemsTotal);
        } else if (selectedCoupon.discount_type === "percentage") {
          couponDiscount = (eligibleItemsTotal * discountValue) / 100;
        }
      }
    }

    const deliveryCharge =
      subtotal < DELIVERY_CHARGE_THRESHOLD ? DELIVERY_CHARGE : 0;
    const handlingPackagingFee = HANDLING_PACKAGING_FEE;
    const total =
      subtotal - couponDiscount + deliveryCharge + handlingPackagingFee;

    return {
      subtotal,
      eligibleItemsTotal,
      nonEligibleItemsTotal,
      couponDiscount,
      deliveryCharge,
      handlingPackagingFee,
      total,
      hasNonEligibleItems: nonEligibleItemsTotal > 0,
      isNonEligibleItemsPresent: eligibleItemsTotal === 0,
    };
  };

  const handleApplyCoupon = (coupon: CouponItem) => {
    const eligibleItemsTotal = calculateEligibleItemsTotal();
    const minOrderValue = Number(coupon.minimum_order_value) || 0;

    if (eligibleItemsTotal === 0) {
      toast.error(
        "Coupon cannot be applied as no items are eligible for discount",
      );
      return;
    }

    if (minOrderValue > 0 && eligibleItemsTotal < minOrderValue) {
      toast.error(
        `Minimum eligible order value of ₹${minOrderValue} required for this coupon. Current eligible total: ₹${eligibleItemsTotal.toFixed(2)}`,
      );
      return;
    }

    if (coupon.status !== "active") {
      toast.error("This coupon is not active");
      return;
    }

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      toast.error("This coupon has expired");
      return;
    }

    setSelectedCoupon(coupon);
    onCouponChange?.(coupon);
    toast.success(`Coupon ${coupon.coupon_code} applied successfully!`);
    setShowCouponInput(false);
    setShowCouponList(false);
  };

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
    onCouponChange?.(null);
    toast.success("Coupon removed");
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

        const response = await getProductsWithPaginationAPI(
          (page - 1) * pageSize,
          pageSize,
          {
            searchTerm: term.trim(),
          },
        );

        if (response.products) {
          const transformedProducts = response.products.map((product: any) => ({
            ...product,
            description: product.description || "",
            quantity: product.quantity || 0,
            delivery: product.delivery || 0,
            discountPercentage: product.discountPercentage || 0,
            discount_allowed: product.discount_allowed !== false,
          }));

          if (page === 1) {
            setSearchResults(transformedProducts);
          } else {
            setSearchResults((prev) => [...prev, ...transformedProducts]);
          }
          setHasMoreSearch(response.products.length === pageSize);
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
    [token, pageSize],
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
      (item) => item.productId === product.productId,
    );

    if (existingItem) {
      if (existingItem.quantity + 1 > MAX_QUANTITY) {
        toast.error(
          `Maximum quantity of ${MAX_QUANTITY} reached for this product`,
        );
        return;
      }

      const updatedItems = orderItems.map((item) =>
        item.productId === product.productId
          ? {
              ...item,
              quantity: item.quantity + 1,
              total: (item.quantity + 1) * Number(item.sellingPrice),
            }
          : item,
      );
      updateOrderItems(updatedItems);
      toast.success(`Added 1 more. Total: ${existingItem.quantity + 1}`);
    } else {
      const isDiscountAllowed = (product as any).discount_allowed !== false;

      const newItem: CreateOrderItem = {
        productId: product.productId,
        quantity: 1,
        sellingPrice: Number(product.SellingPrice),
        productName: product.ProductName || "",
        sku: product.SKU || "",
        tax: 0,
        discount: product.discountPercentage || 0,
        discount_allowed: isDiscountAllowed,
        hsn: (product as any).hsn || "",
        productLength: (product as any).productLength || 0,
        productBreadth: (product as any).productBreadth || 0,
        productHeight: (product as any).productHeight || 0,
        productWeight: (product as any).productWeight || 0,
      };

      updateOrderItems([...orderItems, newItem]);
      toast.success(`Added ${product.ProductName} (Qty: 1)`);
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
    if (newQuantity > MAX_QUANTITY) {
      toast.error(`Maximum quantity of ${MAX_QUANTITY} allowed`);
      return;
    }

    const updatedItems = orderItems.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: newQuantity,
            total: newQuantity * Number(item.sellingPrice),
          }
        : item,
    );
    updateOrderItems(updatedItems);
  };

  const removeItem = (productId: string) => {
    const updatedItems = orderItems.filter(
      (item) => item.productId !== productId,
    );
    updateOrderItems(updatedItems);
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
  const eligibleItemsTotal = calculateEligibleItemsTotal();

  const activeCoupons = availableCoupons.filter(
    (coupon) =>
      coupon.status === "active" &&
      (!coupon.expiry_date || new Date(coupon.expiry_date) >= new Date()),
  );

  const hasEligibleItems = charges.eligibleItemsTotal > 0;

  return (
    <div className="space-y-6 animate-fade-in">
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

      {/* Apply Coupon Section - Only show if there are eligible items */}
      {orderItems.length > 0 && (
        <div>
          {!showCouponInput && !selectedCoupon ? (
            <button
              onClick={() => {
                if (!hasEligibleItems) {
                  toast.error(
                    "No items in your cart are eligible for discount",
                  );
                  return;
                }
                setShowCouponInput(true);
              }}
              className="w-full flex items-center justify-between p-4 border border-dashed border-[#0088B1] rounded-lg bg-[#E8F4F7] hover:bg-[#D6EEF3] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-[#0088B1]" />
                <span className="text-sm font-medium text-[#0088B1]">
                  Apply Coupon
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0088B1]" />
            </button>
          ) : selectedCoupon ? (
            <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Coupon Applied:{" "}
                    <span className="font-semibold text-green-600">
                      {selectedCoupon.coupon_code}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedCoupon.coupon_name} - Discount:{" "}
                    {selectedCoupon.discount_type === "percentage"
                      ? `${selectedCoupon.discount_value}% off`
                      : `₹${selectedCoupon.discount_value} off`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Applied on eligible items total:{" "}
                    {formatCurrency(charges.eligibleItemsTotal)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              {activeCoupons.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowCouponList(!showCouponList)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {showCouponList
                        ? "Hide available coupons"
                        : "Show all available coupons"}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${showCouponList ? "rotate-90" : ""}`}
                    />
                  </button>

                  {showCouponList && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                      {activeCoupons.map((coupon) => {
                        const minOrderValue =
                          Number(coupon.minimum_order_value) || 0;
                        const isApplicable =
                          hasEligibleItems &&
                          eligibleItemsTotal >= minOrderValue;

                        return (
                          <div
                            key={coupon.id}
                            className={`p-3 border rounded-lg transition-colors ${
                              isApplicable
                                ? "border-gray-200 hover:bg-gray-50 cursor-pointer"
                                : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                            }`}
                            onClick={() =>
                              isApplicable && handleApplyCoupon(coupon)
                            }
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-[#0088B1]">
                                    {coupon.coupon_code}
                                  </p>
                                  {!isApplicable && (
                                    <span className="text-xs text-gray-400">
                                      {!hasEligibleItems
                                        ? "No eligible items"
                                        : `Need ₹${minOrderValue} eligible items`}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {coupon.coupon_name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {coupon.discount_type === "percentage"
                                    ? `${coupon.discount_value}% OFF`
                                    : `₹${coupon.discount_value} OFF`}
                                  {minOrderValue > 0 &&
                                    ` on min eligible order ₹${minOrderValue}`}
                                </p>
                                {coupon.description && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {coupon.description}
                                  </p>
                                )}
                              </div>
                              {isApplicable && (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                <p>
                  Current eligible items total:{" "}
                  <strong>{formatCurrency(eligibleItemsTotal)}</strong>
                </p>
                <p className="text-gray-400 mt-1">
                  Coupons apply only to discountable items and require minimum
                  eligible amount.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCouponInput(false);
                  setShowCouponList(false);
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {orderItems.length > 0 && !hasEligibleItems && !selectedCoupon && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500">
              Coupons cannot be applied as no items in your cart are eligible
              for discount.
            </p>
          </div>
        </div>
      )}

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
                        <span className="text-xs text-gray-500">+1 Qty</span>
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
                {orderItems.map((item) => {
                  const isEligible = (item as any).discount_allowed !== false;
                  return (
                    <tr
                      key={item.productId}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <div className="text-xs font-medium text-[#161D1F]">
                              {item.productName}
                              {!isEligible && (
                                <span className="ml-2 text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                                  Not discountable
                                </span>
                              )}
                              {isEligible && (
                                <span className="ml-2 text-xs text-green-500 bg-green-50 px-1.5 py-0.5 rounded">
                                  Discountable
                                </span>
                              )}
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
                          <span className="text-xs text-black w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={item.quantity >= MAX_QUANTITY}
                            className={`w-6 h-6 flex items-center justify-center border rounded ${
                              item.quantity >= MAX_QUANTITY
                                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                : "border-gray-300 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            +
                          </button>
                        </div>
                        {item.quantity >= MAX_QUANTITY && (
                          <p className="text-xs text-gray-400 mt-1">
                            Max {MAX_QUANTITY} reached
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-[#161D1F]">
                        {formatCurrency(
                          Number(item.sellingPrice) * item.quantity,
                        )}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No items in order
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Add medicines by searching above. Each click adds 1 quantity. Maximum{" "}
          {MAX_QUANTITY} per product.
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

                {charges.nonEligibleItemsTotal > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Non-Discountable Items</span>
                    <span>{formatCurrency(charges.nonEligibleItemsTotal)}</span>
                  </div>
                )}

                {charges.eligibleItemsTotal > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discountable Items</span>
                    <span>{formatCurrency(charges.eligibleItemsTotal)}</span>
                  </div>
                )}

                {charges.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(charges.couponDiscount)}</span>
                  </div>
                )}

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
