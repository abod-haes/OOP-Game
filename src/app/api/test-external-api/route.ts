import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://roborescue.somee.com";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing external API connectivity...");

    // Test basic connectivity
    const testResponse = await fetch(
      `${BASE_URL}/api/externalProviders/GoogleUserAccountData`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("External API test response status:", testResponse.status);
    console.log(
      "External API test response headers:",
      Object.fromEntries(testResponse.headers.entries())
    );

    let responseText = "";
    try {
      responseText = await testResponse.text();
      console.log("External API test response body:", responseText);
    } catch (e) {
      console.log("Could not read response body:", e);
    }

    return NextResponse.json({
      success: true,
      externalApiUrl: `${BASE_URL}/api/externalProviders/GoogleUserAccountData`,
      responseStatus: testResponse.status,
      responseHeaders: Object.fromEntries(testResponse.headers.entries()),
      responseBody: responseText.substring(0, 500), // Limit response body for readability
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("External API test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        externalApiUrl: `${BASE_URL}/api/externalProviders/GoogleUserAccountData`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
