import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { HoverButton } from "@/components/ui/hover-button";

interface LevelErrorProps {
  levelError: string;
}

export function LevelError({ levelError }: LevelErrorProps) {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Error Loading Level
        </h1>
        <p className="text-red-300 mb-4">{levelError}</p>
        <Link href="/">
          <HoverButton>Return to Map</HoverButton>
        </Link>
      </div>
    </div>
  );
}
