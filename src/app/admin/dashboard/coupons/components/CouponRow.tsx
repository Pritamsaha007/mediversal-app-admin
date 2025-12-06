"use client";
import { Percent, IndianRupee, Edit, Trash2, MoreVertical } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { CouponItem } from "@/app/types/auth.types";
import { useCouponStore } from "@/app/store/couponStore";

interface CouponRowProps {
  coupon: CouponItem;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "active" | "inactive") => void;
}

export default function CouponRow({
  coupon,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
}: CouponRowProps) {
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isExpired = new Date(coupon.expiry_date || "") < new Date();

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(String(coupon.id), e.target.checked)}
          className="h-4 w-4 text-[#0088B1] border-gray-300 rounded focus:ring-[#0088B1]"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div>
            <div className="text-[12px] font-medium text-gray-900">
              {coupon.coupon_code}
            </div>
            <div className="text-[10px] text-gray-500">
              {coupon.description}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-900">
        <div className="flex items-center">
          {coupon.discount_type === "percentage" ? (
            <>
              {/* <Percent className="h-4 w-4 mr-1" /> */}
              {coupon.discount_value}%
            </>
          ) : (
            <>
              <IndianRupee className="h-4 w-4 mr-1" />
              {coupon.discount_value}
            </>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-900">
        <div className="flex items-center">
          <IndianRupee className="h-4 w-4 mr-1" />
          {coupon.minimum_order_value}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-900">
        <div className="flex items-center">{coupon.uses_limit}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-900">
        <div className="flex items-center">
          {new Date(coupon.expiry_date || "").toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={isExpired ? "expired" : coupon.status}
          onChange={(e) =>
            onStatusChange(
              String(coupon.id),
              e.target.value as "active" | "inactive"
            )
          }
          disabled={isExpired}
          className={`text-[10px] px-2 py-1 rounded-md border-1 font-medium ${
            isExpired
              ? "bg-red-100 text-red-800"
              : coupon.status === "active"
              ? "bg-white text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {isExpired ? (
            <option value="expired">Expired</option>
          ) : (
            <>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </>
          )}
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-[12px] font-medium">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
            title="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit(String(coupon.id));
                    setDropdownOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-100 cursor-pointer w-full text-left"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(String(coupon.id));
                    setDropdownOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-[12px] text-red-700 hover:bg-gray-100 cursor-pointer w-full text-left"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
