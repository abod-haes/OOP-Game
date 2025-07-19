"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Loader from "../ui/loader";
import {
  sessionUtils,
  getUserLastLevels,
  UserLevel,
  getAllLevels,
  Level,
} from "@/lib/api/client";
import { BASE_URL } from "@/app/api-services";

interface Section {
  id: string;
  updatedAt: string | null;
  deletedAt: string | null;
  sectionNumber: number;
  description: string;
}

interface SectionWithLevels extends Section {
  levels: Level[];
}

interface ApiResponse {
  data: Section[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
}

function Map() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState<SectionWithLevels[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [userLevels, setUserLevels] = useState<UserLevel[]>([]);
  const [isLoadingUserLevels, setIsLoadingUserLevels] = useState(false);
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [isLoadingAllLevels, setIsLoadingAllLevels] = useState(false);
  const [userLastLevel, setUserLastLevel] = useState<Level | null>(null);

  const fetchUserLevels = async () => {
    try {
      setIsLoadingUserLevels(true);
      const userId = sessionUtils.getUserId();

      if (userId && sessionUtils.isAuthenticated()) {
        const response = await getUserLastLevels(userId);
        if (response.success && response.data) {
          setUserLevels(response.data);
          console.log(response.data, "user levels");
        }
      }
    } catch (error) {
      console.error("Error fetching user levels:", error);
    } finally {
      setIsLoadingUserLevels(false);
    }
  };

  const fetchAllLevels = async () => {
    try {
      setIsLoadingAllLevels(true);
      const response = await getAllLevels({
        PageSize: 50, // Get more levels
        Asc: true, // Ascending order
      });

      if (response.success && response.data) {
        setAllLevels(response.data.data);
        console.log(response.data, "all levels");
      }
    } catch (error) {
      console.error("Error fetching all levels:", error);
    } finally {
      setIsLoadingAllLevels(false);
    }
  };

  // Find user's last level
  const findUserLastLevel = (
    userLevels: UserLevel[],
    allLevels: Level[]
  ): Level | null => {
    if (userLevels.length === 0) return null;

    // Find the highest level number among user's completed levels
    const highestUserLevel = userLevels.reduce((highest, current) => {
      return current.levelNumber > highest.levelNumber ? current : highest;
    });

    // Find the next level after the highest completed level
    const nextLevel = allLevels.find(
      (level) =>
        level.sectionId === highestUserLevel.sectionId &&
        level.levelNumber === highestUserLevel.levelNumber + 1
    );

    // If there's a next level in the same section, return it
    if (nextLevel) return nextLevel;

    // If no next level in same section, find the first level of the next section
    const currentSection = sections.find(
      (s) => s.id === highestUserLevel.sectionId
    );
    if (currentSection) {
      const nextSection = sections.find(
        (s) => s.sectionNumber === currentSection.sectionNumber + 1
      );
      if (nextSection) {
        const firstLevelOfNextSection = allLevels.find(
          (level) =>
            level.sectionId === nextSection.id && level.levelNumber === 1
        );
        if (firstLevelOfNextSection) return firstLevelOfNextSection;
      }
    }

    // If no next level found, return the highest completed level
    const lastCompletedLevel = allLevels.find(
      (level) => level.id === highestUserLevel.id
    );
    return lastCompletedLevel || null;
  };

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(BASE_URL + "/section/getAll");
        if (response.ok) {
          const data: ApiResponse = await response.json();
          // Sort sections by section number from small to large
          const sortedSections = data.data.sort(
            (a, b) => a.sectionNumber - b.sectionNumber
          );
          setSections(
            sortedSections.map((section) => ({
              ...section,
              levels: [], // Initialize empty levels array
            }))
          );
        } else {
          console.error("Failed to fetch sections");
        }
      } catch (error) {
        console.error("Error fetching sections:", error);
      } finally {
        setIsLoadingSections(false);
      }
    };

    fetchSections();
    fetchUserLevels();
    fetchAllLevels();
  }, []);

  // Update sections with their levels and find user's last level
  useEffect(() => {
    if (allLevels.length > 0 && sections.length > 0) {
      // Add levels to each section
      const sectionsWithLevels = sections.map((section) => ({
        ...section,
        levels: allLevels
          .filter((level) => level.sectionId === section.id)
          .sort((a, b) => a.levelNumber - b.levelNumber), // Sort levels by level number
      }));

      setSections(sectionsWithLevels);

      // Find user's last level
      const lastLevel = findUserLastLevel(userLevels, allLevels);
      setUserLastLevel(lastLevel);

      console.log("User's last level:", lastLevel);
    }
  }, [allLevels, userLevels, sections.length]);

  const handleLevelClick = (sectionId: string, targetLevelId?: string) => {
    // Check if user is authenticated
    if (!sessionUtils.isAuthenticated()) {
      // If not authenticated, redirect to login page
      router.push("/sign-in");
      return;
    }

    // If authenticated, proceed with level selection
    setSelectedLevel(parseInt(sectionId));
    setIsLoading(true);

    // Determine which level to navigate to
    let levelToNavigate = targetLevelId;

    if (!levelToNavigate) {
      // If no specific level provided, find the appropriate level for this section
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        // Check if user has completed this section
        const hasCompletedSection = userLevels.some(
          (level) => level.sectionId === sectionId
        );

        if (hasCompletedSection) {
          // Find the next level in this section
          const lastUserLevelInSection = userLevels
            .filter((level) => level.sectionId === sectionId)
            .reduce((highest, current) =>
              current.levelNumber > highest.levelNumber ? current : highest
            );

          const nextLevel = section.levels.find(
            (level) =>
              level.levelNumber === lastUserLevelInSection.levelNumber + 1
          );

          levelToNavigate = nextLevel?.id || section.levels[0]?.id;
        } else {
          // Start from the first level of this section
          levelToNavigate = section.levels[0]?.id;
        }
      }
    }

    // Fallback to section ID if no level found
    if (!levelToNavigate) {
      levelToNavigate = sectionId;
    }

    setTimeout(() => {
      router.push(`/${sectionId}/${levelToNavigate}`);
    }, 1500);
  };

  // Generate map levels from sections data
  const mapLevels = sections.map((section) => ({
    id: section.id, // Use UUID for URL navigation
    sectionNumber: section.sectionNumber, // Keep sectionNumber for display
    image: `/assets/images/map-${section.sectionNumber}.png`,
    description: section.description,
    levels: section.levels,
  }));

  if (isLoadingSections || isLoadingUserLevels || isLoadingAllLevels) {
    return (
      <div className="relative w-full h-full md:min-h-[60vh] min-h-[40vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full md:min-h-[60vh] min-h-[40vh]">
      <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>
      <motion.div
        className="relative w-full max-w-[1250px] mx-auto h-full flex justify-center"
        animate={
          selectedLevel
            ? {
                scale: [1, 2, 2.2],
                transition: {
                  duration: 1,
                  times: [0, 0.8, 1],
                  ease: "linear",
                },
              }
            : {}
        }
      >
        <Image
          src="/assets/images/map-main.png"
          alt="Map background"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1250px"
          className="z-10 w-full mx-auto"
        />
        {mapLevels.map((e, index) => {
          // Check if user has completed this section
          const hasCompletedSection = userLevels.some(
            (level) => level.sectionId === e.id
          );

          // Get levels for this section
          const sectionLevels = e.levels;

          // Determine section status and styling
          let sectionStatus = "locked"; // default: gray/locked
          let overlayClass = "bg-gray-600/50"; // default gray overlay
          let isClickable = false;

          // Find the highest section number the user has completed
          const highestCompletedSectionNumber =
            userLevels.length > 0
              ? Math.max(
                  ...userLevels.map((level) => {
                    const section = sections.find(
                      (s) => s.id === level.sectionId
                    );
                    return section ? section.sectionNumber : 0;
                  })
                )
              : 0;

          // Check if this is the user's current section (where their last level is)
          const isUserCurrentSection =
            userLastLevel && userLastLevel.sectionId === e.id;

          if (hasCompletedSection || isUserCurrentSection) {
            sectionStatus = "completed";
            overlayClass = "bg-green-500/30"; // green overlay for completed
            isClickable = true;
          } else if (
            index === 0 || // First section is always available
            e.sectionNumber <= highestCompletedSectionNumber + 1 // Next section after highest completed
          ) {
            sectionStatus = "current";
            overlayClass = "bg-blue-500/30"; // blue overlay for current
            isClickable = true;
          }

          // If this is the user's current section, highlight it differently
          if (isUserCurrentSection) {
            sectionStatus = "current";
            overlayClass = "bg-yellow-500/30"; // yellow overlay for current user level
          }

          return (
            <div
              key={e.id}
              style={{ left: `${(index + (index > 1 ? 1 : 0.3)) * 20}%` }}
              className={`group absolute top-[-8%] left-0 w-[14%] h-[70%] ${
                isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
              onClick={
                isClickable
                  ? () => {
                      console.log(e);
                      // If this is the user's current section, navigate to their last level
                      if (isUserCurrentSection && userLastLevel) {
                        handleLevelClick(e.id, userLastLevel.id);
                      } else {
                        handleLevelClick(e.id);
                      }
                    }
                  : undefined
              }
            >
              <Image
                src={e.image}
                alt="Map background"
                fill
                sizes="(max-width: 768px) 14vw, 14vw"
                className="!w-full mx-auto group-hover:-translate-y-8 transition-all duration-300"
              />

              {/* Status overlay */}
              <div
                className={`absolute top-0 w-full h-[100%] z-20 ${overlayClass} transition-all`}
              />

              {/* Status indicator */}
              <div
                className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-30 ${
                  sectionStatus === "completed"
                    ? "bg-green-500"
                    : sectionStatus === "current"
                    ? "bg-blue-500"
                    : "bg-gray-500"
                }`}
              >
                <span className="text-white text-xs font-bold">
                  {sectionStatus === "completed"
                    ? "✓"
                    : sectionStatus === "current"
                    ? "▶"
                    : "🔒"}
                </span>
              </div>

              {/* Level count indicator */}
              {sectionLevels.length > 0 && (
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center z-30">
                  <span className="text-white text-xs font-bold">
                    {sectionLevels.length}
                  </span>
                </div>
              )}

              {/* Current user level indicator */}
              {isUserCurrentSection && userLastLevel && (
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center z-30">
                  <span className="text-white text-xs font-bold">
                    {userLastLevel.levelNumber}
                  </span>
                </div>
              )}

              {/* Section name tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-40 whitespace-nowrap">
                {e.description.split(" ").slice(0, 3).join(" ")}...
              </div>
            </div>
          );
        })}
      </motion.div>
      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        initial={{ opacity: 0 }}
        animate={
          selectedLevel
            ? {
                opacity: [0, 0.5, 0.8],
                background: [
                  "radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)",
                  "radial-gradient(circle at center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)",
                  "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
                ],
                transition: {
                  duration: 1,
                  times: [0, 0.8, 1],
                  ease: "linear",
                },
              }
            : { opacity: 0 }
        }
      />
    </div>
  );
}

export default Map;
