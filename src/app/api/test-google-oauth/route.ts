import { NextRequest, NextResponse } from "next/server";
import {
  GOOGLE_OAUTH_CONFIG,
  generateGoogleSignInUrl,
  exchangeCodeForTokens,
  getGoogleUserInfo,
} from "@/lib/config/google-oauth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testCode = searchParams.get("code");

    console.log("=== Google OAuth Configuration Test ===");

    // Test 1: Configuration
    console.log("Test 1: Checking OAuth configuration...");
    const config = {
      clientId: GOOGLE_OAUTH_CONFIG.clientId,
      redirectUri: GOOGLE_OAUTH_CONFIG.redirectUri,
      allowedRedirectUris: GOOGLE_OAUTH_CONFIG.allowedRedirectUris,
      scopes: GOOGLE_OAUTH_CONFIG.scopes,
    };

    console.log("OAuth Config:", config);

    // Test 2: Generate sign-in URL
    console.log("Test 2: Generating sign-in URL...");
    const signInUrl = generateGoogleSignInUrl();
    console.log("Sign-in URL generated successfully");

    // Test 3: If a test code is provided, try to exchange it
    let tokenTest = null;
    let userInfoTest = null;

    if (testCode) {
      console.log("Test 3: Testing token exchange with provided code...");
      try {
        const tokenData = await exchangeCodeForTokens(testCode);
        tokenTest = {
          success: true,
          hasAccessToken: !!tokenData.access_token,
          hasRefreshToken: !!tokenData.refresh_token,
          accessTokenLength: tokenData.access_token?.length || 0,
          refreshTokenLength: tokenData.refresh_token?.length || 0,
        };

        console.log("Token exchange successful");

        // Test 4: Try to get user info
        console.log("Test 4: Testing user info retrieval...");
        try {
          const userInfo = await getGoogleUserInfo(tokenData.access_token);
          userInfoTest = {
            success: true,
            email: userInfo.email,
            name: userInfo.name,
            id: userInfo.id,
          };
          console.log("User info retrieval successful");
        } catch (userInfoError) {
          console.error("User info retrieval failed:", userInfoError);
          userInfoTest = {
            success: false,
            error:
              userInfoError instanceof Error
                ? userInfoError.message
                : "Unknown error",
          };
        }
      } catch (tokenError) {
        console.error("Token exchange failed:", tokenError);
        tokenTest = {
          success: false,
          error:
            tokenError instanceof Error ? tokenError.message : "Unknown error",
        };
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      config,
      signInUrl,
      tokenTest,
      userInfoTest,
      note: testCode
        ? "Code provided for testing"
        : "No test code provided - only configuration tested",
    });
  } catch (error) {
    console.error("Google OAuth test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
