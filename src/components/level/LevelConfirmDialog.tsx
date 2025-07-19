import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HoverButton } from "@/components/ui/hover-button";

interface LevelConfirmDialogProps {
  showConfirmDialog: boolean;
  onClose: () => void;
}

export function LevelConfirmDialog({
  showConfirmDialog,
  onClose,
}: LevelConfirmDialogProps) {
  return (
    <Dialog open={showConfirmDialog} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-white">
            End Level?
          </DialogTitle>
        </DialogHeader>
        <div className="text-center text-gray-300 mb-6">
          Are you sure you want to end this level and return to the main menu?
          Your progress will be saved.
        </div>
        <div className="flex gap-4 justify-center">
          <HoverButton
            onClick={onClose}
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
  );
}
