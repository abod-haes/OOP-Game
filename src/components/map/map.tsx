"use client";
import Image from "next/image";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Loader from "../ui/loader";
import { sessionUtils } from "@/lib/api/client";

function Map() {
    const router = useRouter();
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLevelClick = (levelId: number) => {
        // Check if user is authenticated
        if (!sessionUtils.isAuthenticated()) {
            // If not authenticated, redirect to login page
            router.push('/sign-in');
            return;
        }

        // If authenticated, proceed with level selection
        setSelectedLevel(levelId);
        setIsLoading(true);

        setTimeout(() => {
            router.push(`/2/${levelId}`);
        }, 1500);
    };
    const mapLevels = [
        {
            id: 0.3,
            image: "/assets/images/map-1.png",
        },
        {
            id: 1.3,
            image: "/assets/images/map-2.png",
        },
        {
            id: 3,
            image: "/assets/images/map-3.png",
        },
        {
            id: 4,
            image: "/assets/images/map-4.png",
        },
    ];
    return (
        <div className="relative w-full h-full md:min-h-[60vh] min-h-[40vh]">
            <AnimatePresence>
                {isLoading && (
                  <Loader />
                )}
            </AnimatePresence>
            <motion.div
                className="relative w-full max-w-[1250px] mx-auto h-full flex justify-center"
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
                <Image
                    src="/assets/images/map-main.png"
                    alt="Map background"
                    fill
                    className="z-10 w-full mx-auto"
                />
                {mapLevels.map((e) => (
                    <div
                        key={e.id}
                        style={{ left: `${e.id * 20}%` }}
                        className="group absolute top-[-8%] left-0 w-[14%] h-[70%] cursor-pointer"
                        onClick={() => handleLevelClick(Math.floor(e.id))}
                    >
                        <Image
                            src={e.image}
                            alt="Map background"
                            fill
                            className="!w-full mx-auto group-hover:-translate-y-8 transition-all duration-300"
                        />
                        <div className="absolute top-0 w-full h-[100%] z-20 bg-transparent  transition-all" />
                    </div>
                ))}
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
