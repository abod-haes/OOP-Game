"use client";
import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import "./java-editor.css";

interface JavaEditorProps {
    initialValue?: string;
    readOnly?: boolean;
    onChange?: (value: string | undefined) => void;
    height?: string | number;
    width?: string | number;
    theme?: string;
    fontSize?: number;
    showMinimap?: boolean;
    defaultCode?: string;
}

const DEFAULT_CODE = "";

const JavaEditor: React.FC<JavaEditorProps> = ({
    initialValue,
    readOnly = false,
    onChange,
    height = "500px",
    width = "100%",
    theme = "vs-dark",
    fontSize = 14,
    showMinimap = true,
    defaultCode = DEFAULT_CODE,
}) => {
    const [displayedCode, setDisplayedCode] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const editorRef = useRef<HTMLDivElement>(null);

    // Process the code to replace \n with actual newlines
    const processCode = (code: string) => {
        return code.replace(/\\n/g, "\n");
    };

    // Use initialValue if provided, otherwise use defaultCode
    const codeToDisplay = processCode(initialValue || defaultCode);

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

    return (
        <div className="flex w-full flex-col gap-4 px-4">
            <div
                ref={editorRef}
                className="java-editor-container"
                style={{
                    height,
                    width,
                    background: "transparent",
                }}
            >
                <Editor
                    height="100%"
                    defaultLanguage="java"
                    value={isTyping ? displayedCode : codeToDisplay}
                    theme={theme}
                    onChange={onChange}
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
                    }}
                />
            </div>
        </div>
    );
};

export default JavaEditor;
