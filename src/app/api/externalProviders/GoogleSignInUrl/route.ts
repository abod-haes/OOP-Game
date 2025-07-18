import { NextResponse } from "next/server";
import { generateGoogleSignInUrl } from "@/lib/config/google-oauth";

export async function GET() {
  try {
    console.log("Generating local Google sign-in URL...");

    // Use local Google OAuth configuration with frontend callback URL
    const googleSignInUrl = generateGoogleSignInUrl();
    console.log("Generated Google sign-in URL:", googleSignInUrl);

    return NextResponse.json({ url: googleSignInUrl }, { status: 200 });
  } catch (error) {
    console.error("Google sign-in URL generation error:", error);
    return NextResponse.json(
      {
        error: `Failed to generate Google sign-in URL: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
