import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";

export interface CognitoLoginPayload {
  email: string;
  password: string;
}

export interface CognitoLoginResponse {
  token: string;
  refreshToken: string;
  message: string;
  admin: {
    id: string;
    email: string;
    name: string;
  };
  expiresAt: number;
}

export async function cognitoAdminLogin(
  payload: CognitoLoginPayload
): Promise<CognitoLoginResponse> {
  try {
    const { isSignedIn } = await signIn({
      username: payload.email,
      password: payload.password,
    });

    if (isSignedIn) {
      // Get the current session
      const session = await fetchAuthSession();
      const user = await getCurrentUser();

      if (!session.tokens?.accessToken) {
        throw new Error("No access token received");
      }

      // Get expiration time (60 seconds from now as per your requirement)
      const expiresAt = Date.now() + 60 * 1000;

      return {
        token: session.tokens.accessToken.toString(),
        refreshToken: session.tokens.refreshToken?.toString() || "",
        message: "Login successful",
        admin: {
          id: user.userId,
          email: user.username,
          name: user.username, // You can customize this based on your user attributes
        },
        expiresAt,
      };
    } else {
      throw new Error("Authentication failed");
    }
  } catch (error: any) {
    console.error("Cognito login failed:", error);
    throw new Error(error.message || "Authentication failed");
  }
}

export async function refreshCognitoToken(): Promise<{
  token: string;
  expiresAt: number;
}> {
  try {
    const session = await fetchAuthSession({ forceRefresh: true });

    if (!session.tokens?.accessToken) {
      throw new Error("No access token received");
    }

    const expiresAt = Date.now() + 60 * 1000;

    return {
      token: session.tokens.accessToken.toString(),
      expiresAt,
    };
  } catch (error: any) {
    console.error("Token refresh failed:", error);
    throw new Error(error.message || "Failed to refresh token");
  }
}

export async function cognitoSignOut(): Promise<void> {
  try {
    await signOut();
  } catch (error) {
    console.error("Error signing out:", error);
  }
}
