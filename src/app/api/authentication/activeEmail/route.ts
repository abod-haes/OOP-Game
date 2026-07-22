import { NextRequest, NextResponse } from "next/server";

export interface EmailActivationRequest {
  email: string;
  token: string;
}

export interface EmailActivationResponse {
  accessToken: string;
  refreshToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailActivationRequest = await request.json();

    if (!body.email || !body.token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    if (body.token.length !== 8) {
      return NextResponse.json(
        { error: "Token must be 8 characters long" },
        { status: 400 }
      );
    }

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const result: EmailActivationResponse = {
      accessToken: `local-access-${suffix}`,
      refreshToken: `local-refresh-${suffix}`,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Invalid activation request" },
      { status: 400 }
    );
  }
}
