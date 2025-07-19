"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRobotMessages } from "@/app/hooks/useRobotMessages";
import { LargeRobotMessageOverlay } from "@/components/large-robot-message";
import Loader from "@/components/ui/loader";

// Import level components
import {
  LevelHeader,
  LevelControls,
  LevelBackground,
  LevelDialog,
  LevelSuccess,
  LevelConfirmDialog,
  LevelError,
} from "@/components/level";

// Import custom hook
import { useLevel } from "@/app/hooks/useLevel";

export default function LabGamePage() {
  const params = useParams();
  const levelId = params.levelId as string;
  const [mounted, setMounted] = useState(false);
  const [robotVisible, setRobotVisible] = useState(false);

  // Use custom hook for level logic
  const {
    levelData,
    isLoadingLevel,
    levelError,
    isDialogOpen,
    success,
    showLights,
    fadeOutLights,
    showConfirmDialog,
    isCompiling,
    audioEnabled,
    handleCodeChange,
    handleRunCode,
    handleDialogOpenChange,
    setAudioEnabled,
    setShowConfirmDialog,
  } = useLevel(levelId);

  useEffect(() => {
    setMounted(true);
  }, []);

  const robotMessages = [
    "👋 Hello there! I'm your lab assistant robot.",
    "🛠️ It looks like there's a bug in my core control logic.",
    levelData?.description || "",
    levelData?.task || "",
  ];

  const { currentMessage, show, next } = useRobotMessages(robotMessages, 10000);

  // On mount: show robot overlay and start message cycling
  useEffect(() => {
    setRobotVisible(true);
    show(); // kick off the message cycle
  }, [show]);

  const isLastMessage =
    robotMessages.indexOf(currentMessage) === robotMessages.length - 1;

  // Show loading state
  if (isLoadingLevel) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Show error state
  if (levelError) {
    return <LevelError levelError={levelError} />;
  }

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

        <LevelControls
          audioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled(!audioEnabled)}
          onShowConfirmDialog={() => setShowConfirmDialog(true)}
        />

        <LevelBackground
          success={success}
          showLights={showLights}
          fadeOutLights={fadeOutLights}
        />

        {/* Main Content */}
        {!success ? (
          <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
            <LevelHeader levelData={levelData} success={success} />

            <LevelDialog
              isDialogOpen={isDialogOpen}
              onDialogOpenChange={handleDialogOpenChange}
              levelData={levelData}
              onCodeChange={handleCodeChange}
              onRunCode={handleRunCode}
              isCompiling={isCompiling}
            />
          </div>
        ) : (
          <LevelSuccess levelData={levelData} />
        )}

        <LevelConfirmDialog
          showConfirmDialog={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
        />
      </div>
    )
  );
}
