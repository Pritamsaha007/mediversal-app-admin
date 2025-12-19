const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { EnumCodes, fetchEnums } from "@/app/service/enumService";
import { useAdminStore } from "@/app/store/adminStore";

interface ManageProductRelationsRequest {
  product_id: string;
  similar_ids: string[] | null;
  substitute_ids: string[] | null;
  remove_relation_type_id: string | null;
  remove_related_ids: string[] | null;
  is_delete: boolean;
  created_by: string;
  updated_by: string;
}

interface ManageProductRelationsResponse {
  success: boolean;
  message?: string;
  data?: any;
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

const getCurrentUserId = (): string => {
  const { admin } = useAdminStore.getState();
  return admin?.id;
};

export const manageProductRelations = async (
  requestData: Omit<ManageProductRelationsRequest, "created_by" | "updated_by">
): Promise<ManageProductRelationsResponse> => {
  try {
    const { product_id } = requestData;

    if (
      !product_id ||
      typeof product_id !== "string" ||
      product_id.trim() === ""
    ) {
      throw new Error("Invalid product ID");
    }

    const userId = getCurrentUserId();

    const payload: ManageProductRelationsRequest = {
      ...requestData,
      created_by: "",
      updated_by: "",
    };

    console.log("Sending payload to manage relations:", payload);

    const response = await fetch(
      `${API_BASE_URL}/api/product/relations/manage`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const responseData = await response.json();
    console.log("Manage relations response:", responseData);

    if (!response.ok) {
      throw new Error(
        responseData.message || `HTTP error! status: ${response.status}`
      );
    }

    return {
      success: true,
      ...responseData,
    };
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
      "An unexpected error occurred while managing product relationships"
    );
  }
};

export const addSimilarProducts = async (
  productId: string,
  similarIds: string[],
  relationTypeId: string
): Promise<ManageProductRelationsResponse> => {
  return manageProductRelations({
    product_id: productId,
    similar_ids: similarIds,
    substitute_ids: null,
    remove_relation_type_id: null,
    remove_related_ids: null,
    is_delete: false,
  });
};

export const addSubstituteProducts = async (
  productId: string,
  substituteIds: string[],
  relationTypeId: string
): Promise<ManageProductRelationsResponse> => {
  return manageProductRelations({
    product_id: productId,
    similar_ids: null,
    substitute_ids: substituteIds,
    remove_relation_type_id: null,
    remove_related_ids: null,
    is_delete: false,
  });
};

export const removeProductRelations = async (
  productId: string,
  relationTypeId: string,
  relatedIds: string[]
): Promise<ManageProductRelationsResponse> => {
  return manageProductRelations({
    product_id: productId,
    similar_ids: null,
    substitute_ids: null,
    remove_relation_type_id: relationTypeId,
    remove_related_ids: relatedIds,
    is_delete: true,
  });
};

export const fetchRelationType = (token: string) =>
  fetchEnums(EnumCodes.PRODUCT_RELATION_TYPE, token);
