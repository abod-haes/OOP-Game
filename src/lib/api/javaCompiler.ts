import { writeFile, mkdir, rm } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);

export interface CompilationResult {
    success: boolean;
    output?: string;
    error?: string;
}

const TEMP_BASE_DIR = path.join(process.cwd(), "temp");

function formatError(error: string): string {
    // Split the error message into lines
    const lines = error.split("\n");

    // Filter out empty lines and common Java compiler messages
    const errorLines = lines.filter(
        (line) =>
            line.trim() &&
            !line.includes("Note:") &&
            !line.includes("warning:") &&
            !line.includes("^")
    );

    // Combine all error messages into one
    if (errorLines.length > 0) {
        // Remove duplicate errors and format them
        const uniqueErrors = errorLines
            .map((line) => line.trim())
            .filter((line, index, self) => self.indexOf(line) === index);
        return uniqueErrors.join(" | ");
    }

    return error.trim();
}

function hasStderr(error: unknown): error is { stderr: string } {
    return (
        typeof error === "object" &&
        error !== null &&
        "stderr" in error &&
        typeof (error as { stderr: unknown }).stderr === "string"
    );
}

export async function compileAndRun(code: string): Promise<CompilationResult> {
    if (!code) {
        return {
            success: false,
            error: "No code provided",
        };
    }

    const tempDir = path.join(TEMP_BASE_DIR, uuidv4());

    try {
        await mkdir(tempDir, { recursive: true });
        const javaFilePath = path.join(tempDir, "Main.java");
        await writeFile(javaFilePath, code);

        try {
            // Compile the Java file
            await execAsync(`javac ${javaFilePath}`);

            // Run the compiled program
            const { stdout, stderr } = await execAsync(
                `java -cp ${tempDir} Main`
            );

            if (stderr) {
                return {
                    success: false,
                    error: formatError(stderr),
                };
            }

            return {
                success: true,
                output: stdout,
            };
        } catch (error: unknown) {
            let formattedError = "Unknown error";
            if (hasStderr(error)) {
                formattedError = formatError(error.stderr);
            } else if (error instanceof Error) {
                formattedError = formatError(error.message);
            }
            return {
                success: false,
                error: formattedError,
            };
        } finally {
            // Clean up
            await rm(tempDir, { recursive: true, force: true });
        }
    } catch (error: unknown) {
        let formattedError = "Unknown error";
        if (error instanceof Error) {
            formattedError = formatError(error.message);
        }
        return {
            success: false,
            error: formattedError,
        };
    }
}
