export interface SyntaxError {
  line: number;
  column: number;
  message: string;
  explanation: string;
}

export interface SyntaxValidationResult {
  isValid: boolean;
  errors: SyntaxError[];
}

class JavaSyntaxChecker {
  validateSyntax(code: string): SyntaxValidationResult {
    const errors: SyntaxError[] = [];
    const lines = code.split("\n");

    // Check if code is empty
    if (!code || code.trim().length === 0) {
      errors.push({
        line: 1,
        column: 1,
        message: "Empty code",
        explanation: "Please enter some Java code to compile.",
      });
      return { isValid: false, errors };
    }

    // Check for basic Java structure
    if (!code.includes("class")) {
      errors.push({
        line: 1,
        column: 1,
        message: "Missing class declaration",
        explanation: "Java code must contain at least one class declaration.",
      });
    }

    // Check for any class declaration (removed specific Roboter requirement)
    if (!code.includes("class ") && !code.includes("public class ")) {
      errors.push({
        line: 1,
        column: 1,
        message: "Missing class declaration",
        explanation:
          "Java code must contain at least one class declaration. Use 'public class YourClassName { ... }'",
      });
    }

    // Check for main method
    if (
      !code.includes("public static void main") &&
      !code.includes("static void main")
    ) {
      errors.push({
        line: 1,
        column: 1,
        message: "Missing main method",
        explanation:
          "Java programs need a main method to run. Add 'public static void main(String[] args) { ... }'",
      });
    }

    // Check for balanced braces
    const braceCount =
      (code.match(/{/g) || []).length - (code.match(/}/g) || []).length;
    if (braceCount !== 0) {
      errors.push({
        line: 1,
        column: 1,
        message: `Unbalanced braces (${Math.abs(braceCount)} ${
          braceCount > 0 ? "opening" : "closing"
        } brace${Math.abs(braceCount) > 1 ? "s" : ""} missing)`,
        explanation:
          "Check that all opening braces '{' have corresponding closing braces '}'.",
      });
    }

    // Check for balanced parentheses
    const parenCount =
      (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
    if (parenCount !== 0) {
      errors.push({
        line: 1,
        column: 1,
        message: `Unbalanced parentheses (${Math.abs(parenCount)} ${
          parenCount > 0 ? "opening" : "closing"
        } parenthesis${Math.abs(parenCount) > 1 ? "es" : ""} missing)`,
        explanation:
          "Check that all opening parentheses '(' have corresponding closing parentheses ')'.",
      });
    }

    // Check for balanced brackets
    const bracketCount =
      (code.match(/\[/g) || []).length - (code.match(/\]/g) || []).length;
    if (bracketCount !== 0) {
      errors.push({
        line: 1,
        column: 1,
        message: `Unbalanced brackets (${Math.abs(bracketCount)} ${
          bracketCount > 0 ? "opening" : "closing"
        } bracket${Math.abs(bracketCount) > 1 ? "s" : ""} missing)`,
        explanation:
          "Check that all opening brackets '[' have corresponding closing brackets ']'.",
      });
    }

    // Check each line for syntax errors
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (
        !trimmedLine ||
        trimmedLine.startsWith("//") ||
        trimmedLine.startsWith("/*") ||
        trimmedLine.startsWith("*")
      ) {
        continue;
      }

      // Check for missing semicolons
      if (
        trimmedLine &&
        !trimmedLine.startsWith("//") &&
        !trimmedLine.startsWith("/*") &&
        !trimmedLine.startsWith("*") &&
        !trimmedLine.endsWith("{") &&
        !trimmedLine.endsWith("}") &&
        !trimmedLine.endsWith(";") &&
        !trimmedLine.includes("class ") &&
        !trimmedLine.includes("public ") &&
        !trimmedLine.includes("private ") &&
        !trimmedLine.includes("protected ") &&
        !trimmedLine.includes("static ") &&
        !trimmedLine.includes("import ") &&
        !trimmedLine.includes("package ") &&
        !trimmedLine.includes("if ") &&
        !trimmedLine.includes("else") &&
        !trimmedLine.includes("for ") &&
        !trimmedLine.includes("while ") &&
        !trimmedLine.includes("do ") &&
        !trimmedLine.includes("switch ") &&
        !trimmedLine.includes("try ") &&
        !trimmedLine.includes("catch ") &&
        !trimmedLine.includes("finally") &&
        !trimmedLine.includes("case ") &&
        !trimmedLine.includes("default:") &&
        !trimmedLine.includes("break") &&
        !trimmedLine.includes("continue") &&
        !trimmedLine.includes("return") &&
        !trimmedLine.includes("throw") &&
        !trimmedLine.includes("synchronized") &&
        !trimmedLine.includes("volatile") &&
        !trimmedLine.includes("transient") &&
        !trimmedLine.includes("native") &&
        !trimmedLine.includes("abstract") &&
        !trimmedLine.includes("final") &&
        !trimmedLine.includes("interface ") &&
        !trimmedLine.includes("enum ") &&
        !trimmedLine.includes("extends ") &&
        !trimmedLine.includes("implements ") &&
        !trimmedLine.includes("throws ") &&
        !trimmedLine.includes("@") &&
        trimmedLine.length > 0
      ) {
        // Check if it looks like a statement that should end with semicolon
        if (
          trimmedLine.includes("System.out.print") ||
          trimmedLine.includes("=") ||
          trimmedLine.includes("return") ||
          trimmedLine.match(/^\s*\w+\s+\w+/) || // Variable declarations
          trimmedLine.includes("++") ||
          trimmedLine.includes("--") ||
          (trimmedLine.includes("(") &&
            trimmedLine.includes(")") &&
            !trimmedLine.includes("{")) // Method calls
        ) {
          errors.push({
            line: lineNumber,
            column: line.length,
            message: "Missing semicolon",
            explanation:
              "This statement appears to be missing a semicolon ';' at the end.",
          });
        }
      }

      // Check for invalid println statements
      if (line.includes("System.out.println") && !line.includes("(")) {
        errors.push({
          line: lineNumber,
          column: line.indexOf("System.out.println"),
          message: "Invalid println statement",
          explanation:
            "System.out.println requires parentheses around the text to print.",
        });
      }

      // Check for incorrect main method signature
      if (
        line.includes("public static void main") &&
        !line.includes("String[] args")
      ) {
        errors.push({
          line: lineNumber,
          column: line.indexOf("public static void main"),
          message: "Incorrect main method signature",
          explanation:
            "The main method must have the parameter 'String[] args'.",
        });
      }

      // Check for missing opening brace after class declaration
      if (line.includes("public class") && !line.includes("{")) {
        errors.push({
          line: lineNumber,
          column: line.length,
          message: "Missing opening brace after class declaration",
          explanation:
            "Class declarations must be followed by an opening brace '{'.",
        });
      }

      // Check for missing opening brace after method declaration
      if (line.includes("public static void main") && !line.includes("{")) {
        errors.push({
          line: lineNumber,
          column: line.length,
          message: "Missing opening brace after method declaration",
          explanation:
            "Method declarations must be followed by an opening brace '{'.",
        });
      }

      // Check for common keyword misspellings
      const words = trimmedLine.split(/\s+/);
      words.forEach((word) => {
        const cleanWord = word.replace(/[^\w]/g, "");
        if (cleanWord) {
          const misspellings: { [key: string]: string } = {
            clase: "class",
            publik: "public",
            statik: "static",
            voyd: "void",
            mian: "main",
            Sytem: "System",
            prntln: "println",
            prnt: "print",
            Strng: "String",
            strng: "String",
            nt: "int",
            dble: "double",
            flot: "float",
            bln: "boolean",
            chr: "char",
            byt: "byte",
            shrt: "short",
            lng: "long",
            retrn: "return",
            fnal: "final",
            abstrct: "abstract",
            nterface: "interface",
            extnds: "extends",
            mplments: "implements",
            thrws: "throws",
            try: "try",
            ctch: "catch",
            fnally: "finally",
            thrw: "throw",
            nw: "new",
            nll: "null",
            tr: "true",
            flse: "false",
            f: "if",
            els: "else",
            whle: "while",
            fr: "for",
            swtch: "switch",
            cse: "case",
            defalt: "default",
            brk: "break",
            cntnue: "continue",
          };

          if (misspellings[cleanWord.toLowerCase()]) {
            errors.push({
              line: lineNumber,
              column: line.indexOf(word),
              message: `Possible misspelling: '${cleanWord}'`,
              explanation: `Did you mean '${
                misspellings[cleanWord.toLowerCase()]
              }'? Check the spelling of Java keywords.`,
            });
          }
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Create and export a singleton instance
export const javaSyntaxChecker = new JavaSyntaxChecker();
