"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRobotMessages } from "@/app/hooks/useRobotMessages";
import { LargeRobotMessageOverlay } from "@/components/large-robot-message";
import Loader from "@/components/ui/loader";
import { useGameStore } from "@/lib/store";

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
import { getUserLastLevels, sessionUtils } from "@/lib/api/client";

export default function LabGamePage() {
  const params = useParams();
  const levelId = params.levelId as string;
  const [mounted, setMounted] = useState(false);
  const [robotVisible, setRobotVisible] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const fetchUserLevels = async () => {
      const userId = sessionUtils.getUserId();

      if (userId && sessionUtils.isAuthenticated()) {
        try {
          const res = await getUserLastLevels(userId);
          const data = res.data;
          if (data && data[0].levelNumber <= (levelData?.levelNumber ?? 0))
            router.push(`/`);
          // User levels fetched successfully
        } catch (error) {
          console.error("Error fetching user levels:", error);
        }
      } else {
        router.push("/");
      }
    };

    fetchUserLevels();
  }, []);
  // Zustand store
  const {
    nextLevel,
    setCurrentLevel,
    setNextLevel,
    findNextLevel,
    isLastLevel,
    getSectionByLevelId,
    sections,
  } = useGameStore();

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

  // Set current level in store when levelData is loaded
  useEffect(() => {
    if (levelData && sections.length > 0) {
      setCurrentLevel(levelData);

      // Use store functions to find next level and current section
      const next = findNextLevel(levelData.id);
      const currentSection = getSectionByLevelId(levelData.id);
      const isLast = isLastLevel(levelData.id);

      console.log("🔍 Page - Current level:", levelData);
      console.log("🔍 Page - Current section:", currentSection);
      console.log("🔍 Page - Next level:", next);
      console.log("🔍 Page - Is last level:", isLast);
      console.log("🔍 Page - Sections available:", sections.length);

      setNextLevel(next);
    }
  }, [
    levelData,
    sections,
    setCurrentLevel,
    setNextLevel,
    findNextLevel,
    getSectionByLevelId,
    isLastLevel,
  ]);

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

  // Handle level completion and navigation to next level
  const handleLevelComplete = () => {
    console.log("🔍 handleLevelComplete - nextLevel:", nextLevel);
    console.log("🔍 handleLevelComplete - current levelId:", levelId);

    if (nextLevel) {
      // Navigate to next level after a short delay
      setTimeout(() => {
        const currentSection = getSectionByLevelId(levelId);
        console.log("🔍 handleLevelComplete - currentSection:", currentSection);
        console.log(
          "🔍 handleLevelComplete - navigating to:",
          `/${currentSection?.sectionId}/${nextLevel.id}`
        );

        if (currentSection) {
          router.push(`/${currentSection.sectionId}/${nextLevel.id}`);
        }
      }, 2000);
    } else if (isLastLevel(levelId)) {
      // User completed the last level of the game
      console.log(
        "🔍 handleLevelComplete - last level completed, redirecting to map"
      );
      setTimeout(() => {
        router.push("/"); // Redirect to map/home
      }, 2000);
    } else {
      console.log(
        "🔍 handleLevelComplete - no next level and not last level, redirecting to map"
      );
      setTimeout(() => {
        router.push("/"); // Redirect to map/home
      }, 2000);
    }
  };

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
          levelNumber={levelData?.levelNumber}
          sectionNumber={
            sections.find(
              (section) => section.sectionId === levelData?.sectionId
            )?.sectionNumber
          }
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
          <LevelSuccess
            levelData={levelData}
            nextLevel={nextLevel}
            onLevelComplete={handleLevelComplete}
          />
        )}

        <LevelConfirmDialog
          showConfirmDialog={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
        />
      </div>
    )
  );
}
