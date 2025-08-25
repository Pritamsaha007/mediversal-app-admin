import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  refreshCognitoToken,
  signOut,
} from "../../service/api/cognito/cognitoAuth";

export interface AdminInfo {
  id: string;
  email: string;
  name: string;
}

export interface AdminLoginResponse {
  token: string;
  refreshToken: string;
  message: string;
  admin: AdminInfo;
  expiresAt: number;
}

interface AdminStore {
  token: string;
  refreshToken: string;
  message: string;
  admin: AdminInfo;
  isLoggedIn: boolean;
  hasHydrated: boolean;
  expiresAt: number;
  tokenRefreshTimer: NodeJS.Timeout | null;
  setAdminData: (data: AdminLoginResponse) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
  refreshTokenIfNeeded: () => Promise<void>;
  startTokenRefreshTimer: () => void;
  clearTokenRefreshTimer: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      token: "",
      refreshToken: "",
      message: "",
      admin: { id: "", email: "", name: "" },
      isLoggedIn: false,
      hasHydrated: false,
      expiresAt: 0,
      tokenRefreshTimer: null,

      setAdminData: (data) => {
        set({
          token: data.token,
          refreshToken: data.refreshToken,
          message: data.message,
          admin: data.admin,
          isLoggedIn: true,
          expiresAt: data.expiresAt,
        });

        // Start token refresh timer
        get().startTokenRefreshTimer();
      },

      logout: async () => {
        const { clearTokenRefreshTimer } = get();
        clearTokenRefreshTimer();

        try {
          await signOut();
        } catch (error) {
          console.error("Error signing out:", error);
        }

        set({
          token: "",
          refreshToken: "",
          message: "",
          admin: { id: "", email: "", name: "" },
          isLoggedIn: false,
          hasHydrated: true,
          expiresAt: 0,
        });
      },

      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

      refreshTokenIfNeeded: async () => {
        const {
          refreshToken: currentRefreshToken,
          expiresAt,
          isLoggedIn,
        } = get();

        if (!isLoggedIn || !currentRefreshToken) {
          return;
        }

        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // Refresh if token expires in less than 10 seconds
        if (timeUntilExpiry < 10000) {
          try {
            const refreshedData = await refreshCognitoToken(
              currentRefreshToken
            );
            set({
              token: refreshedData.token,
              expiresAt: refreshedData.expiresAt,
            });
            console.log("Token refreshed successfully");
          } catch (error) {
            console.error("Failed to refresh token:", error);
            // If refresh fails, logout the user
            get().logout();
          }
        }
      },

      startTokenRefreshTimer: () => {
        const { clearTokenRefreshTimer, refreshTokenIfNeeded } = get();

        // Clear any existing timer
        clearTokenRefreshTimer();

        // Set up a timer to check token expiry every 30 seconds
        const timer = setInterval(() => {
          refreshTokenIfNeeded();
        }, 30000);

        set({ tokenRefreshTimer: timer });
      },

      clearTokenRefreshTimer: () => {
        const { tokenRefreshTimer } = get();
        if (tokenRefreshTimer) {
          clearInterval(tokenRefreshTimer);
          set({ tokenRefreshTimer: null });
        }
      },
    }),
    {
      name: "admin-auth-storage",
      version: 2, // Increment version due to schema changes
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        admin: state.admin,
        isLoggedIn: state.isLoggedIn,
        expiresAt: state.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Start token refresh timer when store is rehydrated
        if (state?.isLoggedIn && state?.refreshToken) {
          state?.startTokenRefreshTimer();
        }
      },
    }
  )
);
