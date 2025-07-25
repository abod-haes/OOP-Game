"use client";
import React from "react";
import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { MouseAnimation } from "./MouseAnimation";
import { usePathname } from "next/navigation";
import GridBackground from "./ui/grid-background";
import { HeroGeometric } from "./ui/shape-landing-hero";
import {
  RobotToastProvider,
  useGlobalRobotToast,
} from "@/app/hooks/useRobotToast";
import { RobotToast } from "./robot-toast";

interface ProvidersProps {
  children: ReactNode;
}

// Component to render the global robot toast
function GlobalRobotToast() {
  const { toastState, hideToast } = useGlobalRobotToast();

  return (
    <RobotToast
      isVisible={toastState.isVisible}
      message={toastState.message}
      showStartButton={toastState.showStartButton}
      showCloseButton={toastState.showCloseButton}
      onStart={toastState.onStart}
      onHide={hideToast}
    />
  );
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  const pathname = usePathname();
  const isLevelPage = pathname.includes("/level");

  return (
    <RobotToastProvider>
      {isLevelPage ? <GridBackground /> : <HeroGeometric />}

      <div className="relative">
        <Toaster position="top-center" reverseOrder={false} />

        {/* Global Robot Toast */}
        <GlobalRobotToast />

        {children}
        {/* Show MouseAnimation on all pages for consistent cursor experience */}
        <MouseAnimation />
      </div>
    </RobotToastProvider>
  );
};

export default Providers;
