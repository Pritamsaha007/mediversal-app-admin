import React from "react";
import { Product } from "../types/product";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <div className="bg-white rounded-xl shadow-xl w-[600px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
        >
          &times;
        </button>

        <h2 className="text-[16px] font-semibold text-[#161D1F] mb-2">
          Product Detail
        </h2>
        <h3 className="text-[14px] text-[#161D1F]">{product.name}</h3>
        <p className="text-[10px] text-[#899193]">
          {product.code} &nbsp; | &nbsp; {product.manufacturer || "N/A"}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          <h1 className="text-[#161D1F] font-semibold text-[10px]">Tags:</h1>
          {product.substitutesCount > 0 && (
            <span className="border-[#0088B1] text-[#0088B1] border text-[8px] font-medium px-2 py-1 rounded">
              {product.substitutesCount} Substitutes
            </span>
          )}
          {product.similarCount > 0 && (
            <span className="border-[#9B51E0] border text-[#9B51E0] text-[8px] font-medium px-2 py-1 rounded">
              {product.similarCount} Similar
            </span>
          )}
          {product.status === "Active" && (
            <span className="border-[#50B57F] border text-[#50B57F] text-[8px] font-medium px-2 py-1 rounded">
              Active
            </span>
          )}
          {product.featured && (
            <span className="border-[#F2994A] border text-[#F2994A] text-[8px] font-medium px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>

        <div className="mt-2 text-sm text-gray-700">
          <p>
            <span className=" text-[#161D1F] font-semibold text-[10px]">
              Description:
            </span>
            <span className="text-[#161D1F] text-[10px]">
              {product.description || "No1234 description available."}
            </span>
          </p>
          <p>
            <span className="text-[#161D1F] font-semibold text-[10px]">
              Category:
            </span>
            <span className="text-[#161D1F] text-[10px]">
              {product.category}
            </span>
          </p>
        </div>

        <div className="mt-1 grid grid-cols-2 gap-2 text-sm text-gray-700">
          <p>
            <span className="text-[#161D1F] font-semibold text-[10px]">
              Discount:
            </span>
            <span className="text-[#161D1F] text-[10px]">
              {product.discount ? `${product.discount}% OFF` : "No Discount"}
            </span>
          </p>
          <p>
            <span className="text-[#161D1F] font-semibold text-[10px]">
              Stock:
            </span>
            <span className="text-[#161D1F] text-[10px]">{product.stock}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
