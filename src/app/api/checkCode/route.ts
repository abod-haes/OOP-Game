import { NextResponse } from "next/server";
import { validateLocalLevelCode } from "@/data/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, levelId, code } = body;

    if (!userId || !levelId || !code) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required parameters: userId, levelId, and code are required",
        },
        { status: 400 }
      );
    }

    const validation = validateLocalLevelCode(levelId, code);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Invalid request",
      },
      { status: 400 }
    );
  }
}
