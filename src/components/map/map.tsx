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
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [userLevels, setUserLevels] = useState<UserLevel[]>([]);
  const [isLoadingUserLevels, setIsLoadingUserLevels] = useState(false);
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [isLoadingAllLevels, setIsLoadingAllLevels] = useState(false);

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

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(BASE_URL + "/section/getAll");
        if (response.ok) {
          const data: ApiResponse = await response.json();
          setSections(
            data.data.sort((a, b) => a.sectionNumber - b.sectionNumber)
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

  const handleLevelClick = (sectionId: string) => {
    // Check if user is authenticated
    if (!sessionUtils.isAuthenticated()) {
      // If not authenticated, redirect to login page
      router.push("/sign-in");
      return;
    }

    // If authenticated, proceed with level selection
    setSelectedLevel(parseInt(sectionId));
    setIsLoading(true);

    // Get the first level of this section
    const sectionLevels = allLevels.filter(
      (level) => level.sectionId === sectionId
    );

    const firstLevelId =
      sectionLevels.length > 0 ? sectionLevels[0].id : sectionId;

    setTimeout(() => {
      router.push(`/${sectionId}/${firstLevelId}`);
    }, 1500);
  };

  // Generate map levels from sections data
  const mapLevels = sections.map((section) => ({
    id: section.id, // Use UUID for URL navigation
    sectionNumber: section.sectionNumber, // Keep sectionNumber for display
    image: `/assets/images/map-${section.sectionNumber}.png`,
    description: section.description,
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
          const sectionLevels = allLevels.filter(
            (level) => level.sectionId === e.id
          );

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

          if (hasCompletedSection) {
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
                      handleLevelClick(e.id);
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
