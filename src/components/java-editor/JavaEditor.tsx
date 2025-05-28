"use client";
import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import "./java-editor.css";

interface JavaEditorProps {
    initialValue?: string;
    onChange?: (value: string | undefined) => void;
}

const defaultCode =
    'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}';

const JavaEditor: React.FC<JavaEditorProps> = ({
    initialValue = defaultCode,
    onChange,
}) => {
    const [displayedCode, setDisplayedCode] = useState("");
    const [isTyping] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const editorRef = useRef<HTMLDivElement>(null);

    // Intersection Observer setup
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // setIsTyping(true);
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
            if (currentIndex < initialValue.length) {
                setDisplayedCode((prev) => prev + initialValue[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            } else {
                // setIsTyping(false);
            }
        }, 30);

        return () => clearTimeout(timeout);
    }, [currentIndex, initialValue, isTyping]);

    return (
        <div className="flex w-full flex-col gap-4">
            <div
                ref={editorRef}
                className="java-editor-container"
                style={{
                    height: "500px",
                    width: "100%",
                    background: "transparent",
                }}
            >
                <Editor
                    height="100%"
                    defaultLanguage="java"
                    value={displayedCode}
                    theme="vs-dark"
                    onChange={onChange}
                    options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        wordWrap: "on",
                        automaticLayout: true,
                        tabSize: 4,
                        padding: { top: 20, bottom: 20 },
                        scrollBeyondLastLine: false,
                        formatOnPaste: true,
                        formatOnType: true,
                        glyphMargin: true,
                        readOnly: isTyping,
                    }}
                />
            </div>
        </div>
    );
};

export default JavaEditor;
