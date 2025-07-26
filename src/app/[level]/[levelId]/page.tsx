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
import { getUserLastLevels, sessionUtils, UserLevel } from "@/lib/api/client";

export default function LabGamePage() {
  const params = useParams();
  const levelId = params.levelId as string;
  const [mounted, setMounted] = useState(false);
  const [robotVisible, setRobotVisible] = useState(false);
  const [userLastLevel, setUserLastLevel] = useState<UserLevel | null>(null);
  const [userLastSection, setUserLastSection] = useState<number | null>(null);

  const router = useRouter();

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

  // Fetch user's last level and check access
  useEffect(() => {
    const fetchUserLevels = async () => {
      const userId = sessionUtils.getUserId();
      console.log(
        "User ID:",
        userId,
        "Authenticated:",
        sessionUtils.isAuthenticated()
      );

      if (userId && sessionUtils.isAuthenticated()) {
        try {
          const res = await getUserLastLevels(userId);
          if (res.success && res.data && res.data.length > 0) {
            const userLevels = res.data;

            // Find the highest level the user has completed
            const highestLevel = userLevels.reduce((highest, current) => {
              return current.levelNumber > highest.levelNumber
                ? current
                : highest;
            });

            setUserLastLevel(highestLevel);
            console.log("User's highest level:", highestLevel);

            // Find the section number for the highest level
            const currentSection = sections.find((section) =>
              section.levels.some((level) => level.id === highestLevel.id)
            );

            if (currentSection) {
              setUserLastSection(currentSection.sectionNumber);
            }
            console.log("Current section found:", currentSection);

            // Check if user can access this level
            if (levelData && highestLevel.levelNumber < levelData.levelNumber) {
              console.log("User cannot access this level. Redirecting to map.");
              router.push("/");
              return;
            }

            console.log("User's last level:", highestLevel);
            console.log("User's last section:", currentSection?.sectionNumber);
          }
        } catch (error) {
          console.error("Error fetching user levels:", error);
        }
      } else {
        console.log("User not authenticated. Redirecting to sign-in.");
        router.push("/sign-in");
      }
    };

    if (levelData && sections.length > 0) {
      fetchUserLevels();
    }
  }, [levelId, router, levelData, sections]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set current level in store when levelData is loaded
  useEffect(() => {
    if (levelData && sections.length > 0) {
      setCurrentLevel(levelData);

      const next = findNextLevel(levelData.id);

      setNextLevel(next);
    }
  }, [levelData, sections, setCurrentLevel, setNextLevel, findNextLevel]);

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

  // Handle starting the coding session
  const handleStartCoding = () => {
    setRobotVisible(false); // Hide overlay after Start clicked
    setMounted(true); // Open the dialog for coding
    setAudioEnabled(true); // Turn on sounds
  };

  // Handle level completion and navigation to next level
  const handleLevelComplete = () => {
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
          onStart={handleStartCoding}
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

        {/* User Progress Display */}
        {userLastLevel && (
          <div className="fixed top-4 left-4 z-30 bg-metallic-light/10 backdrop-blur-lg border border-white/20 rounded-lg p-3 text-white">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-metallic-accent font-semibold">
                  🏆 Your Progress:
                </span>
                <span>Level {userLastLevel.levelNumber}</span>
                {userLastSection && (
                  <>
                    <span className="text-metallic-light/60">•</span>
                    <span>Section {userLastSection}</span>
                  </>
                )}
              </div>
              {levelData && (
                <div className="flex items-center gap-2 text-xs text-metallic-light/80">
                  <span>📍 Current: Level {levelData.levelNumber}</span>
                  {sections.find(
                    (section) => section.sectionId === levelData.sectionId
                  )?.sectionNumber && (
                    <>
                      <span className="text-metallic-light/60">•</span>
                      <span>
                        Section{" "}
                        {
                          sections.find(
                            (section) =>
                              section.sectionId === levelData.sectionId
                          )?.sectionNumber
                        }
                      </span>
                    </>
                  )}
                </div>
              )}
              {/* Progress Indicator */}
              {levelData && userLastLevel && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-metallic-light/60 mb-1">
                    <span>📊 Progress</span>
                    <span>
                      {Math.round(
                        (userLastLevel.levelNumber / levelData.levelNumber) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-metallic-light/20 rounded-full h-1">
                    <div
                      className="bg-metallic-accent h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (userLastLevel.levelNumber / levelData.levelNumber) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        {!success ? (
          <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
            <LevelHeader levelData={levelData} success={!success} />

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
