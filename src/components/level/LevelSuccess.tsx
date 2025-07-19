import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { HoverButton } from "@/components/ui/hover-button";
import { Level } from "@/lib/api/client";

interface LevelSuccessProps {
  levelData: Level | null;
}

export function LevelSuccess({ levelData }: LevelSuccessProps) {
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
  );
}
