"use client";
import { Percent, IndianRupee, Edit, Trash2, MoreVertical } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { CouponItem } from "@/app/types/auth.types";
import { Pagination } from "../../../pharmacy/order/components/Pagination"; // Adjust the import path as needed
import CouponRow from "./CouponRow";

interface CouponTableProps {
  coupons: CouponItem[];
  selectedItems: string[];
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "active" | "inactive") => void;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}
export default function CouponTable({
  coupons,
  onEdit,
  onDelete,
  onStatusChange,
}: CouponTableProps) {
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Handle coupon selection
  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedCoupons([...selectedCoupons, id]);
    } else {
      setSelectedCoupons(selectedCoupons.filter((couponId) => couponId !== id));
    }
  };

  // Calculate pagination values
  const totalItems = coupons.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentCoupons = coupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    selectedCoupons.length > 0 &&
                    selectedCoupons.length === currentCoupons.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCoupons(
                        currentCoupons.map((coupon) => coupon.id.toString())
                      );
                    } else {
                      setSelectedCoupons([]);
                    }
                  }}
                  className="h-4 w-4 text-[#0088B1] border-gray-300 rounded focus:ring-[#0088B1]"
                />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Coupon Code
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Discount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Min Order
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Usage
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Expiry
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCoupons.map((coupon) => (
              <CouponRow
                key={coupon.id}
                coupon={coupon}
                isSelected={selectedCoupons.includes(coupon.id.toString())}
                onSelect={handleSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1); // Reset to first page when items per page changes
        }}
      />
    </div>
  );
}
