/**
 * Google OAuth Configuration and Service
 * Handles Google OAuth authentication with direct credential integration
 */

// Google OAuth configuration
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Validate required environment variables
if (!GOOGLE_CLIENT_ID) {
  throw new Error(
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is required"
  );
}

if (!GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET environment variable is required");
}

// Debug logging
console.log("Environment variables:");
console.log(
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID:",
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Set" : "Not set"
);
console.log(
  "GOOGLE_CLIENT_SECRET:",
  process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set"
);
console.log(
  "GOOGLE_CLIENT_ID (final):",
  GOOGLE_CLIENT_ID ? "Configured" : "Not configured"
);

// Get the base URL from environment or use default
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  // Default to localhost:3000 if not in production
  return process.env.NODE_ENV === "production"
    ? "http://localhost:3000"
    : "http://localhost:3000";
};

// Additional allowed redirect URIs
const ALLOWED_REDIRECT_URIS = [
  "http://localhost:3000/auth/google/callback",
  "http://localhost:3001/auth/google/callback",
];

export const GOOGLE_OAUTH_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: `${getBaseUrl()}/auth/google/callback`,
  allowedRedirectUris: ALLOWED_REDIRECT_URIS,
  scopes: ["openid", "profile", "email"],
};

// Google OAuth URLs
export const GOOGLE_OAUTH_URLS = {
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
};

/**
 * Generate a random state string for OAuth security
 */
function generateRandomState(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Generate Google OAuth sign-in URL
 */
export function generateGoogleSignInUrl(customRedirectUri?: string): string {
  // Validate the redirect URI if provided
  const redirectUri = customRedirectUri || GOOGLE_OAUTH_CONFIG.redirectUri;

  if (
    customRedirectUri &&
    !GOOGLE_OAUTH_CONFIG.allowedRedirectUris.includes(customRedirectUri)
  ) {
    throw new Error("Invalid redirect URI");
  }

  // Debug logging
  console.log("Google sign-in URL debug:");
  console.log("Client ID:", GOOGLE_OAUTH_CONFIG.clientId);
  console.log("Redirect URI:", redirectUri);

  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: generateRandomState(), // For security
  });

  return `${GOOGLE_OAUTH_URLS.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  customRedirectUri?: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
}> {
  // Validate the redirect URI if provided
  const redirectUri = customRedirectUri || GOOGLE_OAUTH_CONFIG.redirectUri;

  if (
    customRedirectUri &&
    !GOOGLE_OAUTH_CONFIG.allowedRedirectUris.includes(customRedirectUri)
  ) {
    throw new Error("Invalid redirect URI");
  }

  // Debug logging
  console.log("Token exchange debug:");
  console.log("Client ID:", GOOGLE_OAUTH_CONFIG.clientId);
  console.log("Redirect URI:", redirectUri);
  console.log("Code length:", code.length);
  console.log("Code (first 20 chars):", code.substring(0, 20));

  const requestBody = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  console.log("Request body:", requestBody.toString());

  const response = await fetch(GOOGLE_OAUTH_URLS.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: requestBody,
  });

  console.log("Response status:", response.status);
  console.log(
    "Response headers:",
    Object.fromEntries(response.headers.entries())
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token exchange error response:", errorText);

    // Try to parse as JSON for better error handling
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(
        `Token exchange failed: ${JSON.stringify(errorJson, null, 2)}`
      );
    } catch {
      throw new Error(`Token exchange failed: ${errorText}`);
    }
  }

  const responseData = await response.json();
  console.log(
    "Token exchange successful, response keys:",
    Object.keys(responseData)
  );

  return responseData;
}

/**
 * Get user information from Google
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}> {
  const response = await fetch(GOOGLE_OAUTH_URLS.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get user info: ${errorText}`);
  }

  return await response.json();
}

// Base URL for external API
const BASE_URL = "http://roborescue.somee.com";

/**
 * Register/Sign in user with Google account data
 */
export async function registerGoogleUser(googleUserData: {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  console.log("Registering Google user with external API...");
  console.log("User data:", {
    googleId: googleUserData.id,
    email: googleUserData.email,
    firstName: googleUserData.given_name,
    lastName: googleUserData.family_name,
    fullName: googleUserData.name,
  });

  const requestBody = {
    googleId: googleUserData.id,
    email: googleUserData.email,
    firstName: googleUserData.given_name,
    lastName: googleUserData.family_name,
    fullName: googleUserData.name,
    profilePicture: googleUserData.picture,
  };

  console.log("Request body:", JSON.stringify(requestBody, null, 2));
  console.log(
    "External API URL:",
    `${BASE_URL}/api/externalProviders/GoogleUserAccountData`
  );

  try {
    const response = await fetch(
      `${BASE_URL}/api/externalProviders/GoogleUserAccountData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("External API response status:", response.status);
    console.log(
      "External API response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("External API error response:", errorText);

      // Try to parse as JSON for better error handling
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(
          `Failed to register Google user: ${JSON.stringify(
            errorJson,
            null,
            2
          )}`
        );
      } catch {
        throw new Error(`Failed to register Google user: ${errorText}`);
      }
    }

    const responseData = await response.json();
    console.log("External API successful response:", Object.keys(responseData));

    return responseData;
  } catch (error) {
    console.error("registerGoogleUser error:", error);

    // If the external API fails, we could implement a fallback
    // For now, we'll just re-throw the error
    throw error;
  }
}

/**
 * Complete Google OAuth flow using external API
 */
export async function completeGoogleOAuthFlow(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  userId?: string;
  userInfo?: {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
  };
}> {
  try {
    // Use external API to handle the Google OAuth flow
    const response = await fetch(
      `${BASE_URL}/api/externalProviders/GoogleUserAccountData?Code=${encodeURIComponent(
        code
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`External API error: ${errorText}`);
    }

    const authTokens = await response.json();

    return {
      accessToken: authTokens.accessToken,
      refreshToken: authTokens.refreshToken,
      userId: authTokens.userId,
      userInfo: undefined, // External API handles user info
    };
  } catch (error) {
    console.error("Google OAuth flow error:", error);
    throw error;
  }
}

/**
 * Complete Google OAuth flow using local configuration (fallback)
 */
export async function completeLocalGoogleOAuthFlow(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  userId?: string;
  userInfo?: {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
  };
}> {
  try {
    console.log("=== Starting completeLocalGoogleOAuthFlow ===");
    console.log("Code length:", code.length);
    console.log("Code (first 20 chars):", code.substring(0, 20));

    // Step 1: Exchange code for tokens
    console.log("Step 1: Exchanging code for tokens...");
    const tokenData = await exchangeCodeForTokens(code);
    console.log("Step 1 completed: Token exchange successful");
    console.log("Token data keys:", Object.keys(tokenData));
    console.log("Access token length:", tokenData.access_token?.length || 0);
    console.log("Refresh token length:", tokenData.refresh_token?.length || 0);

    // Step 2: Get user information
    console.log("Step 2: Getting user information from Google...");
    const userInfo = await getGoogleUserInfo(tokenData.access_token);
    console.log("Step 2 completed: User info retrieved");
    console.log("User info keys:", Object.keys(userInfo));
    console.log("User email:", userInfo.email);
    console.log("User name:", userInfo.name);

    // Step 3: Try to register/Sign in user with your backend
    console.log("Step 3: Attempting to register user with external API...");
    try {
      const authTokens = await registerGoogleUser({
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        picture: userInfo.picture,
      });

      console.log("Step 3 completed: External API registration successful");
      console.log("Auth tokens keys:", Object.keys(authTokens));

      return {
        accessToken: authTokens.accessToken,
        refreshToken: authTokens.refreshToken,
        userId: userInfo.id, // Include user ID from Google
        userInfo,
      };
    } catch (registerError) {
      console.error(
        "Step 3 failed: External API registration failed:",
        registerError
      );
      console.error(
        "Register error stack:",
        registerError instanceof Error ? registerError.stack : "No stack trace"
      );

      // Fallback: Create a local session using Google tokens
      // This is a temporary solution until the external API is fixed
      console.log("Using fallback mechanism with Google tokens...");
      const fallbackTokens = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || tokenData.access_token, // Use access token as fallback
      };

      console.log("Fallback tokens created:");
      console.log("- Access token length:", fallbackTokens.accessToken.length);
      console.log(
        "- Refresh token length:",
        fallbackTokens.refreshToken.length
      );
      console.log("- User ID from Google:", userInfo.id);

      return {
        accessToken: fallbackTokens.accessToken,
        refreshToken: fallbackTokens.refreshToken,
        userInfo,
        userId: userInfo.id, // Include user ID for the fallback
      };
    }
  } catch (error) {
    console.error("=== completeLocalGoogleOAuthFlow failed ===");
    console.error("Error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    throw error;
  }
}
