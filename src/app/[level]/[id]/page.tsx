"use client";

import { useEffect, useState, useRef } from "react";
import {
    AlertTriangle,
    ArrowRight,
    LogOutIcon,
    Play,
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
import { HoverButton } from "@/components/ui/hover-button";
import JavaEditor from "@/components/java-editor/JavaEditor";
import { motion } from "framer-motion";
import { useRobotMessages } from "@/app/hooks/useRobotMessages";
import { useRobotMessage } from "@/app/hooks/useRobotToast";
import { LargeRobotMessageOverlay } from "@/components/large-robot-message";
import Link from "next/link";
import { javaSyntaxChecker } from "@/lib/javaSyntaxChecker";

export default function LabGamePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showLights, setShowLights] = useState(false);
    const [fadeOutLights, setFadeOutLights] = useState(false);
    const [mounted, setMounted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(false);

    // NEW state to control robot overlay visibility manually
    const [robotVisible, setRobotVisible] = useState(false);

    // State for confirmation dialog
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Add state for code and compilation
    const [currentCode, setCurrentCode] = useState("");
    const [isCompiling, setIsCompiling] = useState(false);

    // Add the global robot toast hook
    const { showRobotPersistent, hideRobotMessage } = useRobotMessage();

    useEffect(() => {
        setMounted(true);
    }, []);

    const robotMessages = [
        "👋 Hello there! I'm your lab assistant robot.",
        "🛠️ It looks like there's a bug in my core control logic.",
        "⚠️ My behavior systems are malfunctioning due to a broken abstraction!",
        "💡 Can you jump into the Java editor and define a working `Roboter` class?",
        "🚀 Once fixed, hit 'Run Code' to bring me back online!",
    ];

    const { currentMessage, show, next } = useRobotMessages(
        robotMessages,
        10000
    );

    // On mount: show robot overlay and start message cycling
    useEffect(() => {
        setRobotVisible(true);
        show(); // kick off the message cycle
    }, [show]);

    useEffect(() => {
        if (success && audioEnabled) {
            const powerOnAudio = new Audio("/assets/audio/power-on.mp3");
            powerOnAudio.volume = 0.5;
            powerOnAudio.play().catch((err) => {
                console.error("Power-on audio playback failed:", err);
            });
        }
    }, [success, audioEnabled]);

    // Loop error sound if not successful
    useEffect(() => {
        if (!mounted || !audioEnabled) return;

        if (!success) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.onended = null;
            }

            const errorAudio = new Audio("/assets/audio/error-robot.mp3");
            errorAudio.volume = 0.5;
            audioRef.current = errorAudio;

            // Play sound once after 0.5s delay
            timeoutIdRef.current = setTimeout(() => {
                if (audioRef.current && !success && audioEnabled) {
                    audioRef.current.play().catch((error) => {
                        console.log("Audio playback failed:", error);
                    });
                }
            }, 500);
        } else {
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
    }, [mounted, success, audioEnabled]);

    const isLastMessage =
        robotMessages.indexOf(currentMessage) === robotMessages.length - 1;

            // Handle code changes from editor
        const handleCodeChange = (code: string | undefined) => {
            const newCode = code || "";
            setCurrentCode(newCode);
        };

        // Handle run code button click
    const handleRunCode = async () => {
        if (!currentCode.trim()) {
            console.log("❌ No code to compile");
            return;
        }

        // Always trigger error checking in the editor to show current syntax status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined' && (window as any).triggerJavaErrorCheck) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).triggerJavaErrorCheck();
        }

        // Check syntax and always show the result
        const validation = javaSyntaxChecker.validateSyntax(currentCode);

        if (!validation.isValid) {
            console.group("🔍 Syntax Check Failed");
            console.log("❌ Cannot compile due to syntax errors:");
            validation.errors.forEach((error, index) => {
                console.log(`%cLine ${error.line}: ${error.message}`, 'color: #ff6b6b; font-weight: bold;');
                console.log(`%c   Explanation: ${error.explanation}`, 'color: #ffa500;');
                if (index < validation.errors.length - 1) {
                    console.log('---');
                }
            });
            console.groupEnd();
            
            // Don't proceed with compilation if there are syntax errors
            return;
        }

        console.log("✅ Syntax is valid! Proceeding with compilation...");
        setIsCompiling(true);

        try {
            // Simulate compilation (you can replace this with actual API call)
            const formData = new FormData();
            formData.append("code", currentCode);

            const response = await fetch("/api/compile", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            
            if (result.success) {
                console.log("✅ Compilation successful!");
                setSuccess(true);
                setIsDialogOpen(false);
                setShowLights(true);
                setFadeOutLights(false);

                // Hide robot toast when code runs successfully
                hideRobotMessage();

                setTimeout(() => {
                    setFadeOutLights(true);
                    setTimeout(() => {
                        setShowLights(false);
                    }, 1000);
                }, 4000);
            } else {
                console.error("❌ Compilation failed:", result.error);
            }
        } catch (error) {
            console.error("❌ Compilation error:", error);
        } finally {
            setIsCompiling(false);
        }
    };

    // Handle dialog open change to show toast
    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);

        if (open) {
            // Show persistent robot toast when dialog opens (without close button)
            showRobotPersistent(
                " Welcome to the coding challenge! Create the Roboter class in the editor below, build the class and run the code to restore my functionality.",
                { showCloseButton: false }
            );
        } else {
            // Hide toast when dialog closes
            hideRobotMessage();
        }
    };

    return (
        mounted && (
            <div className="relative min-h-screen overflow-hidden">
                <LargeRobotMessageOverlay
                    message={robotVisible ? currentMessage : ""}
                    showStartButton={isLastMessage}
                    onStart={() => {
                        setRobotVisible(false); // Hide overlay after Start clicked
                        setMounted(true); // Open the dialog for coding
                        setAudioEnabled(true); // Turn on sounds
                    }}
                    onNext={next}
                />

                <div className="absolute top-4 right-6 flex gap-2 z-50">
                    <button
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        className="bg-black/50 text-white px-3 py-2 rounded-lg shadow hover:bg-black/70 transition"
                    >
                        {audioEnabled ? (
                            <Volume2 className="w-5 h-5" />
                        ) : (
                            <VolumeX className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={() => setShowConfirmDialog(true)}
                        className="bg-black/50 text-white px-3 py-2 rounded-lg shadow hover:bg-black/70 transition"
                    >
                        <LogOutIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Background Flashing Layer */}
                <>
                    {!success && (
                        <motion.div
                            className="absolute top-0 left-0 w-full h-full z-10 bg-red-600 opacity-0 pointer-events-none"
                            animate={{ opacity: [0.06, 0.15, 0.06] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        />
                    )}

                    {success && showLights && (
                        <>
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-screen bg-gradient-to-b from-yellow-300 to-transparent opacity-60 rounded-full"
                                    style={{ left: `${i * 12.5}%`, zIndex: 30 }}
                                    animate={{
                                        scaleY: [1, 1.5, 1],
                                        opacity: fadeOutLights
                                            ? 0
                                            : [0.2, 0.4, 0],
                                    }}
                                    transition={{
                                        repeat: fadeOutLights ? 0 : Infinity,
                                        duration: 1.5 + i * 0.2,
                                        ease: "easeInOut",
                                    }}
                                />
                            ))}

                            <motion.div
                                className="absolute inset-0 bg-yellow-400 mix-blend-screen opacity-0 z-20"
                                animate={{
                                    opacity: fadeOutLights ? 0 : [0.1, 0.2, 0],
                                }}
                                transition={{
                                    repeat: fadeOutLights ? 0 : Infinity,
                                    duration: 2,
                                }}
                            />
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
                                {/* <Zap className="w-12 h-12 text-yellow-400 animate-pulse ml-2" /> */}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-glow">
                                System Failure Detected
                            </h1>
                            <p className="text-xl text-red-300 animate-pulse">
                                A critical error has occurred in the robotic
                                control logic. Immediate debugging is required.
                            </p>
                        </div>

                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={handleDialogOpenChange}
                        >
                            <DialogTrigger>
                                <HoverButton className="flex items-center gap-1">
                                    <Play className="w-6 h-6 mr-2" />
                                    Start Coding
                                </HoverButton>
                            </DialogTrigger>
                            <DialogContent className="max-w-7xl min-h-[70vh] max-h-[90vh] overflow-hidden justify-center flex flex-col">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-center text-white">
                                        Abstraction - Create the Roboter Class
                                    </DialogTitle>
                                </DialogHeader>

                                {/* Java Editor */}
                                <div className="mt-4 flex-grow overflow-auto">
                                    <JavaEditor 
                                        onChange={handleCodeChange}
                                        enableSyntaxCheck={true}
                                    />
                                </div>

                                <HoverButton
                                    onClick={handleRunCode}
                                    disabled={isCompiling}
                                    className={`max-w-[200px] mx-auto ${
                                        isCompiling
                                            ? 'opacity-50 cursor-not-allowed' 
                                            : 'hover:scale-105 transition-transform'
                                    }`}
                                >
                                    {isCompiling ? '🔄 Compiling...' : '🚀 Run Code'}
                                </HoverButton>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
                        <motion.div
                            className="text-white text-4xl md:text-6xl font-extrabold text-center max-w-7xl px-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            Mission Accomplished!🎉
                            <br />
                            The robot has been repaired successfully.
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 3.5, duration: 0.8 }}
                            className="w-full mt-6 flex justify-center"
                        >
                            <HoverButton className="text-lg flex gap-2 items-center justify-center w-1/4 mx-auto ">
                                Next Step <ArrowRight className="w-5 h-5" />
                            </HoverButton>
                        </motion.div>
                    </div>
                )}

                {/* Confirmation Dialog */}
                <Dialog
                    open={showConfirmDialog}
                    onOpenChange={setShowConfirmDialog}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-center text-white">
                                End Level?
                            </DialogTitle>
                        </DialogHeader>
                        <div className="text-center text-gray-300 mb-6">
                            Are you sure you want to end this level and return
                            to the main menu? Your progress will be saved.
                        </div>
                        <div className="flex gap-4 justify-center">
                            <HoverButton
                                onClick={() => setShowConfirmDialog(false)}
                                className="bg-gray-600 hover:bg-gray-700"
                            >
                                Cancel
                            </HoverButton>
                            <Link href="/">
                                <HoverButton className="bg-red-600 hover:bg-red-700">
                                    End Level
                                </HoverButton>
                            </Link>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        )
    );
}
