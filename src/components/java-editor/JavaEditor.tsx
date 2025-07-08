"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import "./java-editor.css";
import { javaSyntaxChecker, SyntaxValidationResult } from "@/lib/javaSyntaxChecker";

interface JavaEditorProps {
    initialValue?: string;
    readOnly?: boolean;
    onChange?: (value: string | undefined) => void;
    theme?: string;
    fontSize?: number;
    showMinimap?: boolean;
    defaultCode?: string;
    enableSyntaxCheck?: boolean;
    showToastErrors?: boolean;
    showErrorsAfterRun?: boolean;
}

const DEFAULT_CODE = "";

const JavaEditor: React.FC<JavaEditorProps> = ({
    initialValue,
    readOnly = false,
    onChange,
    theme = "vs-dark",
    fontSize = 14,
    showMinimap = true,
    defaultCode = DEFAULT_CODE,
    enableSyntaxCheck = true,
}) => {
    const [displayedCode, setDisplayedCode] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [syntaxValidation, setSyntaxValidation] = useState<SyntaxValidationResult | null>(null);
    const [showErrors, setShowErrors] = useState(false);
    const [currentCode, setCurrentCode] = useState("");
    const editorRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Process the code to replace \n with actual newlines
    const processCode = (code: string) => {
        return code.replace(/\\n/g, "\n");
    };

    // Use initialValue if provided, otherwise use defaultCode
    const codeToDisplay = processCode(initialValue || defaultCode);

    // Function to check syntax and show results
    const checkSyntaxAndShowResults = useCallback((code: string) => {
        if (!enableSyntaxCheck) {
            return;
        }

        if (!code.trim()) {
            setSyntaxValidation({
                isValid: false,
                errors: [{
                    line: 1,
                    column: 1,
                    message: "No code entered",
                    explanation: "Please enter some Java code to check syntax."
                }]
            });
            setShowErrors(true);
            return;
        }

        const validation = javaSyntaxChecker.validateSyntax(code);
        setSyntaxValidation(validation);
        setShowErrors(true);

        // Log syntax errors to console
        if (!validation.isValid) {
            console.group("🔍 Java Syntax Check Results");
            console.log("❌ Syntax errors found:");
            validation.errors.forEach((error, index) => {
                console.log(`%cLine ${error.line}: ${error.message}`, 'color: #ff6b6b; font-weight: bold;');
                console.log(`%c   Explanation: ${error.explanation}`, 'color: #ffa500;');
                if (index < validation.errors.length - 1) {
                    console.log('---');
                }
            });
            console.groupEnd();
        } else {
            console.log("✅ Java syntax is valid!");
        }
    }, [enableSyntaxCheck]);

    // Handle editor change
    const handleEditorChange = useCallback((value: string | undefined) => {
        const newValue = value || "";
        setCurrentCode(newValue);
        
        if (onChange) {
            onChange(value);
        }
    }, [onChange]);

    // Reset typing state when code changes
    useEffect(() => {
        setDisplayedCode("");
        setCurrentIndex(0);
        setIsTyping(false);
    }, [codeToDisplay]);

    // Intersection Observer setup
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsTyping(true);
                        observer.disconnect(); // Stop observing once animation starts
                    }
                });
            },
            {
                threshold: 0.1, // Start animation when 10% of the editor is visible
                rootMargin: "50px", // Start slightly before the element comes into view
            }
        );

        if (editorRef.current) {
            observer.observe(editorRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Typewriter effect
    useEffect(() => {
        if (!isTyping) return;

        const timeout = setTimeout(() => {
            if (currentIndex < codeToDisplay.length) {
                setDisplayedCode((prev) => prev + codeToDisplay[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            } else {
                setIsTyping(false);
            }
        }, 30);

        return () => clearTimeout(timeout);
    }, [currentIndex, codeToDisplay, isTyping]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    // Function to trigger error checking from parent
    const triggerErrorCheck = useCallback(() => {
        checkSyntaxAndShowResults(currentCode);
    }, [currentCode, checkSyntaxAndShowResults]);

    // Expose trigger function to parent
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).triggerJavaErrorCheck = triggerErrorCheck;
        }
    }, [triggerErrorCheck]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Editor Column */}
            <div className="flex flex-col h-full">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">📝 Java Code Editor</h3>
                    <p className="text-sm text-gray-300">Write your Roboter class here</p>
                </div>
                
                <div
                    ref={editorRef}
                    className="java-editor-container flex-1"
                    style={{
                        height: "100%",
                        width: "100%",
                        background: "transparent",
                    }}
                >
                    <Editor
                        height="100%"
                        defaultLanguage="java"
                        value={isTyping ? displayedCode : codeToDisplay}
                        theme={theme}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: showMinimap },
                            fontSize,
                            wordWrap: "on",
                            automaticLayout: true,
                            tabSize: 4,
                            padding: { top: 20, bottom: 20 },
                            scrollBeyondLastLine: false,
                            formatOnPaste: true,
                            formatOnType: true,
                            glyphMargin: true,
                            readOnly,
                            // Enhanced syntax error detection
                            showUnused: true,
                            showDeprecated: true,
                            bracketPairColorization: {
                                enabled: true,
                            },
                            quickSuggestions: true,
                            suggestOnTriggerCharacters: true,
                            acceptSuggestionOnEnter: "on",
                            acceptSuggestionOnCommitCharacter: true,
                            snippetSuggestions: "top",
                            wordBasedSuggestions: "matchingDocuments",
                            // Better error display
                            hover: {
                                enabled: true,
                                delay: 100,
                            },
                            // Syntax error highlighting
                            renderValidationDecorations: "on",
                            renderWhitespace: "selection",
                        }}
                    />
                </div>
            </div>

            {/* Syntax Analysis Column */}
            <div className="flex flex-col h-full">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">🔍 Syntax Analysis</h3>
                    <p className="text-sm text-gray-300">Real-time syntax checking and validation</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Show syntax validation status when triggered */}
                    {showErrors && syntaxValidation ? (
                        syntaxValidation.isValid ? (
                            <div className="syntax-success mb-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <span className="text-2xl">✅</span>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
                                                Syntax is Valid!
                                            </h4>
                                            <p className="text-sm text-green-600 dark:text-green-300">
                                                Your Java code is ready to compile and run.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="syntax-errors mb-4">
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <span className="text-2xl">❌</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">
                                                Syntax Errors Found ({syntaxValidation.errors.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {syntaxValidation.errors.map((error, index) => (
                                                    <div key={index} className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-red-200 dark:border-red-700">
                                                        <div className="flex items-start gap-2 mb-2">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                                                Line {error.line}
                                                            </span>
                                                            <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                                                Error:
                                                            </span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <code className="text-sm bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-red-800 dark:text-red-200">
                                                                {error.message}
                                                            </code>
                                                        </div>
                                                        {error.explanation && (
                                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                                                                <div className="flex items-start gap-2">
                                                                    <span className="text-blue-600 dark:text-blue-400 text-sm">💡</span>
                                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                        <strong>Hint:</strong> {error.explanation}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-yellow-600 dark:text-yellow-400 text-sm">🔧</span>
                                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                        Fix these syntax errors before compiling. Check the browser console for detailed information.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                                    <span className="text-2xl">📝</span>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        Ready to Code
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Start typing your Java code. Click &quot;Run Code&quot; to check syntax.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JavaEditor;
