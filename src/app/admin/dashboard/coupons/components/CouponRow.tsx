"use client";
import {
  Percent,
  IndianRupee,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isExpired = new Date(coupon.expiry_date || "") < new Date();

  const getStatusColor = (status: string, isExpired: boolean) => {
    if (isExpired) return "bg-red-100 text-red-800";
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const formatStatusDisplay = (status: string) => {
    if (status === "active") return "Active";
    if (status === "inactive") return "Inactive";
    return status;
  };

  const handleStatusChange = async (status: "active" | "inactive") => {
    setUpdatingStatus(true);
    try {
      await onStatusChange(String(coupon.id), status);
      setStatusDropdownOpen(false);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
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
              <Percent className="h-4 w-4 mr-1" />
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
        <div className="relative" ref={statusDropdownRef}>
          {isExpired ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-red-100 text-red-800">
              Expired
            </span>
          ) : (
            <>
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                disabled={updatingStatus}
                className={`px-3 py-1 rounded-full text-[10px] font-medium ${getStatusColor(
                  coupon.status,
                  false,
                )} flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-50`}
              >
                {updatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    {formatStatusDisplay(coupon.status)}
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
              {statusDropdownOpen && (
                <div className="absolute left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="py-1 flex flex-col">
                    {" "}
                    {/* Added flex-col here */}
                    <button
                      onClick={() => handleStatusChange("active")}
                      className={`w-full px-3 py-2 text-left text-[10px] hover:bg-gray-50 transition-colors ${
                        coupon.status === "active"
                          ? "text-green-600 bg-green-50"
                          : "text-[#161D1F]"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => handleStatusChange("inactive")}
                      className={`w-full px-3 py-2 text-left text-[10px] hover:bg-gray-50 transition-colors ${
                        coupon.status === "inactive"
                          ? "text-yellow-600 bg-yellow-50"
                          : "text-[#161D1F]"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-[12px] font-medium">
        <div className="relative" ref={dropdownRef}>
          {!isExpired && (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg ring-1 ring-gray-200 ring-opacity-5 z-10 border border-gray-100 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit(String(coupon.id));
                        setDropdownOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50 cursor-pointer w-full text-left transition-colors duration-150 border-b border-gray-100"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Coupon
                    </button>
                    <button
                      onClick={() => {
                        onDelete(String(coupon.id));
                        setDropdownOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-[12px] text-red-600 hover:bg-red-50 cursor-pointer w-full text-left transition-colors duration-150"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Coupon
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
