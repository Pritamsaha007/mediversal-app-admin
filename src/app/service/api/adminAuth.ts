export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  message: string;
  admin: {
    id: number;
    email: string;
    name: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function adminLogin(
  payload: AdminLoginPayload
): Promise<AdminLoginResponse> {
  console.log("API_BASE_URL:", API_BASE_URL);

  const response = await fetch(`${API_BASE_URL}/app/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("response status:", response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Login failed:", errorData);
    throw new Error(errorData?.message || "Login failed");
  }

  return await response.json();
}
