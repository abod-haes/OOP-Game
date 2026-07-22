export const GOOGLE_CLIENT_ID = "local-mode";
export const GOOGLE_CLIENT_SECRET = "local-mode";

export const GOOGLE_OAUTH_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: "/",
  allowedRedirectUris: ["/"],
  scopes: ["openid", "profile", "email"],
};

export const GOOGLE_OAUTH_URLS = {
  authUrl: "/",
  tokenUrl: "/api/auth/refresh",
  userInfoUrl: "/api/profile",
};

export interface LocalGoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface LocalGoogleAuthResult {
  accessToken: string;
  refreshToken: string;
  userId?: string;
  userInfo?: LocalGoogleUserInfo;
}

function createLocalGoogleResult(seed: string): LocalGoogleAuthResult {
  const safeSeed = seed.trim() || "local-google-user";
  const userId = `local-google-${safeSeed.slice(0, 24)}`;
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    accessToken: `local-access-${userId}-${nonce}`,
    refreshToken: `local-refresh-${userId}-${nonce}`,
    userId,
    userInfo: {
      id: userId,
      email: "google-player@roborescue.local",
      verified_email: true,
      name: "Google Player",
      given_name: "Google",
      family_name: "Player",
      picture: "",
      locale: "en",
    },
  };
}

export function generateGoogleSignInUrl(): string {
  return "/";
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
}> {
  const result = createLocalGoogleResult(code);
  return {
    access_token: result.accessToken,
    refresh_token: result.refreshToken,
    expires_in: 60 * 60 * 24 * 365,
    token_type: "Bearer",
    id_token: result.userId,
  };
}

export async function getGoogleUserInfo(
  accessToken: string
): Promise<LocalGoogleUserInfo> {
  return (
    createLocalGoogleResult(accessToken).userInfo || {
      id: "local-google-user",
      email: "google-player@roborescue.local",
      verified_email: true,
      name: "Google Player",
      given_name: "Google",
      family_name: "Player",
      picture: "",
      locale: "en",
    }
  );
}

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
  userId?: string;
}> {
  const result = createLocalGoogleResult(googleUserData.id);
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    userId: result.userId,
  };
}

export async function completeGoogleOAuthFlow(
  code: string
): Promise<LocalGoogleAuthResult> {
  return createLocalGoogleResult(code);
}

export async function completeLocalGoogleOAuthFlow(
  code: string
): Promise<LocalGoogleAuthResult> {
  return createLocalGoogleResult(code);
}
