"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/app/store/adminStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isLoggedIn } = useAdminStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.push("/");
    }
  }, [hasHydrated, isLoggedIn, router]);

  if (!hasHydrated) {
    return null;
  }

  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
