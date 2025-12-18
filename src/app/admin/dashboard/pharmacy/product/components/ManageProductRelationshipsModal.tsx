const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { X, Search, Trash2 } from "lucide-react";
import { Product } from "../types/product";
import {
  getProductsWithPaginationAPI,
  clearProductCache,
} from "../services/ProductService";
import { useAdminStore } from "@/app/store/adminStore";
import {
  manageProductRelations,
  fetchRelationType,
} from "../services/productRelationship"; // Adjust the import path

interface ProductRelationshipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  currentSubstitutes: Product[];
  currentSimilarProducts: Product[];
  availableProducts?: Product[];
  onRefresh?: () => void;
  onSaveChanges: (data: {
    substitutes: string[];
    similarProducts: string[];
  }) => void;
}

interface PendingChanges {
  toAdd: {
    substitutes: string[];
    similar: string[];
  };
  toRemove: {
    substitutes: string[];
    similar: string[];
  };
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
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<"substitutes" | "similar">(
    "substitutes"
  );

  const [substitutes, setSubstitutes] = useState<Product[]>(currentSubstitutes);
  const [similarProducts, setSimilarProducts] = useState<Product[]>(
    currentSimilarProducts
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableProductsList, setAvailableProductsList] = useState<Product[]>(
    []
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    hasMore: true,
    loading: false,
  });
  const [relationTypes, setRelationTypes] = useState<{
    similarId: string;
    substituteId: string;
  } | null>(null);

  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({
    toAdd: {
      substitutes: [],
      similar: [],
    },
    toRemove: {
      substitutes: [],
      similar: [],
    },
  });

  const { token, admin } = useAdminStore();

  const fetchRelationTypes = async () => {
    try {
      if (!token) {
        console.error("No token available");
        return;
      }

      const response = await fetchRelationType(token);

      if (response.roles && Array.isArray(response.roles)) {
        const similarId = response.roles[0]?.id;
        const substituteId = response.roles[1]?.id;

        if (similarId && substituteId) {
          setRelationTypes({ similarId, substituteId });
        } else {
          console.error("Could not find relation type IDs in response");
        }
      }
    } catch (error) {
      console.error("Error fetching relation types:", error);
      toast.error("Failed to load relation types");
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchRelationTypes();
    }
  }, [isOpen, token]);

  const searchAvailableProducts = async (
    query: string = "",
    loadMore: boolean = false
  ) => {
    try {
      setSearchLoading(true);
      setError(null);

      const currentPage = loadMore ? pagination.currentPage + 1 : 0;
      const start = currentPage * 20;

      const filters = {
        searchTerm: query.trim() || null,
        product_id: null,
      };

      const response = await getProductsWithPaginationAPI(start, 20, filters);

      if (response.success) {
        const products = response.products || [];

        if (loadMore) {
          setAvailableProductsList((prev) => [...prev, ...products]);
        } else {
          setAvailableProductsList(products);
        }

        setPagination({
          currentPage,
          hasMore: products.length === 20,
          loading: false,
        });
      } else {
        setError("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setError("Failed to search products");
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchProductData = async () => {
    if (!productId) return;

    try {
      setIsLoading(true);
      setError(null);

      const filters = {
        product_id: productId,
        start: 0,
        max: 1,
      };

      const response = await getProductsWithPaginationAPI(0, 1, filters);

      if (response.success && response.products?.[0]) {
        const productData = response.products[0];

        if (productData.substitutes && Array.isArray(productData.substitutes)) {
          setSubstitutes(productData.substitutes);
        }

        if (
          productData.similarProducts &&
          Array.isArray(productData.similarProducts)
        ) {
          setSimilarProducts(productData.similarProducts);
        }
      } else {
        setError("Product not found");
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
      searchAvailableProducts("");

      setPendingChanges({
        toAdd: { substitutes: [], similar: [] },
        toRemove: { substitutes: [], similar: [] },
      });
    }
  }, [isOpen, productId]);

  const getFilteredAvailableProducts = () => {
    const currentList =
      activeTab === "substitutes" ? substitutes : similarProducts;
    const currentIds = currentList.map((p) => p.productId);

    return availableProductsList.filter(
      (product) =>
        !currentIds.includes(product.productId) &&
        product.productId !== productId &&
        !pendingChanges.toAdd[
          activeTab === "substitutes" ? "substitutes" : "similar"
        ].includes(product.productId)
    );
  };

  const handleAddProduct = (product: Product) => {
    if (!relationTypes) {
      toast.error("Relation types not loaded yet");
      return;
    }

    const productIdToAdd = product.productId;
    const tabType = activeTab === "substitutes" ? "substitutes" : "similar";

    const isMarkedForRemoval =
      pendingChanges.toRemove[tabType].includes(productIdToAdd);

    if (isMarkedForRemoval) {
      setPendingChanges((prev) => ({
        ...prev,
        toRemove: {
          ...prev.toRemove,
          [tabType]: prev.toRemove[tabType].filter(
            (id) => id !== productIdToAdd
          ),
        },
      }));
    } else {
      setPendingChanges((prev) => ({
        ...prev,
        toAdd: {
          ...prev.toAdd,
          [tabType]: [...prev.toAdd[tabType], productIdToAdd],
        },
      }));
    }

    if (activeTab === "substitutes") {
      setSubstitutes((prev) => [...prev, product]);
    } else {
      setSimilarProducts((prev) => [...prev, product]);
    }

    toast.success(
      `Added "${product.ProductName}" as ${
        activeTab === "substitutes" ? "substitute" : "similar product"
      }`
    );
  };

  const handleRemoveProduct = (productIdToRemove: string) => {
    if (!relationTypes) {
      toast.error("Relation types not loaded yet");
      return;
    }

    const tabType = activeTab === "substitutes" ? "substitutes" : "similar";

    const isMarkedForAddition =
      pendingChanges.toAdd[tabType].includes(productIdToRemove);

    if (isMarkedForAddition) {
      setPendingChanges((prev) => ({
        ...prev,
        toAdd: {
          ...prev.toAdd,
          [tabType]: prev.toAdd[tabType].filter(
            (id) => id !== productIdToRemove
          ),
        },
      }));
    } else {
      setPendingChanges((prev) => ({
        ...prev,
        toRemove: {
          ...prev.toRemove,
          [tabType]: [...prev.toRemove[tabType], productIdToRemove],
        },
      }));
    }

    if (activeTab === "substitutes") {
      setSubstitutes((prev) =>
        prev.filter((p) => p.productId !== productIdToRemove)
      );
    } else {
      setSimilarProducts((prev) =>
        prev.filter((p) => p.productId !== productIdToRemove)
      );
    }

    toast.success(
      `${
        activeTab === "substitutes" ? "Substitute" : "Similar product"
      } removed`
    );
  };

  const handleSaveChanges = async () => {
    if (!relationTypes) {
      toast.error("Relation types not loaded yet");
      return;
    }

    if (!admin?.id) {
      toast.error("User ID not found");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const allResults = [];

      if (pendingChanges.toAdd.substitutes.length > 0) {
        const result = await manageProductRelations({
          product_id: productId,
          similar_ids: null,
          substitute_ids: pendingChanges.toAdd.substitutes,
          remove_relation_type_id: null,
          remove_related_ids: null,
          is_delete: false,
        });
        allResults.push({ type: "add-substitutes", result });
      }

      if (pendingChanges.toAdd.similar.length > 0) {
        const result = await manageProductRelations({
          product_id: productId,
          similar_ids: pendingChanges.toAdd.similar,
          substitute_ids: null,
          remove_relation_type_id: null,
          remove_related_ids: null,
          is_delete: false,
        });
        allResults.push({ type: "add-similar", result });
      }

      if (pendingChanges.toRemove.substitutes.length > 0) {
        const result = await manageProductRelations({
          product_id: productId,
          similar_ids: null,
          substitute_ids: null,
          remove_relation_type_id: relationTypes.substituteId,
          remove_related_ids: pendingChanges.toRemove.substitutes,
          is_delete: true,
        });
        allResults.push({ type: "remove-substitutes", result });
      }

      if (pendingChanges.toRemove.similar.length > 0) {
        const result = await manageProductRelations({
          product_id: productId,
          similar_ids: null,
          substitute_ids: null,
          remove_relation_type_id: relationTypes.similarId,
          remove_related_ids: pendingChanges.toRemove.similar,
          is_delete: true,
        });
        allResults.push({ type: "remove-similar", result });
      }

      const allSuccessful = allResults.every((item) => item.result.success);

      if (allSuccessful) {
        await fetchProductData();

        const finalSubstitutes = substitutes.filter(
          (p) => !pendingChanges.toRemove.substitutes.includes(p.productId)
        );
        const finalSimilar = similarProducts.filter(
          (p) => !pendingChanges.toRemove.similar.includes(p.productId)
        );

        const relationshipsData = {
          substitutes: finalSubstitutes.map((p) => p.productId),
          similarProducts: finalSimilar.map((p) => p.productId),
        };

        onSaveChanges(relationshipsData);

        clearProductCache();

        setPendingChanges({
          toAdd: { substitutes: [], similar: [] },
          toRemove: { substitutes: [], similar: [] },
        });

        toast.success("Relationships saved successfully");

        onClose();
        onRefresh && onRefresh();
      } else {
        const failedResults = allResults.filter((item) => !item.result.success);
        const errorMessages = failedResults.map((item) => {
          switch (item.type) {
            case "add-substitutes":
              return `Failed to add substitutes: ${item.result.message}`;
            case "add-similar":
              return `Failed to add similar products: ${item.result.message}`;
            case "remove-substitutes":
              return `Failed to remove substitutes: ${item.result.message}`;
            case "remove-similar":
              return `Failed to remove similar products: ${item.result.message}`;
            default:
              return item.result.message;
          }
        });
        toast.error(`Failed to save changes: ${errorMessages.join(", ")}`);
      }
    } catch (err) {
      console.error("Error saving relationships:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to save relationships"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasPendingChanges = () => {
    return (
      pendingChanges.toAdd.substitutes.length > 0 ||
      pendingChanges.toRemove.substitutes.length > 0 ||
      pendingChanges.toAdd.similar.length > 0 ||
      pendingChanges.toRemove.similar.length > 0
    );
  };

  const getPendingCountForCurrentTab = () => {
    const tabType = activeTab === "substitutes" ? "substitutes" : "similar";
    const additions = pendingChanges.toAdd[tabType].length;
    const removals = pendingChanges.toRemove[tabType].length;

    if (additions > 0 && removals > 0) {
      return `(+${additions}, -${removals})`;
    } else if (additions > 0) {
      return `(+${additions})`;
    } else if (removals > 0) {
      return `(-${removals})`;
    }
    return "";
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161D1F]">
            Manage Product Relationships:
            <span className="text-[#0088B1]"> {productName}</span>
            {hasPendingChanges() && (
              <span className="ml-2 text-sm text-amber-600 font-normal">
                (Unsaved changes)
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-[#899193]" />
          </button>
        </div>

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
            Substitutes ({substitutes.length}) {getPendingCountForCurrentTab()}
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
            Similar Products ({similarProducts.length}){" "}
            {getPendingCountForCurrentTab()}
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-medium text-[#161D1F]">
                Current{" "}
                {activeTab === "substitutes"
                  ? "Substitutes"
                  : "Similar Products"}
              </h3>
            </div>

            {currentList.length > 0 ? (
              <div className="space-y-3">
                {currentList.map((product) => {
                  const isPendingRemoval =
                    activeTab === "substitutes"
                      ? pendingChanges.toRemove.substitutes.includes(
                          product.productId
                        )
                      : pendingChanges.toRemove.similar.includes(
                          product.productId
                        );
                  const isPendingAddition =
                    activeTab === "substitutes"
                      ? pendingChanges.toAdd.substitutes.includes(
                          product.productId
                        )
                      : pendingChanges.toAdd.similar.includes(
                          product.productId
                        );

                  return (
                    <div
                      key={product.productId}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        isPendingRemoval
                          ? "border-red-200 bg-red-50"
                          : isPendingAddition
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-[14px] text-[#161D1F]">
                          {product.ProductName}
                          {isPendingRemoval && (
                            <span className="ml-2 text-xs text-red-600">
                              (Will be removed)
                            </span>
                          )}
                          {isPendingAddition && (
                            <span className="ml-2 text-xs text-green-600">
                              (New)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-[#899193]">
                          {product.SKU || product.Type || "N/A"} |{" "}
                          {product.ManufacturerName}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(product.productId)}
                        disabled={isLoading}
                        className="p-2 text-[#EB5757] hover:bg-red-100 rounded-full disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[12px] text-[#899193] py-8 text-center">
                No{" "}
                {activeTab === "substitutes"
                  ? "substitutes"
                  : "similar products"}{" "}
                added yet
              </div>
            )}
          </div>

          <div>
            <h3 className="text-[12px] font-medium text-[#161D1F] mb-4">
              Add{" "}
              {activeTab === "substitutes" ? "Substitutes" : "Similar Products"}
            </h3>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or manufacturer..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  searchAvailableProducts(value);
                }}
                disabled={isLoading || searchLoading}
                className="w-full pl-10 pr-4 py-3 text-[#333] placeholder-[#B0B6B8] border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:opacity-50"
              />
            </div>

            <div className="space-y-3">
              {filteredAvailableProducts.length > 0 ? (
                <>
                  {filteredAvailableProducts.map((product) => {
                    const isPendingAddition =
                      activeTab === "substitutes"
                        ? pendingChanges.toAdd.substitutes.includes(
                            product.productId
                          )
                        : pendingChanges.toAdd.similar.includes(
                            product.productId
                          );

                    return (
                      <div
                        key={product.productId}
                        className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                          isPendingAddition
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div>
                          <div className="font-medium text-[14px] text-[#161D1F]">
                            {product.ProductName}
                            {isPendingAddition && (
                              <span className="ml-2 text-xs text-green-600">
                                (Will be added)
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-[#899193]">
                            {product.SKU || product.Type || "N/A"} |{" "}
                            {product.ManufacturerName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Category: {product.Category} | Stock:{" "}
                            {product.StockAvailableInInventory}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddProduct(product)}
                          disabled={isLoading || isPendingAddition}
                          className={`px-4 py-2 text-[12px] rounded-lg transition-colors disabled:opacity-50 ${
                            isPendingAddition
                              ? "text-green-600 border border-green-600 bg-green-50"
                              : "text-[#0891B2] hover:bg-[#0891B2] hover:text-white border border-[#0891B2]"
                          }`}
                        >
                          {isPendingAddition ? "Added" : "Add"}
                        </button>
                      </div>
                    );
                  })}

                  {pagination.hasMore && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={() =>
                          searchAvailableProducts(searchQuery, true)
                        }
                        disabled={searchLoading}
                        className="px-6 py-2 text-[12px] font-medium text-[#0891B2] hover:bg-[#0891B2] hover:text-white border border-[#0891B2] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {searchLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[12px] text-[#899193] py-8 text-center">
                  {searchLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0891B2] border-t-transparent"></div>
                      Loading products...
                    </div>
                  ) : searchQuery ? (
                    "No products found matching your search"
                  ) : (
                    "No available products"
                  )}
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
            disabled={isLoading || !hasPendingChanges()}
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
