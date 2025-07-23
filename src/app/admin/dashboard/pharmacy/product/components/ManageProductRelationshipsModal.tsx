import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { X, Search, Trash2, CloudFog } from "lucide-react";
import {
  getProductsById,
  removeProductRelationship,
  updateProductRelationships,
} from "@/app/admin/dashboard/pharmacy/product/services/productRelationship";

interface RelatedProduct {
  id: string;
  name: string;
  code: string;
  manufacturer: string;
}

interface ProductRelationshipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  currentSubstitutes: RelatedProduct[];
  currentSimilarProducts: RelatedProduct[];
  availableProducts?: RelatedProduct[];
  onSaveChanges: (data: {
    substitutes: string[];
    similarProducts: string[];
  }) => void;
}

interface ProductData {
  productId: number;
  ProductName: string;
  Type: string;
  ManufacturerName: string;
  similarProducts: RelatedProduct[];
  substitutes: RelatedProduct[];
}

export const ProductRelationshipsModal: React.FC<
  ProductRelationshipsModalProps
> = ({
  isOpen,
  onClose,
  productName,
  productId,
  currentSubstitutes = [],
  currentSimilarProducts = [],
  availableProducts = [],
  onSaveChanges,
}) => {
  const [activeTab, setActiveTab] = useState<"substitutes" | "similar">(
    "substitutes"
  );
  const [substitutes, setSubstitutes] =
    useState<RelatedProduct[]>(currentSubstitutes);
  const [similarProducts, setSimilarProducts] = useState<RelatedProduct[]>(
    currentSimilarProducts
  );
  const [newlyAddedSubstitutes, setNewlyAddedSubstitutes] = useState<string[]>(
    []
  );
  const [newlyAddedSimilarProducts, setNewlyAddedSimilarProducts] = useState<
    string[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);

  const convertToRelatedProduct = (product: any): RelatedProduct => {
    return {
      id: product.productId?.toString() || "",
      name: product.ProductName || "",
      code: product.Type || product.SKU || "",
      manufacturer: product.ManufacturerName || "",
    };
  };

  const fetchProductData = async () => {
    if (!productId) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching product data for ID:", productId);
      const response = await getProductsById(Number(productId));
      console.log("Product data received:", response);

      setProductData(response);

      if (response.substitutes && Array.isArray(response.substitutes)) {
        const convertedSubstitutes = response.substitutes.map(
          convertToRelatedProduct
        );
        setSubstitutes(convertedSubstitutes);
        console.log("Converted substitutes:", convertedSubstitutes);
      }

      if (response.similarProducts && Array.isArray(response.similarProducts)) {
        const convertedSimilarProducts = response.similarProducts.map(
          convertToRelatedProduct
        );
        setSimilarProducts(convertedSimilarProducts);
        console.log("Converted similar products:", convertedSimilarProducts);
      }
    } catch (err) {
      console.error("Error fetching product data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch product data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProductData();
    }
  }, [isOpen, productId]);

  const getFilteredAvailableProducts = () => {
    const currentList =
      activeTab === "substitutes" ? substitutes : similarProducts;
    const currentIds = currentList.map((p) => p.id);

    return availableProducts.filter(
      (product) =>
        !currentIds.includes(product.id) &&
        product.id !== productId &&
        (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleAddProduct = (product: RelatedProduct) => {
    if (activeTab === "substitutes") {
      setSubstitutes((prev) => [...prev, product]);
      toast.success(`Substitute "${product.name}" added`);
    } else {
      setSimilarProducts((prev) => [...prev, product]);
      toast.success(`Similar product "${product.name}" added`);
    }
  };
  const handleRemoveProduct = async (itemIdToRemove: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const isNewlyAdded =
        activeTab === "substitutes"
          ? newlyAddedSubstitutes.includes(itemIdToRemove)
          : newlyAddedSimilarProducts.includes(itemIdToRemove);

      if (!isNewlyAdded) {
        // Only call API for existing relationships
        const relationshipType =
          activeTab === "substitutes" ? "substitutes" : "similar-products";

        await removeProductRelationship(
          Number(productId),
          relationshipType,
          Number(itemIdToRemove)
        );
      }

      // Update local state
      if (activeTab === "substitutes") {
        setSubstitutes((prev) => prev.filter((p) => p.id !== itemIdToRemove));
        setNewlyAddedSubstitutes((prev) =>
          prev.filter((id) => id !== itemIdToRemove)
        );
        toast.success("Substitute removed");
      } else {
        setSimilarProducts((prev) =>
          prev.filter((p) => p.id !== itemIdToRemove)
        );
        setNewlyAddedSimilarProducts((prev) =>
          prev.filter((id) => id !== itemIdToRemove)
        );
        toast.success("Similar product removed");
      }
    } catch (err) {
      console.error("Error removing relationship:", err);
      setError(
        err instanceof Error ? err.message : "Failed to remove relationship"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const relationshipsData = {
        substitutes: substitutes.map((p) => Number(p.id)),
        similarProducts: similarProducts.map((p) => Number(p.id)),
      };

      await updateProductRelationships(Number(productId), relationshipsData);

      // Clear the newly added tracking after successful save
      setNewlyAddedSubstitutes([]);
      setNewlyAddedSimilarProducts([]);

      onSaveChanges({
        substitutes: substitutes.map((p) => p.id),
        similarProducts: similarProducts.map((p) => p.id),
      });

      onClose();
    } catch (err) {
      console.error("Error saving relationships:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save relationships"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentList =
    activeTab === "substitutes" ? substitutes : similarProducts;
  const filteredAvailableProducts = getFilteredAvailableProducts();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161D1F]">
            Manage Product Relationships:
            <span className="text-[#0088B1]"> {productName}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-[#899193]" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-200 rounded mx-6 mt-4">
          <button
            onClick={() => setActiveTab("substitutes")}
            disabled={isLoading}
            className={`flex-1 px-6 py-2 text-[10px] font-medium rounded ${
              activeTab === "substitutes"
                ? "text-[#F8F8F8] bg-[#0891B2] border-[#0891B2]"
                : "text-[#899193] hover:text-gray-700"
            }`}
          >
            Substitutes ({substitutes.length})
          </button>
          <button
            onClick={() => setActiveTab("similar")}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 text-[10px] font-medium rounded ${
              activeTab === "similar"
                ? "text-white bg-[#0891B2] border-b-2 border-[#0891B2]"
                : "text-[#899193] hover:text-gray-700"
            }`}
          >
            Similar Products ({similarProducts.length})
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Current Items Section */}
          <div className="mb-6">
            <h3 className="text-[12px] font-medium text-[#161D1F] mb-4">
              Current{" "}
              {activeTab === "substitutes" ? "Substitutes" : "Similar Products"}
            </h3>

            {currentList.length > 0 ? (
              <div className="space-y-3">
                {currentList.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-[14px] text-[#161D1F]">
                        {product.name}
                      </div>
                      <div className="text-sm text-[#899193]">
                        {product.code} | {product.manufacturer}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      disabled={isLoading}
                      className="p-2 text-[#EB5757] hover:bg-red-50 rounded-full disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[12px] text-[#899193] py-8 text-center">
                No
                {activeTab === "substitutes"
                  ? "substitutes"
                  : "similar products"}{" "}
                added yet
              </div>
            )}
          </div>

          {/* Add New Items Section */}
          <div>
            <h3 className="text-[12px] font-medium text-[#161D1F] mb-4">
              Add{" "}
              {activeTab === "substitutes" ? "Substitutes" : "Similar Products"}
            </h3>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 text-[#333] placeholder-[#B0B6B8] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891B2] focus:border-transparent disabled:opacity-50"
              />
            </div>

            {/* Available Products */}
            <div className="space-y-3">
              {filteredAvailableProducts.length > 0 ? (
                filteredAvailableProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-[14px] text-[#161D1F]">
                        {product.name}
                      </div>
                      <div className="text-sm text-[#899193]">
                        {product.code} | {product.manufacturer}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddProduct(product)}
                      disabled={isLoading}
                      className="px-4 py-2 text-[12px] text-[#0891B2] hover:bg-[#0891B2] hover:text-white border border-[#0891B2] rounded-lg transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-[12px] text-[#899193] py-8 text-center">
                  {searchQuery
                    ? "No products found matching your search"
                    : "No available products"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 text-[12px] font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isLoading}
            className="px-6 py-2 text-[12px] font-medium text-white bg-[#0891B2] hover:bg-[#0891B2]/90 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
