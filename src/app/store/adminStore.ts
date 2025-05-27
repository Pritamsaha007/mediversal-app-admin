import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminInfo {
  id: number;
  email: string;
  name: string;
}

export interface AdminLoginResponse {
  token: string;
  message: string;
  admin: AdminInfo;
}

interface AdminStore {
  token: string;
  message: string;
  admin: AdminInfo;
  isLoggedIn: boolean;
  hasHydrated: boolean;
  setAdminData: (data: AdminLoginResponse) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      token: "",
      message: "",
      admin: { id: 0, email: "", name: "" },
      isLoggedIn: false,
      hasHydrated: false,

      setAdminData: (data) =>
        set({
          token: data.token,
          message: data.message,
          admin: data.admin,
          isLoggedIn: true,
        }),

      logout: () =>
        set({
          token: "",
          message: "",
          admin: { id: 0, email: "", name: "" },
          isLoggedIn: false,
          hasHydrated: true,
        }),

      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
    }),
    {
      name: "admin-auth-storage",
      version: 1,
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
