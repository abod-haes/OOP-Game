"use client";

import { useEffect, useState, useRef } from "react";
import {
    AlertTriangle,
    ArrowRight,
    Play,
    Zap,
    Volume2,
    VolumeX,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LargeRobotMessage } from "@/components/large-robot-message";
import { HoverButton } from "@/components/ui/hover-button";
import JavaEditor from "@/components/java-editor/JavaEditor";
import { motion } from "framer-motion";

export default function LabGamePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showLights, setShowLights] = useState(false);
    const [fadeOutLights, setFadeOutLights] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Enable audio on first user interaction
    useEffect(() => {
        const enableAudio = () => {
            if (!hasUserInteracted) {
                setHasUserInteracted(true);
                setAudioEnabled(true);
            }
        };

        document.addEventListener("click", enableAudio, { once: true });
        document.addEventListener("keydown", enableAudio, { once: true });
        document.addEventListener("touchstart", enableAudio, { once: true });

        return () => {
            document.removeEventListener("click", enableAudio);
            document.removeEventListener("keydown", enableAudio);
            document.removeEventListener("touchstart", enableAudio);
        };
    }, [hasUserInteracted]);

    useEffect(() => {
        if (success && audioEnabled && hasUserInteracted) {
            const powerOnAudio = new Audio("/assets/audio/power-on.mp3");
            powerOnAudio.volume = 0.5;
            powerOnAudio.play().catch((err) => {
                console.error("Power-on audio playback failed:", err);
            });
        }
    }, [success, audioEnabled, hasUserInteracted]);

    useEffect(() => {
        setMounted(true);
    }, []);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!mounted || !audioEnabled || !hasUserInteracted) return;

        if (!success) {
            // If audioRef already has audio, pause & cleanup before new audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.onended = null;
            }

            const errorAudio = new Audio("/assets/audio/error-robot.mp3");
            errorAudio.volume = 0.5;
            audioRef.current = errorAudio;

            const playWithDelay = () => {
                if (!audioRef.current || success || !audioEnabled) return;

                audioRef.current.play().catch((error) => {
                    console.log("Audio playback failed:", error);
                });

                audioRef.current.onended = () => {
                    timeoutIdRef.current = setTimeout(() => {
                        if (!success && audioRef.current && audioEnabled) {
                            playWithDelay();
                        }
                    }, 1000);
                };
            };

            playWithDelay();
        } else {
            // Success is true, stop and cleanup
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.onended = null;
                audioRef.current = null;
            }

            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null;
            }
        }

        // Cleanup on unmount or dependencies change
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.onended = null;
                audioRef.current = null;
            }
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null;
            }
        };
    }, [mounted, success, audioEnabled, hasUserInteracted]);

    const toggleAudio = () => {
        setAudioEnabled(!audioEnabled);
        if (!audioEnabled && !hasUserInteracted) {
            setHasUserInteracted(true);
        }
    };

    return (
        mounted && (
            <div className="relative min-h-screen overflow-hidden">
                {/* Audio Toggle Button */}
                <button
                    onClick={toggleAudio}
                    className="fixed top-4 right-4 z-50 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 transition-all duration-200"
                    title={audioEnabled ? "Disable Audio" : "Enable Audio"}
                >
                    {audioEnabled ? (
                        <Volume2 className="w-5 h-5" />
                    ) : (
                        <VolumeX className="w-5 h-5" />
                    )}
                </button>

                {/* Background Layer */}
                <>
                    {!success && (
                        <motion.div
                            className="absolute top-0 left-0 w-full h-full z-10 bg-red-600 opacity-0 pointer-events-none"
                            animate={{ opacity: [0.06, 0.15, 0.06] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        />
                    )}

                    {success && (
                        <>
                            {showLights && (
                                <>
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1 h-screen bg-gradient-to-b from-yellow-300 to-transparent opacity-60 rounded-full"
                                            style={{
                                                left: `${i * 12.5}%`,
                                                zIndex: 30,
                                            }}
                                            animate={{
                                                scaleY: [1, 1.5, 1],
                                                opacity: fadeOutLights
                                                    ? 0
                                                    : [0.2, 0.4, 0],
                                            }}
                                            transition={{
                                                repeat: fadeOutLights
                                                    ? 0
                                                    : Infinity,
                                                duration: 1.5 + i * 0.2,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    ))}

                                    <motion.div
                                        className="absolute inset-0 bg-yellow-400 mix-blend-screen opacity-0 z-20"
                                        animate={{
                                            opacity: fadeOutLights
                                                ? 0
                                                : [0.1, 0.2, 0],
                                        }}
                                        transition={{
                                            repeat: fadeOutLights
                                                ? 0
                                                : Infinity,
                                            duration: 2,
                                        }}
                                    />
                                </>
                            )}
                        </>
                    )}
                </>

                {/* Backgrounds */}
                <div className="absolute inset-0 z-[2]">
                    <div
                        className="absolute inset-0 bg-cover bg-no-repeat"
                        style={{
                            backgroundImage: "url('/assets/images/AA.jpg')",
                            backgroundPosition: "center top",
                        }}
                    >
                        <div className="absolute inset-0 bg-black/40" />
                    </div>

                    <motion.div
                        className="absolute inset-0 bg-cover bg-no-repeat"
                        style={{
                            backgroundImage: "url('/assets/images/A.jpg')",
                            backgroundPosition: "center top",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: success ? 1 : 0 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="absolute inset-0 bg-black/40" />
                    </motion.div>
                </div>

                {/* Main Content */}
                {!success ? (
                    <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
                        <div className="text-center mb-8 animate-fade-in">
                            <div className="flex items-center justify-center mb-4">
                                <AlertTriangle className="w-16 h-16 text-red-500 animate-bounce" />
                                <Zap className="w-12 h-12 text-yellow-400 animate-pulse ml-2" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-glow">
                                System Failure Detected
                            </h1>
                            <p className="text-xl text-red-300 animate-pulse">
                                A critical error has occurred in the robotic
                                control logic. Immediate debugging is required.
                            </p>
                        </div>

                        <LargeRobotMessage message="Hello! It looks like there's a bug in the lab code. Can you help me fix it?" />

                        <div>
                            <Dialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            >
                                <DialogTrigger>
                                    <HoverButton className="flex items-center gap-1">
                                        <Play className="w-6 h-6 mr-2" />
                                        Start Coding
                                    </HoverButton>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold text-center text-white">
                                            Abstraction - Create the Roboter
                                            Class
                                        </DialogTitle>
                                    </DialogHeader>

                                    {/* Editor */}
                                    <div className="mt-4 flex-grow overflow-auto">
                                        <JavaEditor />
                                    </div>

                                    <HoverButton
                                        onClick={() => {
                                            setSuccess(true);
                                            setIsDialogOpen(false);
                                            setShowLights(true);
                                            setFadeOutLights(false);

                                            // Start fade out after 4s
                                            setTimeout(() => {
                                                setFadeOutLights(true);

                                                // Remove lights AFTER fade-out duration
                                                setTimeout(() => {
                                                    setShowLights(false);
                                                }, 1000); // Match this to opacity transition time
                                            }, 4000); // Show lights for 4 seconds
                                        }}
                                    >
                                        🚀 Run Code
                                    </HoverButton>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
                        <motion.div
                            className="text-white text-4xl md:text-6xl font-extrabold text-center max-w-4xl px-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: 0.5,
                                duration: 0.8,
                            }}
                        >
                            🎉 Mission Accomplished!
                            <br />
                            The robot has been repaired successfully.
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: 3.5,
                                duration: 0.8,
                            }}
                            className="w-full mt-6 flex justify-center"
                        >
                            <HoverButton className="text-lg flex gap-2 items-center justify-center w-1/2 mx-auto">
                                Next Step <ArrowRight className="w-5 h-5" />
                            </HoverButton>
                        </motion.div>
                    </div>
                )}
            </div>
        )
    );
}
