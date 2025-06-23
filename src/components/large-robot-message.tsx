import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LargeRobotMessageOverlayProps {
    message: string;
    showStartButton?: boolean;
    onStart?: () => void;
    // Remove onClick because we don’t want to close by clicking overlay
}

export function LargeRobotMessageOverlay({
    message,
    showStartButton = false,
    onStart,
}: LargeRobotMessageOverlayProps) {
    if (!message) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-end pb-20 justify-end p-8 bg-metallic-dark/90 backdrop-blur-sm gap-10 cursor-default"
            >
                <div className="flex items-start gap-0 max-lg:flex-col">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="bg-metallic-accent/20 p-4 rounded-lg text-left max-w-xs border border-metallic-accent/30 shadow-lg"
                    >
                        <p className="text-metallic-light text-lg font-semibold">
                            {message}
                        </p>

                        {/* Render Start Button only on last message */}
                        {showStartButton && onStart && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onStart();
                                }}
                                className="mt-4 px-4 py-2 bg-metallic-accent text-metallic-dark rounded hover:bg-metallic-accent/80 transition"
                            >
                                Start Level
                            </button>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="relative w-[200px] h-[200px] md:w-[400px] md:h-[400px]"
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
        </AnimatePresence>
    );
}
