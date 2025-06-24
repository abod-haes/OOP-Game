"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { HoverButton } from "@/components/ui/hover-button";

interface RobotToastProps {
    isVisible: boolean;
    message: string;
    showStartButton?: boolean;
    showCloseButton?: boolean;
    onStart?: () => void;
    onHide?: () => void;
}

export function RobotToast({
    isVisible,
    message,
    showStartButton = false,
    showCloseButton = true,
    onStart,
    onHide,
}: RobotToastProps) {
    if (!message) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed top-4 right-4 transform  z-[80] max-w-md"
                >
                    <div className="bg-metallic-dark/95 backdrop-blur-sm border border-metallic-accent/30 rounded-lg shadow-lg p-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="flex-shrink-0 w-14 h-14"
                            >
                                <Image
                                    src="/assets/images/robot-head.png"
                                    alt="Robot icon"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                />
                            </motion.div>

                            <div className="flex-1">
                                <p className="text-metallic-light text-sm font-medium leading-relaxed">
                                    {message}
                                </p>

                                {showStartButton && onStart && (
                                    <div className="mt-3">
                                        <HoverButton
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onStart();
                                            }}
                                            className="text-xs px-3 py-1 h-auto"
                                        >
                                            Start Coding
                                        </HoverButton>
                                    </div>
                                )}
                            </div>

                            {showCloseButton && onHide && (
                                <button
                                    onClick={onHide}
                                    className="flex-shrink-0 text-metallic-light/60 hover:text-metallic-light transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
