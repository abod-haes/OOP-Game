import { AlertTriangle } from "lucide-react";
import { Level } from "@/lib/api/client";

interface LevelHeaderProps {
  levelData: Level | null;
  success: boolean;
}

export function LevelHeader({ levelData, success }: LevelHeaderProps) {
  if (success) {
    return (
      <div className="text-center mb-8 animate-fade-in max-w-3xl">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="w-16 h-16 text-red-500 animate-bounce" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-glow">
          {levelData?.name || `Level ${levelData?.levelNumber}`}
        </h1>
        <p className="text-xl text-red-300 animate-pulse">
          {levelData?.description}
        </p>
      </div>
    );
  }

  return null;
}
