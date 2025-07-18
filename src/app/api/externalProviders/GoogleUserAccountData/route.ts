import { NextRequest, NextResponse } from "next/server";
import { completeLocalGoogleOAuthFlow } from "@/lib/config/google-oauth";

export interface GoogleUserAccountResponse {
  accessToken: string;
  refreshToken: string;
  userId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("Code");

    if (!code) {
      console.error("No authorization code provided");
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    console.log("Processing Google OAuth code:", code.substring(0, 20) + "...");
    console.log("Code length:", code.length);
    console.log("Full code:", code);

    // Use local Google OAuth flow
    console.log("Starting local OAuth flow...");

    try {
      console.log("Step 1: Calling completeLocalGoogleOAuthFlow...");
      const oauthResult = await completeLocalGoogleOAuthFlow(code);
      console.log("Step 2: OAuth flow completed successfully");
      console.log("OAuth result keys:", Object.keys(oauthResult));

      const userData: GoogleUserAccountResponse = {
        accessToken: oauthResult.accessToken,
        refreshToken: oauthResult.refreshToken,
        userId: oauthResult.userId,
      };

      console.log("Local OAuth flow completed successfully");
      console.log(
        "Returning user data with access token length:",
        userData.accessToken.length
      );

      return NextResponse.json(userData, { status: 200 });
    } catch (oauthError) {
      console.error("Local OAuth flow failed:", oauthError);
      console.error(
        "Error stack:",
        oauthError instanceof Error ? oauthError.stack : "No stack trace"
      );

      // Check if it's an invalid_grant error (code expired or used)
      if (
        oauthError instanceof Error &&
        oauthError.message.includes("invalid_grant")
      ) {
        console.error("Invalid grant error detected");
        return NextResponse.json(
          {
            error:
              "Authorization code has expired or been used. Please try signing in again.",
            details: oauthError.message,
            type: "invalid_grant",
          },
          { status: 400 }
        );
      }

      // Check if it's an external API error
      if (
        oauthError instanceof Error &&
        oauthError.message.includes("Failed to register Google user")
      ) {
        console.error("External API registration error detected");
        return NextResponse.json(
          {
            error:
              "External authentication service is unavailable. Using fallback mechanism.",
            details: oauthError.message,
            type: "external_api_error",
          },
          { status: 400 }
        );
      }

      // Re-throw other errors
      throw oauthError;
    }
  } catch (error) {
    console.error("Google OAuth completion error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Return a more detailed error response
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        error: `Google authentication failed: ${errorMessage}`,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
