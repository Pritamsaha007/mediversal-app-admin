import { useAdminStore } from "../store/adminStore";

export const useApiWithAuth = () => {
  const { token, refreshTokenIfNeeded, logout, isLoggedIn } = useAdminStore();

  const apiCall = async (url: string, options: RequestInit = {}) => {
    if (!isLoggedIn) {
      throw new Error("User not authenticated");
    }

    // Refresh token if needed before making the API call
    await refreshTokenIfNeeded();

    // Get the latest token after potential refresh
    const latestToken = useAdminStore.getState().token;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${latestToken}`,
        "Content-Type": "application/json",
      },
    });

    // If we get a 401, try to refresh token once more
    if (response.status === 401) {
      try {
        await refreshTokenIfNeeded();
        const refreshedToken = useAdminStore.getState().token;

        // Retry the request with refreshed token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${refreshedToken}`,
            "Content-Type": "application/json",
          },
        });

        if (retryResponse.status === 401) {
          // If still 401 after refresh, logout user
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
