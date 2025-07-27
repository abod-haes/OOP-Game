import { Play, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HoverButton } from "@/components/ui/hover-button";
import JavaEditor from "@/components/java-editor/JavaEditor";
import { Level } from "@/lib/api/client";

interface LevelDialogProps {
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  levelData: Level | null;
  onCodeChange: (code: string | undefined) => void;
  onRunCode: () => void;
  isCompiling: boolean;
}

export function LevelDialog({
  isDialogOpen,
  onDialogOpenChange,
  levelData,
  onCodeChange,
  onRunCode,
  isCompiling,
}: LevelDialogProps) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
      <DialogTrigger>
        <HoverButton className="flex items-center gap-1">
          <Play className="w-6 h-6 mr-2" />
          Start Coding
        </HoverButton>
      </DialogTrigger>
      <DialogContent
        className="max-w-7xl min-h-[70vh] max-h-[90vh] overflow-hidden justify-center flex flex-col"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold"></h2>
            <button
              onClick={() => onDialogOpenChange(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Java Editor */}
        <div className="mt-4 flex-grow overflow-auto">
          <JavaEditor
            title={levelData?.name}
            description={levelData?.description}
            onChange={onCodeChange}
            enableSyntaxCheck={true}
          />
        </div>

        <HoverButton
          onClick={onRunCode}
          disabled={isCompiling}
          className={`max-w-[200px] mx-auto ${
            isCompiling
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-105 transition-transform"
          }`}
        >
          {isCompiling ? "🔄 Compiling..." : "🚀 Run Code"}
        </HoverButton>
      </DialogContent>
    </Dialog>
  );
}
