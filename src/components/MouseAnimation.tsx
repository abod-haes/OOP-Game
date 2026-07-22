"use client";

import { useEffect, useRef, useState } from "react";

const FOLLOW_SPEED = 0.12;
const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [tabindex]:not([tabindex="-1"])';

export const MouseAnimation = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reducedMotion.matches) {
      document.body.classList.remove("custom-cursor-enabled");
      return;
    }

    setIsEnabled(true);
    document.body.classList.add("custom-cursor-enabled");

    let animationFrame = 0;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    const animate = () => {
      currentX += (targetX - currentX) * FOLLOW_SPEED;
      currentY += (targetY - currentY) * FOLLOW_SPEED;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      setIsVisible(true);

      const target = event.target as Element | null;
      setIsHovering(Boolean(target?.closest(INTERACTIVE_SELECTOR)));
    };

    const handlePointerDown = () => setIsClicking(true);
    const handlePointerUp = () => setIsClicking(false);
    const handlePointerLeave = () => setIsVisible(false);
    const handlePointerEnter = () => setIsVisible(true);

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    document.documentElement.addEventListener("pointerenter", handlePointerEnter);

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove("custom-cursor-enabled");
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      document.documentElement.removeEventListener("pointerenter", handlePointerEnter);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-150 ${
        isVisible ? "opacity-90" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <div ref={cursorRef} className="fixed left-0 top-0 will-change-transform">
        <div className={`custom-cursor ${isClicking ? "clicking" : ""}`} />

        <div
          className={`absolute -left-10 -top-10 h-20 w-20 rounded-full blur-xl transition-[background,transform] duration-200 ${
            isClicking ? "scale-75" : "scale-100"
          }`}
          style={{
            background: isHovering
              ? "radial-gradient(circle, rgba(202, 94, 21, 0.18) 0%, rgba(202, 94, 21, 0.08) 42%, transparent 72%)"
              : "radial-gradient(circle, rgba(187, 169, 142, 0.1) 0%, rgba(187, 169, 142, 0.04) 42%, transparent 72%)",
          }}
        />

        <div
          className={`absolute -left-3 -top-3 h-6 w-6 rounded-full border-2 transition-all duration-150 ${
            isHovering
              ? "scale-125 border-metallic-accent bg-metallic-accent/25"
              : "scale-100 border-metallic-light bg-metallic-light/10"
          } ${isClicking ? "!scale-75" : ""}`}
          style={{
            boxShadow: isHovering
              ? "0 0 22px rgba(202, 94, 21, 0.65)"
              : "0 0 14px rgba(187, 169, 142, 0.45)",
          }}
        />

        <div
          className={`absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full transition-transform duration-150 ${
            isClicking ? "scale-50" : "scale-100"
          }`}
          style={{
            background: isHovering
              ? "radial-gradient(circle, rgba(202, 94, 21, 0.95), transparent 72%)"
              : "radial-gradient(circle, rgba(255, 255, 255, 0.75), transparent 72%)",
          }}
        />
      </div>
    </div>
  );
};
