"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/app/store/adminStore";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const {
    hasHydrated,
    isLoggedIn,
    startTokenRefreshTimer,
    clearTokenRefreshTimer,
  } = useAdminStore();

  useEffect(() => {
    if (hasHydrated && isLoggedIn) {
      // Start token refresh timer when the app loads
      startTokenRefreshTimer();
    }

    // Cleanup on unmount
    return () => {
      clearTokenRefreshTimer();
    };
  }, [hasHydrated, isLoggedIn, startTokenRefreshTimer, clearTokenRefreshTimer]);

  return <>{children}</>;
}
