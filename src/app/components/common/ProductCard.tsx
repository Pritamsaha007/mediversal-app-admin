import React, { useEffect, useRef, useState } from "react";
import {
  Eye,
  Edit,
  Link,
  MoreVertical,
  TableCellsSplit,
  Pill,
} from "lucide-react";
import { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onUnfeature: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

export const ProductCard: React.FC<{
  product: Product;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onUnfeature: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}> = ({
  product,
  onView,
  onEdit,
  onUnfeature,
  onDeactivate,
  onDelete,
  isSelected,
  onSelect,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const getStockStatus = (stock: number) => {
    if (stock <= 5)
      return {
        label: `Low Stock (${stock})`,
        color:
          "bg-orange-[#FFF2E5] text-[#FF8000] border border-[#FF8000] text-[8px]",
      };
    return { label: stock.toString(), color: "" };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <tr className="border-y-1 hover:bg-gray-50 border-[#D3D7D8]">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(product.id, e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
      </td>
      <td className="px-4 py-4">
        <div>
          <div className="font-medium text-[12px] text-gray-900">
            {product.name}
          </div>
          <div className="text-[10px] text-gray-500">
            {product.code} | {product.subcategory}
          </div>
          <div className="flex gap-2 mt-2">
            {product.substitutes && (
              <span className="px-2 py-1 text-xs  text-[#0088B1] rounded border border-[#0088B1]">
                {product.substitutes} substitute(s)
              </span>
            )}
            {product.similar && (
              <span className="px-2 py-1 text-xs  text-[#9B51E0] rounded border border-[#9B51E0]">
                {product.similar} similar
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-gray-500" />
          <div>
            <div className="font-medium text-[10px] text-gray-900">
              {product.category}
            </div>
            <div className="text-sm text-gray-500 text-[8px]">
              {product.subcategory}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 font-medium text-gray-900 text-[12px]">
        ₹{product.mrp.toFixed(2)}
      </td>
      <td className="px-4 py-4 font-medium text-gray-900 text-[12px]">
        ₹{product.sellingPrice.toFixed(2)}
      </td>
      <td className="px-4 py-4">
        <span className="px-2 py-1 text-[8px] bg-[#B3DCE8] text-[#161D1F] rounded">
          {product.discount}% OFF
        </span>
      </td>
      <td className="px-4 py-4">
        <span
          className={`px-2 py-1 text-[12px] rounded ${
            stockStatus.color || "text-gray-900"
          }`}
        >
          {stockStatus.label}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-2">
          <span className="px-3 py-1 text-[8px] bg-[#34C759] text-white rounded-lg text-center">
            {product.status}
          </span>
          {product.featured && (
            <span className="px-3 py-1 text-[8px] text-[#F2994A] rounded-lg text-center border border-[#F2994A]">
              Featured
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <button
            onClick={() => onView(product.id)}
            className="p-1 text-[#161D1F] hover:text-gray-700"
          >
            <Eye className="w-4 h-4" strokeWidth={1} />
          </button>
          <button
            onClick={() => onEdit(product.id)}
            className="p-1 text-[#161D1F] hover:text-gray-700"
          >
            <Edit className="w-4 h-4" strokeWidth={1} />
          </button>
          <button className="p-1 text-[#161D1F] hover:text-gray-700 ">
            <Link className="w-4 h-4" strokeWidth={1} />
          </button>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <MoreVertical className="w-4 h-4 text-[#161D1F]" strokeWidth={1} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-8 z-20 w-36 bg-white border border-gray-200 rounded-2xl shadow-2xl">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onUnfeature(product.id);
                }}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Unfeature
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onDeactivate(product.id);
                }}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Deactivate
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onDelete(product.id);
                }}
                className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
