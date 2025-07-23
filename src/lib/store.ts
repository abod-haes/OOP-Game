import { create } from "zustand";
import { Level, UserLevel } from "./api/client";

interface SectionWithLevels {
  sectionId: string;
  sectionNumber: number;
  levels: Level[];
}

interface GameStore {
  sections: SectionWithLevels[];
  userLevels: UserLevel[];
  currentLevel: Level | null;
  nextLevel: Level | null;

  // Actions
  setSections: (sections: SectionWithLevels[]) => void;
  setUserLevels: (userLevels: UserLevel[]) => void;
  setCurrentLevel: (level: Level | null) => void;
  setNextLevel: (level: Level | null) => void;

  // Computed actions
  findNextLevel: (currentLevelId: string) => Level | null;
  isLastLevel: (levelId: string) => boolean;
  getSectionByLevelId: (levelId: string) => SectionWithLevels | null;
  getCurrentSection: () => SectionWithLevels | null;
  getNextSection: () => SectionWithLevels | null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  sections: [],
  userLevels: [],
  currentLevel: null,
  nextLevel: null,

  setSections: (sections) => set({ sections }),
  setUserLevels: (userLevels) => set({ userLevels }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  setNextLevel: (level) => set({ nextLevel: level }),

  findNextLevel: (currentLevelId: string) => {
    const { sections } = get();

    console.log("🔍 findNextLevel called with:", currentLevelId);
    console.log("🔍 Available sections:", sections);

    // Find current level
    let currentLevel: Level | null = null;
    let currentSection: SectionWithLevels | null = null;

    for (const section of sections) {
      const level = section.levels.find((l) => l.id === currentLevelId);
      if (level) {
        currentLevel = level;
        currentSection = section;
        break;
      }
    }

    console.log("🔍 Current level found:", currentLevel);
    console.log("🔍 Current section found:", currentSection);

    if (!currentLevel || !currentSection) {
      console.log("❌ No current level or section found - trying fallback");

      // Fallback: try to find by level number and section number from URL
      // This handles cases where the level ID from API doesn't match stored ID
      const urlParts = window.location.pathname.split("/");
      if (urlParts.length >= 3) {
        const sectionId = urlParts[1];
        const levelId = urlParts[2];

        console.log("🔍 Fallback - sectionId from URL:", sectionId);
        console.log("🔍 Fallback - levelId from URL:", levelId);

        // Find section by ID
        const section = sections.find((s) => s.sectionId === sectionId);
        if (section) {
          console.log("🔍 Fallback - found section:", section);

          // Find level by ID in this section
          const level = section.levels.find((l) => l.id === levelId);
          if (level) {
            currentLevel = level;
            currentSection = section;
            console.log("🔍 Fallback - found level:", level);
          }
        }
      }

      if (!currentLevel || !currentSection) {
        console.log(
          "❌ Fallback also failed - no current level or section found"
        );
        return null;
      }
    }

    // Find next level in same section
    const nextLevelInSection = currentSection.levels.find(
      (l) => l.levelNumber === currentLevel!.levelNumber + 1
    );

    console.log("🔍 Next level in same section:", nextLevelInSection);

    if (nextLevelInSection) return nextLevelInSection;

    // If no next level in same section, find first level of next section
    const nextSection = sections.find(
      (s) => s.sectionNumber === currentSection!.sectionNumber + 1
    );

    console.log("🔍 Next section found:", nextSection);
    console.log("🔍 Current section number:", currentSection!.sectionNumber);
    console.log(
      "🔍 Looking for section number:",
      currentSection!.sectionNumber + 1
    );
    console.log(
      "🔍 All available section numbers:",
      sections.map((s) => s.sectionNumber)
    );

    if (nextSection && nextSection.levels.length > 0) {
      console.log(
        "🔍 Returning first level of next section:",
        nextSection.levels[0]
      );
      return nextSection.levels[0]; // First level of next section
    }

    // If no next level found, user is at the last level of the last section
    console.log("❌ No next level found - user is at the last level");
    console.log(
      "🔍 Current section is the last section:",
      currentSection!.sectionNumber
    );
    console.log("🔍 Total sections available:", sections.length);
    return null;
  },

  // Helper function to check if a level is the last level
  isLastLevel: (levelId: string) => {
    const { sections } = get();

    // Find current level and section
    let currentLevel: Level | null = null;
    let currentSection: SectionWithLevels | null = null;

    for (const section of sections) {
      const level = section.levels.find((l) => l.id === levelId);
      if (level) {
        currentLevel = level;
        currentSection = section;
        break;
      }
    }

    if (!currentLevel || !currentSection) return false;

    // Check if there's a next level in the same section
    const nextLevelInSection = currentSection.levels.find(
      (l) => l.levelNumber === currentLevel!.levelNumber + 1
    );

    if (nextLevelInSection) return false;

    // Check if there's a next section with levels
    const nextSection = sections.find(
      (s) => s.sectionNumber === currentSection!.sectionNumber + 1
    );

    if (nextSection && nextSection.levels.length > 0) return false;

    // If we reach here, this is the last level
    return true;
  },

  getSectionByLevelId: (levelId: string) => {
    const { sections } = get();
    return (
      sections.find((section) =>
        section.levels.some((level) => level.id === levelId)
      ) || null
    );
  },

  getCurrentSection: () => {
    const { currentLevel, sections } = get();
    if (!currentLevel) return null;

    return (
      sections.find((section) =>
        section.levels.some((level) => level.id === currentLevel.id)
      ) || null
    );
  },

  getNextSection: () => {
    const { currentLevel, sections } = get();
    if (!currentLevel) return null;

    const currentSection = get().getCurrentSection();
    if (!currentSection) return null;

    return (
      sections.find(
        (s) => s.sectionNumber === currentSection.sectionNumber + 1
      ) || null
    );
  },
}));
