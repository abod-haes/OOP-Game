"use client";

import React, { useEffect, useState } from "react";
import { Code2 } from "lucide-react";
import { HoverButton } from "./hover-button";
import { useRouter, usePathname } from "next/navigation";
import { routeName } from "@/app/_route-name";
import Link from "next/link";

export function Header() {
    const route = useRouter();
    const pathname = usePathname();
    console.log(pathname.includes("/level"));
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (path: string) => {
        return pathname === path;
    };
    if (pathname.includes("/level")) return null;
    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
                isScrolled
                    ? "bg-metallic-light/5 backdrop-blur-sm border-b border-white/10"
                    : "border-transparent"
            }`}
        >
            <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Code2 className="h-8 w-8 text-metallic-accent" />
                        <span className="md:text-xl text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-metallic-accent to-metallic-light">
                            OOP Playground
                        </span>
                    </div>

                    {/* Navigation and Auth */}
                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                href={routeName.home}
                                className={`transition-colors ${
                                    isActive(routeName.home)
                                        ? "text-metallic-accent"
                                        : "text-metallic-light/60 hover:text-metallic-light"
                                }`}
                            >
                                Home
                            </Link>
                            <Link
                                href={routeName.learn}
                                className={`transition-colors ${
                                    isActive(routeName.learn)
                                        ? "text-metallic-accent"
                                        : "text-metallic-light/60 hover:text-metallic-light"
                                }`}
                            >
                                Learn
                            </Link>
                            <Link
                                href={routeName.challenges}
                                className={`transition-colors ${
                                    isActive(routeName.challenges)
                                        ? "text-metallic-accent"
                                        : "text-metallic-light/60 hover:text-metallic-light"
                                }`}
                            >
                                Challenges
                            </Link>

                            <Link
                                href={routeName.about}
                                className={`transition-colors ${
                                    isActive(routeName.about)
                                        ? "text-metallic-accent"
                                        : "text-metallic-light/60 hover:text-metallic-light"
                                }`}
                            >
                                About
                            </Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <HoverButton
                                onClick={() => route.push(routeName.signIn)}
                                className="text-sm px-4 py-2"
                            >
                                Sign In
                            </HoverButton>
                            <HoverButton
                                onClick={() => route.push(routeName.signUp)}
                                className="text-sm px-4 py-2 bg-metallic-accent/20 hover:bg-metallic-accent/30"
                            >
                                Sign Up
                            </HoverButton>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
