import { NextResponse } from "next/server";
import { compileAndRun } from "@/lib/api/javaCompiler";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const code = formData.get("code") as string;

        const result = await compileAndRun(code);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
