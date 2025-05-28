export interface CompilationResult {
    success: boolean;
    output?: string;
    error?: string;
}

const BASE_URL = "/api";

export async function compileJava(code: string): Promise<CompilationResult> {
    try {
        const formData = new FormData();
        formData.append("code", code);

        const response = await fetch(`${BASE_URL}/compile`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return {
            success: false,
            error: errorMessage,
        };
    }
}
