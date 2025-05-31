"use client";
import Image from "next/image";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

function Map() {
    const router = useRouter();
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const levels = [
        { id: 1, position: "top-[12%] left-[12%]", label: "Level 1" },
        { id: 2, position: "top-[12%] right-[12%]", label: "Level 2" },
        { id: 3, position: "bottom-[12%] left-[12%]", label: "" },
        { id: 4, position: "bottom-[12%] right-[12%]", label: "Level 3" },
    ];

    const handleLevelClick = (levelId: number) => {
        setSelectedLevel(levelId);
        setIsLoading(true);

        setTimeout(() => {
            router.push(`/level/${levelId}`);
        }, 1500);
    };

    return (
        <div className="relative w-full h-full md:min-h-[750px]">
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-metallic-dark/80 backdrop-blur-sm"
                    >
                        <div className="relative">
                            <motion.div
                                className="w-32 h-32 border-4 border-metallic-accent rounded-full"
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                            <motion.div
                                className="absolute inset-0 w-32 h-32 border-4 border-t-transparent border-metallic-light rounded-full"
                                animate={{
                                    rotate: -360,
                                    scale: [1.2, 1, 1.2],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                animate={{
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <span className="text-metallic-accent text-lg font-bold">
                                    Loading...
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                className="relative w-full md:h-full h-[350px]"
                animate={
                    selectedLevel
                        ? {
                              scale: [1, 2, 2.2],
                              transition: {
                                  duration: 1,
                                  times: [0, 0.8, 1],
                                  ease: "linear",
                              },
                          }
                        : {}
                }
            >
                {levels.map((level) => (
                    <React.Fragment key={level.id}>
                        <motion.div
                            className={`hover:bg-metallic-accent/40 blur-lg transition-all w-1/4 h-1/4 absolute ${level.position} rounded-full z-10`}
                            whileHover={{ scale: 1.1 }}
                            animate={
                                selectedLevel === level.id
                                    ? {
                                          scale: [1, 1.5, 1.7],
                                          transition: {
                                              duration: 1,
                                              times: [0, 0.8, 1],
                                              ease: "easeInOut",
                                          },
                                      }
                                    : {}
                            }
                        />
                        <motion.div
                            className={`transition-all w-1/4 h-1/4 absolute ${level.position} z-10 flex items-center justify-center cursor-pointer`}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleLevelClick(level.id)}
                            animate={
                                selectedLevel === level.id
                                    ? {
                                          scale: [1, 1.5, 1.7],
                                          transition: {
                                              duration: 1,
                                              times: [0, 0.8, 1],
                                              ease: "easeInOut",
                                          },
                                      }
                                    : {}
                            }
                        >
                            <span className="text-white text-xl font-bold">
                                {level.label}
                            </span>
                        </motion.div>
                    </React.Fragment>
                ))}
                <Image
                    src="/assets/images/map.png"
                    alt="Map background"
                    fill
                    className="opacity-70"
                />
            </motion.div>
            <motion.div
                className="fixed inset-0 pointer-events-none z-50"
                initial={{ opacity: 0 }}
                animate={
                    selectedLevel
                        ? {
                              opacity: [0, 0.5, 0.8],
                              background: [
                                  "radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)",
                                  "radial-gradient(circle at center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)",
                                  "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
                              ],
                              transition: {
                                  duration: 1,
                                  times: [0, 0.8, 1],
                                  ease: "linear",
                              },
                          }
                        : { opacity: 0 }
                }
            />
        </div>
    );
}

export default Map;
