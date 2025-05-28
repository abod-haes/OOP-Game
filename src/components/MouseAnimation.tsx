"use client";

import { useEffect, useState } from "react";

interface MousePosition {
    x: number;
    y: number;
}

export const MouseAnimation = () => {
    const [mousePosition, setMousePosition] = useState<MousePosition>({
        x: 0,
        y: 0,
    });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        let animationFrameId: number;
        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            targetX = e.clientX;
            targetY = e.clientY;
        };

        const handleMouseEnter = () => {
            setIsHovering(true);
        };

        const handleMouseLeave = () => {
            setIsHovering(false);
        };

        const animate = () => {
            // Linear interpolation for smooth movement
            currentX += (targetX - currentX) * 0.2;
            currentY += (targetY - currentY) * 0.2;

            setMousePosition({ x: currentX, y: currentY });
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener("mousemove", handleMouseMove);

        const interactiveElements = document.querySelectorAll(
            "button, a, [role='button']"
        );
        interactiveElements.forEach((element) => {
            element.addEventListener("mouseenter", handleMouseEnter);
            element.addEventListener("mouseleave", handleMouseLeave);
        });

        animate();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            interactiveElements.forEach((element) => {
                element.removeEventListener("mouseenter", handleMouseEnter);
                element.removeEventListener("mouseleave", handleMouseLeave);
            });
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div
            className="pointer-events-none fixed inset-0 z-[9999]"
            style={{
                opacity: 0.85,
            }}
        >
            {/* Outer glow */}
            <div
                className="absolute rounded-full"
                style={{
                    transform: `translate(${mousePosition.x - 30}px, ${
                        mousePosition.y - 30
                    }px)`,
                    width: "60px",
                    height: "60px",
                    background:
                        "radial-gradient(circle, rgba(0,122,204,0.2) 0%, rgba(0,122,204,0) 70%)",
                    filter: "blur(8px)",
                    transition: "transform 0.1s linear",
                }}
            />
            {/* Middle glow */}
            <div
                className="absolute rounded-full"
                style={{
                    transform: `translate(${mousePosition.x - 20}px, ${
                        mousePosition.y - 20
                    }px)`,
                    width: "40px",
                    height: "40px",
                    background:
                        "radial-gradient(circle, rgba(0,122,204,0.3) 0%, rgba(0,122,204,0) 70%)",
                    filter: "blur(40px)",
                    transition: "transform 0.1s linear",
                }}
            />
            {/* Main cursor */}
            {/* <div
                ref={cursorRef}
                className={`absolute rounded-full border-2 transition-all duration-200 ${
                    isHovering
                        ? "scale-150 border-purple-500 bg-purple-500/20"
                        : "scale-100 border-purple-400"
                }`}
                style={{
                    transform: `translate(${mousePosition.x - 15}px, ${
                        mousePosition.y - 15
                    }px)`,
                    width: "30px",
                    height: "30px",
                    boxShadow: isHovering
                        ? "0 0 20px rgba(147, 51, 234, 0.6), 0 0 40px rgba(147, 51, 234, 0.3)"
                        : "0 0 15px rgba(147, 51, 234, 0.4), 0 0 30px rgba(147, 51, 234, 0.2)",
                    transition: "transform 0.1s linear",
                }}
            /> */}
            {/* Inner glow */}
            <div
                className={`absolute rounded-full transition-all duration-200 blur-[30px] ${
                    isHovering
                        ? "scale-75 bg-metallic-accent"
                        : "scale-100 bg-metallic-light"
                }`}
                style={{
                    transform: `translate(${mousePosition.x - 5}px, ${
                        mousePosition.y - 5
                    }px)`,
                    width: "40px",
                    height: "40px",
                    transition: "transform 0.1s linear",
                }}
            />
        </div>
    );
};
