import { NextRequest, NextResponse } from "next/server";

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshTokenRequest = await request.json();

    if (!body.refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const result: RefreshTokenResponse = {
      accessToken: `local-access-${suffix}`,
      refreshToken: `local-refresh-${suffix}`,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Invalid refresh request" },
      { status: 400 }
    );
  }
}
