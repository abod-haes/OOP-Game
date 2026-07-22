"use client";

import { FC, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { MouseAnimation } from "./MouseAnimation";
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
  const isLevelPage = /^\/section-[^/]+\/[^/]+\/?$/.test(pathname);

  return (
    <RobotToastProvider>
      {isLevelPage ? <GridBackground /> : <HeroGeometric />}

      <div className="relative">
        <Toaster position="top-center" reverseOrder={false} />
        <GlobalRobotToast />
        {children}
        <MouseAnimation />
      </div>
    </RobotToastProvider>
  );
};

export default Providers;
