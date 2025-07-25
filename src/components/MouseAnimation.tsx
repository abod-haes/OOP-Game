"use client";

import { useEffect, useState, useRef, useCallback } from "react";

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
  const [isClicking, setIsClicking] = useState(false);

  // Performance optimizations
  const animationFrameIdRef = useRef<number>();
  const lastMouseMoveRef = useRef<number>(0);
  const throttleDelay = 16; // ~60fps

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    if (now - lastMouseMoveRef.current < throttleDelay) return;
    lastMouseMoveRef.current = now;

    // Check if we're hovering over an interactive element
    const target = e.target as HTMLElement;
    const isInteractive =
      target.matches('button, a, [role="button"], input, textarea') ||
      target.closest('button, a, [role="button"], input, textarea');

    setIsHovering(!!isInteractive);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsClicking(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsClicking(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  useEffect(() => {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const animate = () => {
      // Linear interpolation for smooth movement
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      setMousePosition({ x: currentX, y: currentY });
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    // Throttled mouse move handler
    const throttledMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      handleMouseMove(e);
    };

    // Use document-level event delegation with throttling
    document.addEventListener("mousemove", throttledMouseMove, {
      passive: true,
    });
    document.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, {
      passive: true,
    });

    animate();

    return () => {
      document.removeEventListener("mousemove", throttledMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] opacity-90">
      {/* Custom cursor image */}
      <div
        className={`custom-cursor ${isClicking ? "clicking" : ""}`}
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      />

      {/* Outer robot glow - Large halo */}
      <div
        className={`absolute rounded-full transition-all duration-300 ease-out ${
          isClicking ? "scale-75" : "scale-100"
        }`}
        style={{
          transform: `translate(${mousePosition.x - 40}px, ${
            mousePosition.y - 40
          }px) ${isClicking ? "scale(0.8)" : "scale(1)"}`,
          width: "80px",
          height: "80px",
          background: isHovering
            ? "radial-gradient(circle, rgba(202, 94, 21, 0.15) 0%, rgba(202, 94, 21, 0.08) 40%, transparent 70%)"
            : "radial-gradient(circle, rgba(187, 169, 142, 0.08) 0%, rgba(187, 169, 142, 0.03) 40%, transparent 70%)",
          filter: "blur(12px)",
        }}
      />

      {/* Middle glow - Tech ring */}
      <div
        className={`absolute rounded-full transition-all duration-300 ease-out ${
          isClicking ? "scale-75" : "scale-100"
        }`}
        style={{
          transform: `translate(${mousePosition.x - 25}px, ${
            mousePosition.y - 25
          }px) ${isClicking ? "scale(0.7)" : "scale(1)"}`,
          width: "50px",
          height: "50px",
          background: isHovering
            ? "radial-gradient(circle, rgba(202, 94, 21, 0.25) 0%, rgba(202, 94, 21, 0.15) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(187, 169, 142, 0.15) 0%, rgba(187, 169, 142, 0.08) 50%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Robot core - Main cursor */}
      <div
        className={`absolute rounded-full border-2 transition-all duration-300 ease-out ${
          isHovering
            ? "border-metallic-accent bg-metallic-accent/25 scale-125"
            : "border-metallic-light bg-metallic-light/10 scale-100"
        } ${isClicking ? "scale-75" : ""}`}
        style={{
          transform: `translate(${mousePosition.x - 12}px, ${
            mousePosition.y - 12
          }px)`,
          width: "24px",
          height: "24px",
          boxShadow: isHovering
            ? "0 0 25px rgba(202, 94, 21, 0.7), 0 0 50px rgba(202, 94, 21, 0.4), inset 0 0 15px rgba(202, 94, 21, 0.3)"
            : "0 0 15px rgba(187, 169, 142, 0.5), 0 0 30px rgba(187, 169, 142, 0.2), inset 0 0 8px rgba(187, 169, 142, 0.1)",
        }}
      />

      {/* Inner tech glow */}
      <div
        className={`absolute rounded-full transition-all duration-300 ease-out ${
          isClicking ? "scale-50" : "scale-100"
        }`}
        style={{
          transform: `translate(${mousePosition.x - 6}px, ${
            mousePosition.y - 6
          }px)`,
          width: "12px",
          height: "12px",
          background: isHovering
            ? "radial-gradient(circle, rgba(202, 94, 21, 0.9) 0%, rgba(202, 94, 21, 0.5) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(187, 169, 142, 0.3) 50%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />

      {/* Robot scanning lines - Only when hovering */}
      {isHovering && (
        <>
          <div
            className="absolute animate-pulse"
            style={{
              transform: `translate(${mousePosition.x - 30}px, ${
                mousePosition.y - 1
              }px)`,
              width: "60px",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent 0%, rgb(202, 94, 21) 50%, transparent 100%)",
            }}
          />
          <div
            className="absolute animate-pulse"
            style={{
              transform: `translate(${mousePosition.x - 1}px, ${
                mousePosition.y - 30
              }px)`,
              width: "2px",
              height: "60px",
              background:
                "linear-gradient(180deg, transparent 0%, rgb(202, 94, 21) 50%, transparent 100%)",
              animationDelay: "0.5s",
            }}
          />
        </>
      )}
    </div>
  );
};
