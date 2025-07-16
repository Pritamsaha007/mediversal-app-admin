import React, { useState } from "react";
import { X, Search, Trash2 } from "lucide-react";

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
  currentSubstitutes?: RelatedProduct[];
  currentSimilarProducts?: RelatedProduct[];
  availableProducts?: RelatedProduct[];
  onSaveChanges: (data: {
    substitutes: RelatedProduct[];
    similarProducts: RelatedProduct[];
  }) => void;
}

export const ProductRelationshipsModal: React.FC<
  ProductRelationshipsModalProps
> = ({
  isOpen,
  onClose,
  productName,
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
  const [searchQuery, setSearchQuery] = useState("");

  // Filter available products based on search and exclude already added ones
  const getFilteredAvailableProducts = () => {
    const currentList =
      activeTab === "substitutes" ? substitutes : similarProducts;
    const currentIds = currentList.map((p) => p.id);

    return availableProducts.filter(
      (product) =>
        !currentIds.includes(product.id) &&
        (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleAddProduct = (product: RelatedProduct) => {
    if (activeTab === "substitutes") {
      setSubstitutes((prev) => [...prev, product]);
    } else {
      setSimilarProducts((prev) => [...prev, product]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    if (activeTab === "substitutes") {
      setSubstitutes((prev) => prev.filter((p) => p.id !== productId));
    } else {
      setSimilarProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const handleSaveChanges = () => {
    onSaveChanges({
      substitutes,
      similarProducts,
    });
    onClose();
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
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[70vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6  border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161D1F]">
            Manage Product Relationships:
            <span className="text-[#0088B1]"> {productName}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-[#899193]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-200 rounded mx-2">
          <button
            onClick={() => setActiveTab("substitutes")}
            className={`flex-1 px-6 py-2 text-[10px] font-medium rounded ${
              activeTab === "substitutes"
                ? "text-[#F8F8F8] bg-[#0891B2] border-[#0891B2]"
                : "text-[#899193] hover:text-gray-700"
            }`}
          >
            Substitutes
          </button>
          <button
            onClick={() => setActiveTab("similar")}
            className={`flex-1 px-6 py-3 text-[10px] font-medium rounded ${
              activeTab === "similar"
                ? "text-white bg-[#0891B2] border-b-2 border-[#0891B2]"
                : "text-[#899193] hover:text-gray-700"
            }`}
          >
            Similar Products
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Current Items Section */}
          <div className="mb-6">
            <h3 className="text-[10px] font-medium text-[#161D1F] mb-4">
              Current
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
                      <div className="font-medium text-[12px] text-[#161D1F]">
                        {product.name}
                      </div>
                      <div className="text-xs text-[#899193]">
                        {product.code} | {product.manufacturer}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="p-2 text-[#EB5757] hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-[#899193] py-8 text-center">
                No{" "}
                {activeTab === "substitutes"
                  ? "substitutes"
                  : "similar products"}{" "}
                added yet
              </div>
            )}
          </div>

          {/* Add New Items Section */}
          <div>
            <h3 className="text-[10px] font-medium text-[#161D1F] mb-4">
              Add
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
                className="w-full pl-10 pr-4 py-3 text-[#B0B6B8] rounded-lg focus:ring-2 focus:ring-[#0891B2]"
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
                      <div className="font-medium text-[10px] text-[#161D1F]">
                        {product.name}
                      </div>
                      <div className="text-xs text-[#899193]">
                        {product.code} | {product.manufacturer}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddProduct(product)}
                      className="px-4 py-2 text-[10px] text-[#0891B2] hover:bg-[#0891B2] hover:text-white border border-[#0891B2] rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-[#899193] py-8 text-center">
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
            className="px-6 py-2 text-[10px] font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2 text-[10px] font-medium text-white bg-[#0891B2] hover:bg-[#0891B2]/90 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
