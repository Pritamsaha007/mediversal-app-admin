import { useAdminStore } from "../store/adminStore";

export const useApiWithAuth = () => {
  const { token, refreshTokenIfNeeded, logout, isLoggedIn } = useAdminStore();

  const apiCall = async (url: string, options: RequestInit = {}) => {
    if (!isLoggedIn) {
      throw new Error("User not authenticated");
    }

    await refreshTokenIfNeeded();

    const latestToken = useAdminStore.getState().token;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${latestToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      try {
        await refreshTokenIfNeeded();
        const refreshedToken = useAdminStore.getState().token;

        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${refreshedToken}`,
            "Content-Type": "application/json",
          },
        });

        if (retryResponse.status === 401) {
          logout();
          throw new Error("Session expired. Please login again.");
        }

        return retryResponse;
      } catch (error) {
        logout();
        throw new Error("Session expired. Please login again.");
      }
    }

    return response;
  };

  return { apiCall };
};
