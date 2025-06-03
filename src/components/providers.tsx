"use client";
import React from "react";
import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { MouseAnimation } from "./MouseAnimation";
import { usePathname } from "next/navigation";
import GridBackground from "./ui/grid-background";
import { HeroGeometric } from "./ui/shape-landing-hero";

interface ProvidersProps {
    children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
    const pathname = usePathname();
    const isLevelPage = pathname.includes("/level");
    return (
        <>
            {isLevelPage ? <GridBackground /> : <HeroGeometric />}

            <div className="relative">
                <Toaster position="top-center" reverseOrder={false} />

                {children}
                <MouseAnimation />
            </div>
        </>
    );
};

export default Providers;
