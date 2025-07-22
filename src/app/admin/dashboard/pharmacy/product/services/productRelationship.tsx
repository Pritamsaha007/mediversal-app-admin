const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ProductRelationships {
  similarProducts: number[];
  substitutes: number[];
}

interface ProductData {
  productId: number;
  ProductName: string;
  Type: string;
  ManufacturerName: string;
  similarProducts: any[];
  substitutes: any[];
}

export const updateProductRelationships = async (
  productId: number,
  relationships: Partial<ProductRelationships>
): Promise<ProductRelationships> => {
  try {
    if (!productId || isNaN(productId)) {
      throw new Error("Invalid product ID");
    }

    if (!relationships || typeof relationships !== "object") {
      throw new Error("Invalid relationships data");
    }

    const payload = {
      similarProducts: Array.isArray(relationships.similarProducts)
        ? relationships.similarProducts.filter((id) => !isNaN(id) && id > 0)
        : [],
      substitutes: Array.isArray(relationships.substitutes)
        ? relationships.substitutes.filter((id) => !isNaN(id) && id > 0)
        : [],
    };

    const response = await fetch(
      `${API_BASE_URL}/app/api/Product/relationships/${productId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const responseData = await response.json();
    console.log("Success response:", responseData);

    return responseData;
  } catch (error) {
    console.error("API call failed:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error: Unable to connect to the server. Please check your internet connection."
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "An unexpected error occurred while updating product relationships"
    );
  }
};

export const getProductsById = async (
  productId: number
): Promise<ProductData> => {
  try {
    if (!productId || isNaN(productId)) {
      throw new Error("Invalid product ID");
    }

    const response = await fetch(
      `${API_BASE_URL}/app/api/Product/getProductById/${productId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export const removeProductRelationship = async (
  productId: number,
  relationshipType: "similar-products" | "substitutes",
  itemIdToRemove: number
): Promise<{ success: boolean }> => {
  try {
    if (!productId || isNaN(productId)) {
      throw new Error("Invalid product ID");
    }

    if (!itemIdToRemove || isNaN(itemIdToRemove)) {
      throw new Error("Invalid item ID to remove");
    }

    const url = `${API_BASE_URL}/app/api/Product/${productId}/${relationshipType}/${itemIdToRemove}`;
    console.log("Attempting to call DELETE endpoint:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMsg += ` - ${JSON.stringify(errorBody)}`;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error removing ${relationshipType} relationship:`, error);
    throw error;
  }
};
