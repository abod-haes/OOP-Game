"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, LockKeyhole, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import Loader from "../ui/loader";
import {
  getAllLevels,
  getAllSections,
  getUserLastLevels,
  Level,
  Section,
  sessionUtils,
  UserLevel,
} from "@/lib/api/client";
import { useGameStore } from "@/lib/store";

interface SectionWithLevels extends Section {
  levels: Level[];
}

function Map() {
  const router = useRouter();
  const [sections, setSections] = useState<SectionWithLevels[]>([]);
  const [userLevels, setUserLevels] = useState<UserLevel[]>([]);
  const [userLastLevel, setUserLastLevel] = useState<Level | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { setSections: setStoreSections, setUserLevels: setStoreUserLevels } =
    useGameStore();

  const findUserNextLevel = useCallback(
    (
      completedLevels: UserLevel[],
      allLevels: Level[],
      sectionsData: SectionWithLevels[]
    ): Level | null => {
      if (completedLevels.length === 0) {
        return sectionsData[0]?.levels[0] ?? null;
      }

      const orderedCompleted = [...completedLevels].sort((a, b) => {
        const sectionA =
          sectionsData.find((section) => section.id === a.sectionId)
            ?.sectionNumber ?? 0;
        const sectionB =
          sectionsData.find((section) => section.id === b.sectionId)
            ?.sectionNumber ?? 0;
        return sectionB - sectionA || b.levelNumber - a.levelNumber;
      });

      const highestCompleted = orderedCompleted[0];
      const nextInSection = allLevels.find(
        (level) =>
          level.sectionId === highestCompleted.sectionId &&
          level.levelNumber === highestCompleted.levelNumber + 1
      );

      if (nextInSection) return nextInSection;

      const currentSection = sectionsData.find(
        (section) => section.id === highestCompleted.sectionId
      );
      const nextSection = sectionsData.find(
        (section) =>
          section.sectionNumber === (currentSection?.sectionNumber ?? 0) + 1
      );

      return (
        nextSection?.levels[0] ??
        allLevels.find((level) => level.id === highestCompleted.id) ??
        null
      );
    },
    []
  );

  const loadMapData = useCallback(async () => {
    setIsInitialLoading(true);
    setLoadError(null);

    try {
      const userId = sessionUtils.getUserId();
      const userProgressPromise =
        userId && sessionUtils.isAuthenticated()
          ? getUserLastLevels(userId)
          : Promise.resolve({ success: true, data: [] as UserLevel[] });

      const [sectionsResponse, levelsResponse, progressResponse] =
        await Promise.all([
          getAllSections(),
          getAllLevels({ PageSize: 100, Asc: true }),
          userProgressPromise,
        ]);

      if (!sectionsResponse.success || !sectionsResponse.data) {
        throw new Error("Local sections could not be loaded.");
      }

      if (!levelsResponse.success || !levelsResponse.data) {
        throw new Error("Local levels could not be loaded.");
      }

      const allLevels = levelsResponse.data.data;
      const completedLevels = progressResponse.data ?? [];
      const sectionsWithLevels = [...sectionsResponse.data]
        .sort((a, b) => a.sectionNumber - b.sectionNumber)
        .map((section) => ({
          ...section,
          levels: allLevels
            .filter((level) => level.sectionId === section.id)
            .sort((a, b) => a.levelNumber - b.levelNumber),
        }));

      setSections(sectionsWithLevels);
      setUserLevels(completedLevels);
      setStoreUserLevels(completedLevels);
      setStoreSections(
        sectionsWithLevels.map((section) => ({
          sectionId: section.id,
          sectionNumber: section.sectionNumber,
          levels: section.levels,
        }))
      );
      setUserLastLevel(
        findUserNextLevel(completedLevels, allLevels, sectionsWithLevels)
      );
    } catch (error) {
      console.error("Unable to initialize the adventure map:", error);
      setLoadError(
        error instanceof Error ? error.message : "Unable to load the map."
      );
    } finally {
      setIsInitialLoading(false);
    }
  }, [findUserNextLevel, setStoreSections, setStoreUserLevels]);

  useEffect(() => {
    void loadMapData();
  }, [loadMapData]);

  const hasCompletedAllLevelsInSection = (sectionId: string) => {
    const section = sections.find((item) => item.id === sectionId);
    if (!section || section.levels.length === 0) return false;

    return (
      userLevels.filter((level) => level.sectionId === sectionId).length >=
      section.levels.length
    );
  };

  const handleSectionClick = (sectionId: string, targetLevelId?: string) => {
    if (!sessionUtils.isAuthenticated()) {
      router.push("/sign-in");
      return;
    }

    const section = sections.find((item) => item.id === sectionId);
    if (!section || section.levels.length === 0) return;

    let levelToNavigate = targetLevelId;
    const completedInSection = userLevels
      .filter((level) => level.sectionId === sectionId)
      .sort((a, b) => b.levelNumber - a.levelNumber);

    if (!levelToNavigate) {
      const nextNumber = (completedInSection[0]?.levelNumber ?? 0) + 1;
      levelToNavigate =
        section.levels.find((level) => level.levelNumber === nextNumber)?.id ??
        section.levels[0].id;
    }

    setSelectedSectionId(sectionId);
    router.push(`/${sectionId}/${levelToNavigate}`);
  };

  if (isInitialLoading) {
    return (
      <div className="relative flex min-h-[40vh] w-full items-center justify-center md:min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto flex min-h-[320px] max-w-xl flex-col items-center justify-center gap-4 text-center text-white">
        <LockKeyhole className="h-10 w-10 text-metallic-accent" />
        <p className="text-lg font-medium">The adventure map could not open.</p>
        <p className="text-sm text-white/60">{loadError}</p>
        <button
          type="button"
          onClick={() => void loadMapData()}
          className="rounded-lg bg-metallic-accent px-5 py-2.5 font-medium text-white transition hover:bg-metallic-accent/80"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[40vh] w-full md:min-h-[60vh]">
      <motion.div
        className="relative mx-auto flex h-full w-full max-w-[1250px] justify-center"
        animate={
          selectedSectionId
            ? { scale: 1.04, opacity: 0.85 }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Image
          src="/assets/images/map-main.png"
          alt="RoboRescue adventure map"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1250px"
          className="z-10 mx-auto w-full object-contain"
          priority
        />

        {sections.map((section, index) => {
          const hasProgress = userLevels.some(
            (level) => level.sectionId === section.id
          );
          const isCurrentSection = userLastLevel?.sectionId === section.id;
          const previousSection = sections.find(
            (item) => item.sectionNumber === section.sectionNumber - 1
          );
          const canAccess =
            index === 0 ||
            Boolean(
              previousSection &&
                hasCompletedAllLevelsInSection(previousSection.id)
            ) ||
            hasProgress ||
            isCurrentSection;

          const status =
            hasCompletedAllLevelsInSection(section.id) && hasProgress
              ? "completed"
              : canAccess
              ? "current"
              : "locked";

          const overlayClass =
            status === "completed"
              ? "bg-green-500/20"
              : status === "current"
              ? "bg-blue-500/20"
              : "bg-gray-700/55";

          const StatusIcon =
            status === "completed"
              ? Check
              : status === "current"
              ? Play
              : LockKeyhole;

          return (
            <button
              type="button"
              key={section.id}
              aria-label={`${section.description}. ${status}`}
              disabled={!canAccess || selectedSectionId !== null}
              style={{ left: `${(index + (index > 1 ? 1 : 0.3)) * 20}%` }}
              className={`group absolute left-0 top-[-8%] h-[70%] w-[14%] text-left transition-opacity disabled:cursor-not-allowed ${
                canAccess ? "cursor-pointer" : "opacity-50"
              }`}
              onClick={() =>
                handleSectionClick(
                  section.id,
                  isCurrentSection ? userLastLevel?.id : undefined
                )
              }
            >
              <Image
                src={`/assets/images/map-${section.sectionNumber}.png`}
                alt=""
                fill
                sizes="14vw"
                className="mx-auto !w-full object-contain transition-transform duration-300 group-enabled:group-hover:-translate-y-6"
              />

              <span
                className={`absolute top-0 z-20 h-full w-full ${overlayClass} transition-colors`}
              />

              <span
                className={`absolute -right-2 -top-2 z-30 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white ${
                  status === "completed"
                    ? "bg-green-500"
                    : status === "current"
                    ? "bg-blue-500"
                    : "bg-gray-600"
                }`}
              >
                <StatusIcon className="h-3.5 w-3.5 text-white" />
              </span>

              {section.levels.length > 0 && (
                <span className="absolute -bottom-2 -left-2 z-30 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-xs font-bold text-white">
                  {section.levels.length}
                </span>
              )}

              {isCurrentSection && userLastLevel && (
                <span className="absolute -bottom-2 -right-2 z-30 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-yellow-500 text-xs font-bold text-white">
                  {userLastLevel.levelNumber}
                </span>
              )}

              <span className="absolute -bottom-9 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {section.description}
              </span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}

export default Map;
