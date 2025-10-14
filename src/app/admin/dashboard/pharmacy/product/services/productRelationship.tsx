const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { useAdminStore } from "@/app/store/adminStore";

export interface ProductRelationships {
  similarProducts: string[]; // Changed from number[] to string[]
  substitutes: string[]; // Changed from number[] to string[]
}

interface ProductData {
  productId: number;
  ProductName: string;
  Type: string;
  ManufacturerName: string;
  similarProducts: any[];
  substitutes: any[];
}

const getAuthHeaders = () => {
  const { token } = useAdminStore.getState();
  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

export const updateProductRelationships = async (
  productId: string, // Changed from number to string
  relationships: Partial<ProductRelationships>
): Promise<ProductRelationships> => {
  try {
    if (
      !productId ||
      typeof productId !== "string" ||
      productId.trim() === ""
    ) {
      // Updated validation
      throw new Error("Invalid product ID");
    }

    if (!relationships || typeof relationships !== "object") {
      throw new Error("Invalid relationships data");
    }

    const payload = {
      similarProducts: Array.isArray(relationships.similarProducts)
        ? relationships.similarProducts.filter((id) => id && id.trim() !== "") // Filter for valid strings
        : [],
      substitutes: Array.isArray(relationships.substitutes)
        ? relationships.substitutes.filter((id) => id && id.trim() !== "") // Filter for valid strings
        : [],
    };

    // Fix: Update the API endpoint to match your requirement
    const response = await fetch(
      `${API_BASE_URL}/api/Product/relationships/${productId}`, // Use productId directly as string
      {
        method: "POST",
        headers: getAuthHeaders(),
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
  productId: string
): Promise<ProductData> => {
  try {
    if (!productId) {
      throw new Error("Invalid product ID");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/Product/getProductById/${productId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
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
  productId: string,
  relationshipType: "similar-products" | "substitutes",
  itemIdToRemove: string
): Promise<{ success: boolean }> => {
  try {
    if (!productId) {
      throw new Error("Invalid product ID");
    }

    if (!itemIdToRemove) {
      throw new Error("Invalid item ID to remove");
    }

    const url = `${API_BASE_URL}/api/Product/${productId}/${relationshipType}/${itemIdToRemove}`;
    console.log("Attempting to call DELETE endpoint:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
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
