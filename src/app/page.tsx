import React from "react";
import { MapPinned } from "lucide-react";
import Landing from "@/components/landing";
import HomeEditor from "@/components/home-editor";
import Map from "@/components/map/map";

export const dynamic = "force-dynamic";

function Page() {
  return (
    <main>
      <div className="container mx-auto grid h-full w-full grid-cols-1 gap-y-24 pb-10">
        <Landing />
        <HomeEditor />
      </div>

      <div className="mx-auto grid h-full w-full grid-cols-1 gap-y-24 overflow-hidden px-4 py-24 sm:px-10 sm:py-32">
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <MapPinned className="h-10 w-10 text-metallic-accent md:h-14 md:w-14" />
              <h2 className="text-4xl font-bold text-white animate-glow md:text-6xl">
                Adventure Map
              </h2>
            </div>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-300 md:text-xl">
              Embark on your coding journey. Each level presents a focused OOP
              challenge that improves your skills step by step.
              <span className="font-semibold text-metallic-accent">
                {" "}Choose an available section
              </span>{" "}
              to begin.
            </p>
          </div>
        </div>
        <Map />
      </div>
    </main>
  );
}

export default Page;
