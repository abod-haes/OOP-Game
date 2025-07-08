/**
 * Google OAuth Configuration and Service
 * Handles Google OAuth authentication with direct credential integration
 */

// Google OAuth configuration
// Do NOT commit secrets to this file. Use environment variables instead.

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export const GOOGLE_OAUTH_CONFIG = {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/auth/google/callback` : "http://localhost:3000/auth/google/callback",
    scopes: [
        "openid",
        "profile",
        "email"
    ]
};

// Google OAuth URLs
export const GOOGLE_OAUTH_URLS = {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
};

/**
 * Generate a random state string for OAuth security
 */
function generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
}

/**
 * Generate Google OAuth sign-in URL
 */
export function generateGoogleSignInUrl(): string {
    const params = new URLSearchParams({
        client_id: GOOGLE_OAUTH_CONFIG.clientId,
        redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
        response_type: 'code',
        scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
        access_type: 'offline',
        prompt: 'consent',
        state: generateRandomState() // For security
    });

    return `${GOOGLE_OAUTH_URLS.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    id_token?: string;
}> {
    const response = await fetch(GOOGLE_OAUTH_URLS.tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: GOOGLE_OAUTH_CONFIG.clientId,
            client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${errorText}`);
    }

    return await response.json();
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
    const response = await fetch(`${process.env.EXTERNAL_API_BASE_URL || 'http://roborescue.somee.com/api'}/authentication/google-signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            googleId: googleUserData.id,
            email: googleUserData.email,
            firstName: googleUserData.given_name,
            lastName: googleUserData.family_name,
            fullName: googleUserData.name,
            profilePicture: googleUserData.picture,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to register Google user: ${errorText}`);
    }

    return await response.json();
}

/**
 * Complete Google OAuth flow
 */
export async function completeGoogleOAuthFlow(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    userInfo: {
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
        // Step 1: Exchange code for tokens
        const tokenData = await exchangeCodeForTokens(code);
        
        // Step 2: Get user information
        const userInfo = await getGoogleUserInfo(tokenData.access_token);
        
        // Step 3: Register/Sign in user with your backend
        const authTokens = await registerGoogleUser({
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            given_name: userInfo.given_name,
            family_name: userInfo.family_name,
            picture: userInfo.picture,
        });
        
        return {
            accessToken: authTokens.accessToken,
            refreshToken: authTokens.refreshToken,
            userInfo,
        };
    } catch (error) {
        console.error('Google OAuth flow error:', error);
        throw error;
    }
}