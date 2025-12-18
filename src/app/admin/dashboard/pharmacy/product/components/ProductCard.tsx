import React, { useEffect, useRef, useState } from "react";
import { Product } from "@/app/admin/dashboard/pharmacy/product/types/product";
import { AddProductModal } from "./AddProductModal";
import { ProductDetailModal } from "./ProductDetailModal";
import { ProductRelationshipsModal } from "./ManageProductRelationshipsModal";
import {
  Eye,
  Edit,
  Link,
  MoreVertical,
  Pill,
  Trash,
  Delete,
  Trash2,
} from "lucide-react";
import { ProductFormData } from "../types/productForm.type";
import StatusBadge from "@/app/components/common/StatusBadge";
import { useRouter } from "next/navigation";

export const ProductCard: React.FC<{
  product: Product;
  onView: (id: string) => void;
  onEdit: (id: string, productData: ProductFormData) => Promise<void>;
  onUnfeature: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  availableProducts?: Product[];
  onUpdateRelationships?: (
    productId: string,
    data: {
      substitutes: Product[];
      similarProducts: Product[];
    }
  ) => void;
}> = ({
  product,
  onView,
  onEdit,
  onUnfeature,
  onDeactivate,
  onDelete,
  isSelected,
  onSelect,
  availableProducts = [],
  onUpdateRelationships,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isRelationshipsModalOpen, setIsRelationshipsModalOpen] =
    useState(false);

  const [productToEdit, setProductToEdit] = useState<ProductFormData | null>(
    null
  );
  const router = useRouter();
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const handleRefresh = () => {
    // Refresh the page using Next.js router
    router.refresh();
  };

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
        label: `Low (${stock})`,
        color: "bg-orange-[#FFF2E5] text-[#FF8000]  text-[8px]",
      };
    return { label: stock, color: "" };
  };

  const stockStatus = getStockStatus(product.StockAvailableInInventory);

  const handleEdit = (product: Product) => {
    const productFormData: ProductFormData = {
      id: product.productId,

      ProductName: product.ProductName,
      SKU: product.SKU,
      Category: product.Category,
      Subcategory: product.Subcategory,
      Type: product.Type || "",
      ManufacturerName: product.ManufacturerName,
      CostPrice:
        typeof product.CostPrice === "string"
          ? parseFloat(product.CostPrice)
          : product.CostPrice,
      SellingPrice:
        typeof product.SellingPrice === "string"
          ? parseFloat(product.SellingPrice)
          : product.SellingPrice,
      StockAvailableInInventory: product.StockAvailableInInventory,
      subCategoryType: product.subCategoryType || "",

      ProductInformation: product.ProductInformation,
      SafetyAdvices: product.SafetyAdvices,
      StorageInstructions: product.StorageInstructions,
      Composition: product.Composition,
      dosageForm: product.dosageForm || "",
      ProductStrength: product.ProductStrength || "",
      PackageSize: product.PackageSize || "",
      productImage: product.image_url?.[0] || null,
      image_url: product.image_url || [],
      schedule: product.schedule || "",
      tax:
        typeof product.tax === "string" ? parseFloat(product.tax) : product.tax,
      HSN_Code: product.HSN_Code || "",
      storageConditions: product.storageConditions || "",

      PrescriptionRequired: product.PrescriptionRequired,
      featuredProduct: product.featuredProduct,
      active: product.active,
      ColdChain: product.ColdChain,
      GST: product.GST,

      productLength:
        typeof product.productLength === "string"
          ? parseFloat(product.productLength)
          : product.productLength,
      productBreadth:
        typeof product.productBreadth === "string"
          ? parseFloat(product.productBreadth)
          : product.productBreadth,
      productHeight:
        typeof product.productHeight === "string"
          ? parseFloat(product.productHeight)
          : product.productHeight,
      productWeight:
        typeof product.productWeight === "string"
          ? parseFloat(product.productWeight)
          : product.productWeight,

      DiscountedPrice:
        typeof product.DiscountedPrice === "string"
          ? parseFloat(product.DiscountedPrice)
          : product.DiscountedPrice,
      DiscountedPercentage:
        typeof product.DiscountedPercentage === "string"
          ? parseFloat(product.DiscountedPercentage)
          : product.DiscountedPercentage,

      Substitutes:
        product.substitutes?.map((sub) =>
          typeof sub === "string" ? sub : sub.productId
        ) || [],
      SimilarProducts:
        product.similarProducts?.map((sim) =>
          typeof sim === "string" ? sim : sim.productId
        ) || [],
      Coupons: product.Coupons,
      admin_id: "",
    };

    setProductToEdit(productFormData);
    setEditModalOpen(true);
  };

  const handleManageRelationships = () => {
    setIsRelationshipsModalOpen(true);
  };

  const handleUpdate = async (productData: ProductFormData): Promise<void> => {
    try {
      if (product.productId) {
        await onEdit(product.productId, productData);
        setEditModalOpen(false);
        setProductToEdit(null);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const handleRelationshipsUpdate = (data: {
    substitutes: string[];
    similarProducts: string[];
  }) => {
    if (onUpdateRelationships) {
      const substitutesProducts = availableProducts.filter((p) =>
        data.substitutes.includes(p.productId)
      );
      const similarProducts = availableProducts.filter((p) =>
        data.similarProducts.includes(p.productId)
      );

      onUpdateRelationships(product.productId, {
        substitutes: substitutesProducts,
        similarProducts: similarProducts,
      });
    }
  };

  const currentSubstitutes: Product[] = product.substitutes || [];
  const currentSimilarProducts: Product[] = product.similarProducts || [];

  return (
    <tr className="border-y-1 hover:bg-gray-50 border-[#D3D7D8]">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(product.productId, e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
      </td>
      <td className="px-4 py-4">
        <div>
          <div className="font-medium text-[12px] text-gray-900">
            {product.ProductName}
          </div>
          <div className="text-[10px] text-gray-500">
            {product.SKU || "N/A"} |{" "}
            {product.PrescriptionRequired === "Yes" ? "Rx" : "No Rx"}
          </div>
          <div className="mt-2">
            <div className="flex gap-2 mb-1">
              <button
                onClick={() => setShowSubstitutes(!showSubstitutes)}
                className="px-2 py-1 text-[8px] text-[#0088B1] rounded border border-[#0088B1] hover:bg-[#0088B1] hover:text-white transition-colors"
              >
                {product.substitutes?.length || 0} substitute(s){" "}
                {showSubstitutes ? "▲" : "▼"}
              </button>
              <button
                onClick={() => setShowSimilar(!showSimilar)}
                className="px-2 py-1 text-[8px] text-[#9B51E0] rounded border border-[#9B51E0] hover:bg-[#9B51E0] hover:text-white transition-colors"
              >
                {product.similarProducts?.length || 0} similar{" "}
                {showSimilar ? "▲" : "▼"}
              </button>
            </div>

            {showSubstitutes &&
              product.substitutes &&
              product.substitutes.length > 0 && (
                <div className="bg-blue-50 p-2 rounded text-[8px] text-gray-700 mb-1">
                  <strong>Substitutes:</strong>{" "}
                  {product.substitutes
                    .slice(0, 3)
                    .map((sub) =>
                      typeof sub === "string" ? sub : sub.ProductName
                    )
                    .join(", ")}
                  {product.substitutes.length > 3 &&
                    ` +${product.substitutes.length - 3} more`}
                </div>
              )}

            {showSimilar &&
              product.similarProducts &&
              product.similarProducts.length > 0 && (
                <div className="bg-purple-50 p-2 rounded text-[8px] text-gray-700">
                  <strong>Similar:</strong>{" "}
                  {product.similarProducts
                    .slice(0, 3)
                    .map((sim) =>
                      typeof sim === "string" ? sim : sim.ProductName
                    )
                    .join(", ")}
                  {product.similarProducts.length > 3 &&
                    ` +${product.similarProducts.length - 3} more`}
                </div>
              )}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-gray-500" />
          <div>
            <div className="font-medium text-[10px] text-gray-900">
              {product.Category}
            </div>
            <div className="text-sm text-gray-500 text-[8px]">
              {product.Subcategory}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 font-medium text-gray-900 text-[12px]">
        ₹
        {typeof product.CostPrice === "string"
          ? product.CostPrice
          : product.CostPrice?.toFixed(2)}
      </td>
      <td className="px-4 py-4 font-medium text-gray-900 text-[12px]">
        ₹
        {typeof product.SellingPrice === "string"
          ? product.SellingPrice
          : product.SellingPrice?.toFixed(2)}
      </td>
      <td className="px-4 py-4">
        <span className="px-2 py-1 text-[8px] bg-[#B3DCE8] text-gray-500 rounded">
          {typeof product.DiscountedPercentage === "string"
            ? product.DiscountedPercentage
            : product.DiscountedPercentage?.toFixed(0)}
          % OFF
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
      <td className="px-4 py-4 items-center justify-center flex flex-col gap-2">
        {product.active ? (
          <StatusBadge status="Active" />
        ) : (
          <StatusBadge status="Inactive" />
        )}
        {product.featuredProduct ? (
          <StatusBadge status="Featured" />
        ) : (
          <StatusBadge status="Not Featured" />
        )}
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 text-gray-500  hover:text-[#0088B1]"
            title="View Product"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleEdit(product)}
            className="p-1 text-gray-500 hover:text-[#0088B1] cursor-pointer"
            title="Edit Product"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={handleManageRelationships}
            className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
            title="Manage Product Relationships"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.productId)}
            className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
            title="Manage Product Relationships"
          >
            <Trash2 className="w-4 h-4" color="red" />
          </button>

          {/* <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
            title="More options"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" strokeWidth={1} />
          </button> */}

          {/* {dropdownOpen && (
            <div className="absolute right-0 top-8 z-20 w-36 bg-white border border-gray-200 rounded-2xl shadow-2xl">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onUnfeature(product.productId);
                }}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Unfeature
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onDeactivate(product.productId);
                }}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Deactivate
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onDelete(product.productId);
                }}
                className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
              >
                Delete
              </button>
            </div>
          )} */}

          <ProductDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            product={product}
          />

          <AddProductModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setProductToEdit(null);
            }}
            onAddProduct={() => {}}
            onUpdateProduct={handleUpdate}
            productToEdit={productToEdit}
            isEditMode={!!productToEdit}
          />

          <ProductRelationshipsModal
            isOpen={isRelationshipsModalOpen}
            onClose={() => setIsRelationshipsModalOpen(false)}
            productId={product.productId}
            productName={product.ProductName}
            currentSubstitutes={currentSubstitutes}
            currentSimilarProducts={currentSimilarProducts}
            availableProducts={availableProducts}
            onSaveChanges={handleRelationshipsUpdate}
            onRefresh={handleRefresh}
          />
        </div>
      </td>
    </tr>
  );
};
