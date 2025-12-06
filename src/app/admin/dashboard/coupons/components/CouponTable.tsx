"use client";
import { Percent, IndianRupee, Edit, Trash2, MoreVertical } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { CouponItem } from "@/app/types/auth.types";
import Pagination from "@/app/components/common/pagination";
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
  isLoading?: boolean;
}

export default function CouponTable({
  coupons,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading = false,
}: CouponTableProps) {
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedCoupons([...selectedCoupons, id]);
    } else {
      setSelectedCoupons(selectedCoupons.filter((couponId) => couponId !== id));
    }
  };

  const totalItems = coupons.length;
  const hasMore = (currentPage + 1) * itemsPerPage < totalItems;

  const currentCoupons = coupons.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleNextPage = () => {
    if (hasMore && !loading) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0 && !loading) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200/60 overflow-hidden">
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <table className="w-full relative">
          <thead className="bg-gray-50 sticky top-0 z-20">
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
                className="px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider"
              >
                Coupon Code
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider"
              >
                Discount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider"
              >
                Min Order
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider"
              >
                Usage
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider"
              >
                Expiry
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                  </div>
                </td>
              </tr>
            ) : currentCoupons.length > 0 ? (
              currentCoupons.map((coupon) => (
                <CouponRow
                  key={coupon.id}
                  coupon={coupon}
                  isSelected={selectedCoupons.includes(coupon.id.toString())}
                  onSelect={handleSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="text-gray-500 text-center">
                    <Percent className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No coupons found
                    </h3>
                    <p className="text-gray-500">
                      No coupons match your current criteria.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && coupons.length > 0 && (
        <Pagination
          currentPage={currentPage}
          hasMore={hasMore}
          loading={loading}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
}
