"use client";
import React, { useState } from "react";
import { Trash2, Plus, Minus, ShoppingCart, AlertCircle } from "lucide-react";
import { CustomerService } from "../services/customerService";
import { CartData } from "../type/customerDetailTypes";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";

interface CartItemsListProps {
  cartItems: CartData[];
  customerId: string;
  onCartUpdate: () => void;
  loading?: boolean;
  error?: string | null;
}

const CartItemsList: React.FC<CartItemsListProps> = ({
  cartItems,
  customerId,
  onCartUpdate,
  loading = false,
  error = null,
}) => {
  const { token } = useAdminStore();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const customerService = new CustomerService();
  const MAX_QUANTITY = 10;

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(numAmount || 0);
  };

  const getItemPrice = (item: CartData): number => {
    return (
      parseFloat(item.DiscountedPrice) || parseFloat(item.SellingPrice) || 0
    );
  };

  const getItemTotal = (item: CartData): number => {
    const price = getItemPrice(item);
    const quantity = item.quantity || 1;
    return price * quantity;
  };

  const updateQuantity = async (item: CartData, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > MAX_QUANTITY) {
      toast.error(
        `Maximum quantity of ${MAX_QUANTITY} allowed for this product`,
      );
      return;
    }

    setUpdatingItemId(item.productId);
    try {
      if (newQuantity > (item.quantity || 1)) {
        const addQuantity = newQuantity - (item.quantity || 1);
        await customerService.addToCart(
          customerId,
          {
            productId: item.productId,
            quantity: addQuantity,
          },
          token,
        );
      } else if (newQuantity < (item.quantity || 1)) {
        await customerService.DeleteFromCart(
          customerId,
          [item.productId],
          token,
        );
        if (newQuantity > 0) {
          await customerService.addToCart(
            customerId,
            {
              productId: item.productId,
              quantity: newQuantity,
            },
            token,
          );
        }
      }

      toast.success(`Quantity updated to ${newQuantity}`);
      onCartUpdate();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (item: CartData) => {
    setDeletingItemId(item.productId);
    try {
      await customerService.DeleteFromCart(customerId, [item.productId], token);
      toast.success(`${item.ProductName} removed from cart`);
      onCartUpdate();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setDeletingItemId(null);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + getItemTotal(item), 0);
  };

  const getTotalItemCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="animate-pulse flex space-x-2 justify-center">
          <div className="w-2 h-2 bg-[#0088B1] rounded-full"></div>
          <div className="w-2 h-2 bg-[#0088B1] rounded-full animation-delay-200"></div>
          <div className="w-2 h-2 bg-[#0088B1] rounded-full animation-delay-400"></div>
        </div>
        <p className="text-xs text-[#899193] mt-2">Loading cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <ShoppingCart className="w-12 h-12 text-[#D3D7D8] mx-auto mb-2" />
        <p className="text-sm text-[#899193]">Cart is empty</p>
        <p className="text-xs text-[#899193] mt-1">
          Add items using the "Add Items" button above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cartItems.map((item) => (
        <div key={item.productId} className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-xs font-medium text-[#161D1F]">
                {item.ProductName}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-[#0088B1]">
                  {formatCurrency(getItemPrice(item))}
                </span>
                {parseFloat(item.DiscountedPrice) <
                  parseFloat(item.SellingPrice) && (
                  <span className="text-[10px] text-[#899193] line-through">
                    {formatCurrency(item.SellingPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-[#899193]">
                  Manufacturer: {item.ManufacturerName}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {item.PrescriptionRequired === "Yes" && (
                  <span className="text-[10px] bg-[#FFD700] text-white px-1.5 py-0.5 rounded">
                    Prescription Required
                  </span>
                )}
                {item.ColdChain === "Yes" && (
                  <span className="text-[10px] bg-[#0088B1] text-white px-1.5 py-0.5 rounded">
                    Cold Chain
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => removeItem(item)}
                disabled={deletingItemId === item.productId}
                className="ml-2 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              >
                {deletingItemId === item.productId ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartItemsList;
