import React, { useEffect, useRef, useState } from "react";
import { Edit, History, LucideTrash2 } from "lucide-react";
import { inventoryItem } from "../../../../../types/product";

interface InventoryCardProps {
  inventoryItem: inventoryItem;
  onHistory: (id: string) => void;
  onEdit: (id: string) => void;
  onUnfeature: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  inventoryItem,
  onHistory,
  onEdit,
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
        color: "bg-orange-[#FFF2E5] text-[#FF8000] text-[8px]",
      };
    return { label: stock.toString(), color: "" };
  };

  const stockStatus = getStockStatus(inventoryItem.stock);

  return (
    <tr
      className={`border-y hover:bg-gray-50 border-[#D3D7D8] ${
        isSelected ? "bg-blue-50" : ""
      }`}
    >
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(inventoryItem.id, e.target.checked)}
          className="w-4 h-4 border-gray-300 rounded"
        />
      </td>
      <td className="px-4 py-4">
        <div>
          <div className="font-medium text-[12px] text-gray-900">
            {inventoryItem.name}
          </div>
          <div className="text-[10px] text-gray-500">
            {inventoryItem.code} | {inventoryItem.subcategory}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div>
            <div className="font-bold text-[10px]  text-gray-900">
              {inventoryItem.batch_no}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 font-medium text-gray-900 text-[12px]">
        {inventoryItem.category}
      </td>
      {/* <td className="px-4 py-4 font-medium text-gray-900 text-[12px]">
        ₹{inventoryItem.sellingPrice.toFixed(2)}
      </td>
      <td className="px-4 py-4">
        <span className="px-2 py-1 text-[8px] bg-[#B3DCE8] text-[#161D1F] rounded">
          {inventoryItem.discount}% OFF
        </span>
      </td> */}
      <td className="px-4 py-4">
        <span className={`px-2 py-1 text-[12px] rounded text-black`}>
          {inventoryItem.expiry_date}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-2">
          <span
            className={` px-3 py-1 text-[12px]  text-black rounded-lg text-center ${
              stockStatus.color || "text-gray-900"
            }`}
          >
            {inventoryItem.stock}
          </span>

          {/* {inventoryItem.featured && (
            <span className="px-3 py-1 text-[8px] text-[#F2994A] rounded-lg text-center border border-[#F2994A]">
              Featured
            </span>
          )} */}
        </div>
      </td>
      <td className="px-4 py-4">
        {inventoryItem.status == "Active" ? (
          <span className="px-3 py-1 text-[8px] bg-[#34C759] text-white rounded-lg text-center">
            {inventoryItem.status}
          </span>
        ) : (
          <span className="px-3 py-1 text-[8px] bg-[#f09f4f] text-white rounded-lg text-center">
            {inventoryItem.status}
          </span>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <button
            onClick={() => onHistory(inventoryItem.id)}
            className="p-1 text-[#161D1F] hover:text-gray-700"
          >
            <History className="w-4 h-4" strokeWidth={1} />
          </button>
          <button
            onClick={() => onEdit(inventoryItem.id)}
            className="p-1 text-[#161D1F] hover:text-gray-700"
          >
            <Edit className="w-4 h-4" strokeWidth={1} />
          </button>
          {/* <button className="p-1 text-[#161D1F] hover:text-gray-700 ">
            <Link className="w-4 h-4" strokeWidth={1} />
          </button> */}
          <button
            onClick={() => {
              setDropdownOpen(false);
              onDelete(inventoryItem.id);
            }}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <LucideTrash2 className="w-4 h-4 text-red-500" strokeWidth={2} />
          </button>

          {/* {dropdownOpen && (
            <div className="absolute right-0 top-8 z-20 w-36 bg-white border border-gray-200 rounded-2xl shadow-2xl">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onUnfeature(inventoryItem.id);
                }}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Unfeature
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onDeactivate(inventoryItem.id);
                }}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Deactivate
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onDelete(inventoryItem.id);
                }}
                className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
              >
                Delete
              </button>
            </div>
          )} */}
        </div>
      </td>
    </tr>
  );
};
