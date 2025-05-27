// src/utils/env.ts
export const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

// Usage:
// const API_URL = getEnv("NEXT_PUBLIC_API_BASE_URL");
