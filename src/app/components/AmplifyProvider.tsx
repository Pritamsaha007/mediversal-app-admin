"use client";

import "../config/cognito.config";

interface AmplifyProviderProps {
  children: React.ReactNode;
}

export default function AmplifyProvider({ children }: AmplifyProviderProps) {
  return <>{children}</>;
}
