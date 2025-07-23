import { ArrowRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import { HoverButton } from "@/components/ui/hover-button";
import { Level } from "@/lib/api/client";
import { useRouter } from "next/navigation";

interface LevelSuccessProps {
  levelData: Level | null;
  nextLevel?: Level | null;
  onLevelComplete?: () => void;
}

export function LevelSuccess({
  levelData,
  nextLevel,
  onLevelComplete,
}: LevelSuccessProps) {
  const router = useRouter();

  console.log("🔍 LevelSuccess - levelData:", levelData);
  console.log("🔍 LevelSuccess - nextLevel:", nextLevel);
  console.log("🔍 LevelSuccess - levelData?.id:", levelData?.id);

  const handleNextLevel = () => {
    if (onLevelComplete) {
      onLevelComplete();
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };
  return (
    <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
      <motion.div
        className="text-white text-4xl md:text-6xl font-extrabold text-center max-w-7xl px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        {levelData?.successMessage || "Mission Accomplished!🎉"}
        <br />
        The robot has been repaired successfully.
      </motion.div>

      {nextLevel ? (
        <motion.div
          className="text-white text-lg md:text-xl text-center max-w-4xl px-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          Ready for the next challenge? Level {nextLevel.levelNumber} awaits!
        </motion.div>
      ) : (
        <motion.div
          className="text-white text-lg md:text-xl text-center max-w-4xl px-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          🏆 Congratulations! You&apos;ve completed all levels and mastered OOP
          concepts!
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 3.5, duration: 0.8 }}
        className="w-full mt-6 flex justify-center"
      >
        {nextLevel ? (
          <HoverButton
            className="text-lg flex gap-2 items-center justify-center w-1/4 mx-auto"
            onClick={handleNextLevel}
          >
            Next Level {nextLevel.levelNumber}
            <ArrowRight className="w-5 h-5" />
          </HoverButton>
        ) : (
          <HoverButton
            className="text-lg flex gap-2 items-center justify-center w-1/4 mx-auto"
            onClick={handleGoHome}
          >
            Return to Map
            <Home className="w-5 h-5" />
          </HoverButton>
        )}
      </motion.div>
    </div>
  );
}
