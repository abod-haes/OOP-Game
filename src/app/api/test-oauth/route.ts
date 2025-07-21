import { NextResponse } from "next/server";
import {
  GOOGLE_OAUTH_CONFIG,
  generateGoogleSignInUrl,
} from "@/lib/config/google-oauth";

export async function GET() {
  try {
    // Test the OAuth configuration
    const signInUrl = generateGoogleSignInUrl();

    return NextResponse.json({
      success: true,
      config: {
        clientId: GOOGLE_OAUTH_CONFIG.clientId,
        redirectUri: GOOGLE_OAUTH_CONFIG.redirectUri,
        allowedRedirectUris: GOOGLE_OAUTH_CONFIG.allowedRedirectUris,
        scopes: GOOGLE_OAUTH_CONFIG.scopes,
      },
      signInUrl: signInUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("OAuth test error:", error);
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
