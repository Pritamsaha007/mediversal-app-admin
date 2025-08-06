import React, { useEffect, useRef, useState } from "react";
import { Product } from "@/app/admin/dashboard/pharmacy/product/types/product";
import { AddProductModal } from "./AddProductModal";
import { ProductDetailModal } from "./ProductDetailModal";
import { ProductRelationshipsModal } from "./ManageProductRelationshipsModal";
import { Eye, Edit, Link, MoreVertical, Pill } from "lucide-react";
import { ProductFormData } from "../types/productForm.type";

interface RelatedProduct {
  id: string;
  name: string;
  code: string;
  manufacturer: string;
}

export const ProductCard: React.FC<{
  product: Product;
  onView: (id: string) => void;
  onEdit: (id: string, productData: ProductFormData) => Promise<void>;
  onUnfeature: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  availableProducts?: RelatedProduct[];
  onUpdateRelationships?: (
    productId: string,
    data: {
      substitutes: RelatedProduct[];
      similarProducts: RelatedProduct[];
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
  const [isModalOpen2, setModalOpen] = useState(false);
  const [isRelationshipsModalOpen, setIsRelationshipsModalOpen] =
    useState(false);

  const [productToEdit, setProductToEdit] = useState<ProductFormData | null>(
    null
  );
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);

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

  const stockStatus = getStockStatus(product.stock);

  const handleEdit = (product: Product) => {
    const productFormData: ProductFormData = {
      id: product.id,
      productName: product.name,
      SKU: product.sku,
      Category: product.category,
      Subcategory: product.subcategory,
      brand: product.brand || "",
      manufacturer: product.manufacturer || "",
      mrp: product.mrp,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stock,
      description: product.description || "",
      Composition: product.composition || "",
      dosageForm: product.dosageForm || "",
      ProductStrength: product.ProductStrength || "",
      PackageSize: product.PackageSize || "",
      Type: product.Type || "",
      schedule: product.schedule || "",
      taxRate: product.taxRate || 0,
      HSN_Code: product.hsnCode || "",
      storageConditions: product.storageConditions || "",
      shelfLife: product.shelfLife || 0,
      prescriptionRequired: product.prescriptionRequired || false,
      featuredProduct: product.featured || false,
      activeProduct: product.status === "Active",
      safetyDescription: product.saftyDescription || "",
      storageDescription: product.storageDescription || "",
      productImage:
        typeof product.productImage === "object" &&
        product.productImage instanceof File
          ? product.productImage
          : null,
    };

    setProductToEdit(productFormData);
    setModalOpen(true);
  };

  const handleManageRelationships = () => {
    setIsRelationshipsModalOpen(true);
  };

  function handleAdd(product: ProductFormData): void {
    throw new Error("Function not implemented.");
  }

  const handleUpdate = async (productData: ProductFormData): Promise<void> => {
    try {
      if (product.id) {
        await onEdit(product.id, productData);
        setModalOpen(false);
        setProductToEdit(null);
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };
  const handleRelationshipsUpdate = (data: {
    substitutes: string[];
    similarProducts: string[];
  }) => {
    if (onUpdateRelationships) {
      onUpdateRelationships(product.id, {
        substitutes: data.substitutes.map((name) => ({
          id: name,
          name,
          code: "",
          manufacturer: "",
        })),
        similarProducts: data.similarProducts.map((name) => ({
          id: name,
          name,
          code: "",
          manufacturer: "",
        })),
      });
    }
  };

  const currentSubstitutes: RelatedProduct[] =
    product.Substitutes?.map((name) => ({
      id: name,
      name,
      code: "",
      manufacturer: product.manufacturer || "Unknown",
    })) || [];

  const currentSimilarProducts: RelatedProduct[] =
    product.SimilarProducts?.map((name) => ({
      id: name,
      name,
      code: "",
      manufacturer: product.manufacturer || "Unknown",
    })) || [];

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
            {product.code} | {product.prescriptionRequired ? "Rx" : "No Rx "}
          </div>
          <div className="mt-2">
            <div className="flex gap-2 mb-1">
              <button
                onClick={() => setShowSubstitutes(!showSubstitutes)}
                className="px-2 py-1 text-[8px] text-[#0088B1] rounded border border-[#0088B1] hover:bg-[#0088B1] hover:text-white transition-colors"
              >
                {product.substitutesCount || 0} substitute(s){" "}
                {showSubstitutes ? "▲" : "▼"}
              </button>
              <button
                onClick={() => setShowSimilar(!showSimilar)}
                className="px-2 py-1 text-[8px] text-[#9B51E0] rounded border border-[#9B51E0] hover:bg-[#9B51E0] hover:text-white transition-colors"
              >
                {product.similarCount || 0} similar {showSimilar ? "▲" : "▼"}
              </button>
            </div>

            {showSubstitutes &&
              product.Substitutes &&
              product.Substitutes.length > 0 && (
                <div className="bg-blue-50 p-2 rounded text-[8px] text-gray-700 mb-1">
                  <strong>Substitutes:</strong>{" "}
                  {product.Substitutes.slice(0, 3).join(", ")}
                  {product.Substitutes.length > 3 &&
                    ` +${product.Substitutes.length - 3} more`}
                </div>
              )}

            {showSimilar &&
              product.SimilarProducts &&
              product.SimilarProducts.length > 0 && (
                <div className="bg-purple-50 p-2 rounded text-[8px] text-gray-700">
                  <strong>Similar:</strong>{" "}
                  {product.SimilarProducts.slice(0, 3).join(", ")}
                  {product.SimilarProducts.length > 3 &&
                    ` +${product.SimilarProducts.length - 3} more`}
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
          <span
            className={`px-3 py-1 text-[8px] ${
              product.status === "Active" ? "bg-[#34C759]" : "bg-[#FF3B30]"
            } text-white rounded-lg text-center`}
          >
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
            onClick={() => setIsModalOpen(true)}
            className="p-1 text-[#161D1F] hover:text-gray-700"
          >
            <Eye className="w-4 h-4" strokeWidth={1} />
          </button>

          <button
            onClick={() => handleEdit(product)}
            className="p-1 text-[#161D1F] hover:text-gray-700"
          >
            <Edit className="w-4 h-4" strokeWidth={1} />
          </button>

          <button
            onClick={handleManageRelationships}
            className="p-1 text-[#161D1F] hover:text-gray-700"
            title="Manage Product Relationships"
          >
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

          <ProductDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            product={product}
          />

          <AddProductModal
            isOpen={isModalOpen2}
            onClose={() => {
              setModalOpen(false);
              setProductToEdit(null);
            }}
            onAddProduct={handleAdd}
            onUpdateProduct={handleUpdate}
            productToEdit={productToEdit}
            isEditMode={!!productToEdit}
          />

          <ProductRelationshipsModal
            isOpen={isRelationshipsModalOpen}
            onClose={() => setIsRelationshipsModalOpen(false)}
            productId={product.id}
            productName={product.name}
            currentSubstitutes={currentSubstitutes}
            currentSimilarProducts={currentSimilarProducts}
            availableProducts={availableProducts}
            onSaveChanges={handleRelationshipsUpdate}
          />
        </div>
      </td>
    </tr>
  );
};
