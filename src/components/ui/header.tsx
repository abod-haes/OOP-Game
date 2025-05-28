"use client";

import React from "react";
import { Code2 } from "lucide-react";
import { HoverButton } from "./hover-button";

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Name */}
                    <div className="flex items-center gap-2">
                        <Code2 className="h-8 w-8 text-metallic-accent" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-metallic-accent to-metallic-light">
                            OOP Playground
                        </span>
                    </div>

                    {/* Navigation and Auth */}
                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-6">
                            <a
                                href="#"
                                className="text-metallic-light/60 hover:text-metallic-light transition-colors"
                            >
                                Learn
                            </a>
                            <a
                                href="#"
                                className="text-metallic-light/60 hover:text-metallic-light transition-colors"
                            >
                                Challenges
                            </a>
                            <a
                                href="#"
                                className="text-metallic-light/60 hover:text-metallic-light transition-colors"
                            >
                                Community
                            </a>
                            <a
                                href="#"
                                className="text-metallic-light/60 hover:text-metallic-light transition-colors"
                            >
                                About
                            </a>
                        </nav>
                        <div className="flex items-center gap-4">
                            <HoverButton className="text-sm px-4 py-2">
                                Sign In
                            </HoverButton>
                            <HoverButton className="text-sm px-4 py-2 bg-metallic-accent/20 hover:bg-metallic-accent/30">
                                Sign Up
                            </HoverButton>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
