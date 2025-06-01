"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

interface LargeRobotMessageProps {
    message: string;
    duration?: number; // Duration in milliseconds to display the message
}

export function LargeRobotMessage({
    message,
    duration = 5000,
}: LargeRobotMessageProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] flex items-end justify-end p-8 bg-metallic-dark/90 backdrop-blur-sm gap-10"
                >
                    {/* Container for robot and message */}
                    <div className="flex items-start gap-0">
                        {/* Message Box (positioned left of robot) */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="bg-metallic-accent/20 p-4 pb-16 rounded-lg text-left max-w-xs border border-metallic-accent/30 shadow-lg"
                            style={{
                                clipPath:
                                    "polygon(0% 0%, 100% 0, 100% 75%, 100% 75%, 100% 100%, 72% 75%, 0% 75%)",
                                borderRadius: "10px",
                            }}
                        >
                            <p className="text-metallic-light text-lg font-semibold">
                                {message}
                            </p>
                        </motion.div>

                        {/* Robot Image (positioned right) */}
                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="relative w-40 h-40 md:w-[400px] md:h-[400px]"
                        >
                            <Image
                                src="/assets/images/robot.png"
                                alt="Large robot avatar"
                                layout="fill"
                                objectFit="contain"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
